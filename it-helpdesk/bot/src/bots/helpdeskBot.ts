import { TeamsActivityHandler, TurnContext, ConversationState, UserState, StatePropertyAccessor } from "botbuilder";
import { DialogSet, DialogState } from "botbuilder-dialogs";
import fetch from "node-fetch";
import { MainDialog, API_BASE_URL } from "../dialogs/mainDialog";
import { buildTicketConfirmationCard } from "../cards/newTicketCard";

interface UserProfile {
  lastSsoToken?: string;
}

export class HelpdeskBot extends TeamsActivityHandler {
  private dialog: MainDialog;
  private dialogState: StatePropertyAccessor<DialogState>;
  private userProfileAccessor: StatePropertyAccessor<UserProfile>;

  constructor(
    private conversationState: ConversationState,
    private userState: UserState,
    connectionName: string
  ) {
    super();

    this.dialog = new MainDialog(connectionName, userState);
    this.dialogState = conversationState.createProperty("DialogState");
    this.userProfileAccessor = userState.createProperty("UserProfile");

    this.onMessage(async (context, next) => {
      const value = context.activity.value as { action?: string; title?: string; categoryId?: string; description?: string } | undefined;

      if (value?.action === "submitNewTicket") {
        await this.handleTicketSubmission(context);
      } else if (
        context.activity.text?.includes("تذكرة") ||
        context.activity.text?.toLowerCase().includes("ticket")
      ) {
        const dialogSet = new DialogSet(this.dialogState);
        dialogSet.add(this.dialog);
        const dialogContext = await dialogSet.createContext(context);
        const results = await dialogContext.continueDialog();
        if (results.status === "empty") {
          await dialogContext.beginDialog(this.dialog.id);
        }
      } else {
        await context.sendActivity(
          'مرحبًا 👋 اكتب "تذكرة جديدة" لفتح تذكرة دعم فني، أو "تذاكري" لعرض تذاكرك الحالية.'
        );
      }

      await next();
    });

    this.conversationState = conversationState;
    this.userState = userState;
  }

  private async handleTicketSubmission(context: TurnContext) {
    const profile = await this.userProfileAccessor.get(context, () => ({}));
    const token = profile.lastSsoToken;
    const value = context.activity.value as { title: string; categoryId: string; description: string };

    if (!token) {
      await context.sendActivity('انتهت صلاحية الجلسة. اكتب "تذكرة جديدة" لتسجيل الدخول مجددًا.');
      return;
    }

    const response = await fetch(`${API_BASE_URL}/tickets`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        title: value.title,
        description: value.description,
        categoryId: value.categoryId,
      }),
    });

    if (!response.ok) {
      await context.sendActivity("تعذّر فتح التذكرة. حاول لاحقًا أو تواصل مع الدعم الفني مباشرة.");
      return;
    }

    const ticket = await response.json();
    await context.sendActivity({
      attachments: [
        {
          contentType: "application/vnd.microsoft.card.adaptive",
          content: buildTicketConfirmationCard(ticket),
        },
      ],
    });
  }

  async run(context: TurnContext) {
    await super.run(context);
    await this.conversationState.saveChanges(context, false);
    await this.userState.saveChanges(context, false);
  }
}
