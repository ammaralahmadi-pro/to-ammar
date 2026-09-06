import {
  ComponentDialog,
  WaterfallDialog,
  WaterfallStepContext,
  DialogTurnResult,
} from "botbuilder-dialogs";
import { TeamsBotSsoPromptSettings, StatePropertyAccessor, UserState } from "botbuilder";
import fetch from "node-fetch";
import { buildNewTicketCard, buildTicketConfirmationCard } from "../cards/newTicketCard";

const SSO_PROMPT_ID = "TeamsSsoPrompt";
const WATERFALL_ID = "mainWaterfall";
const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:3000";

interface UserProfile {
  lastSsoToken?: string;
}

/**
 * حوار البوت الرئيسي: يبدأ بمصادقة SSO (بدون أي كلمة مرور يكتبها الموظف)،
 * ثم يعرض نموذج فتح تذكرة، ثم يرسل البيانات إلى الـ Helpdesk API باستخدام
 * نفس توكن Entra ID الذي حصل عليه عبر SSO.
 */
export class MainDialog extends ComponentDialog {
  private userProfileAccessor: StatePropertyAccessor<UserProfile>;

  constructor(connectionName: string, userState: UserState) {
    super("MainDialog");
    this.userProfileAccessor = userState.createProperty("UserProfile");

    const ssoSettings: TeamsBotSsoPromptSettings = {
      connectionName,
      // النطاق المطلوب من الـ API نفسه (access_as_user) — يُعرَّف في تسجيل تطبيق الـ API في Entra ID
      scopes: ["access_as_user"],
      timeout: 900000,
      endOnInvalidMessage: true,
    };

    // ملاحظة: TeamsBotSsoPrompt متاح ضمن حزمة botbuilder الحديثة (M365 Agents / Teams AI SDK)؛
    // إن كانت نسختكم لا تتضمنه استخدموا OAuthPrompt القياسي بنفس connectionName كبديل مباشر.
    this.addDialog(new (require("botbuilder").TeamsBotSsoPrompt)(SSO_PROMPT_ID, ssoSettings));

    this.addDialog(
      new WaterfallDialog(WATERFALL_ID, [
        this.promptSsoStep.bind(this),
        this.showNewTicketFormStep.bind(this),
        this.submitTicketStep.bind(this),
      ])
    );

    this.initialDialogId = WATERFALL_ID;
  }

  private async promptSsoStep(step: WaterfallStepContext): Promise<DialogTurnResult> {
    return step.beginDialog(SSO_PROMPT_ID);
  }

  private async showNewTicketFormStep(step: WaterfallStepContext): Promise<DialogTurnResult> {
    const tokenResponse = step.result;
    if (!tokenResponse?.token) {
      await step.context.sendActivity("تعذّر تسجيل الدخول. حاول مجددًا لاحقًا.");
      return step.endDialog();
    }

    step.values.accessToken = tokenResponse.token;
    const profile = await this.userProfileAccessor.get(step.context, () => ({}));
    profile.lastSsoToken = tokenResponse.token;
    await this.userProfileAccessor.set(step.context, profile);

    const categories = await fetch(`${API_BASE_URL}/lookups/categories`, {
      headers: { Authorization: `Bearer ${tokenResponse.token}` },
    }).then((r) => r.json());

    await step.context.sendActivity({
      attachments: [
        {
          contentType: "application/vnd.microsoft.card.adaptive",
          content: buildNewTicketCard(categories),
        },
      ],
    });

    // ينتظر التوقيع التالي القادم من إرسال البطاقة (Action.Submit) عبر onMessage في helpdeskBot.ts
    return step.endDialog();
  }

  private async submitTicketStep(): Promise<DialogTurnResult> {
    return { status: 1 } as unknown as DialogTurnResult; // غير مُستخدمة مباشرة؛ الاستلام يتم في helpdeskBot.ts
  }
}

export { API_BASE_URL };
