import { ClientSecretCredential } from "@azure/identity";
import { Client } from "@microsoft/microsoft-graph-client";
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";
import { env } from "../config/env";

// اتصال حقيقي بـ Microsoft Graph عبر Client Credentials (تطبيق-إلى-تطبيق) —
// يتطلب Admin Consent على الصلاحيات المذكورة في README (القسم ١٤ من وثيقة المتطلبات).
const credential = new ClientSecretCredential(
  env.graphTenantId,
  env.graphClientId,
  env.graphClientSecret
);

const authProvider = new TokenCredentialAuthenticationProvider(credential, {
  scopes: ["https://graph.microsoft.com/.default"],
});

const graphClient = Client.initWithMiddleware({ authProvider });

/** يرسل رسالة Teams تلقائية للوكيل عند إسناد/تحديث تذكرة. */
export async function notifyAgentOnTeams(agentEntraOid: string, message: string) {
  // ينشئ (أو يعيد استخدام) محادثة 1:1 بين حساب التطبيق والوكيل، ثم يرسل الرسالة.
  const chat = await graphClient.api("/chats").post({
    chatType: "oneOnOne",
    members: [
      {
        "@odata.type": "#microsoft.graph.aadUserConversationMember",
        roles: ["owner"],
        "user@odata.bind": `https://graph.microsoft.com/v1.0/users('${agentEntraOid}')`,
      },
    ],
  });

  await graphClient.api(`/chats/${chat.id}/messages`).post({
    body: { contentType: "html", content: message },
  });
}

/** إشعار بريدي احتياطي عند تعذّر إرسال رسالة Teams. */
export async function notifyAgentByEmail(agentEmail: string, subject: string, htmlBody: string) {
  await graphClient.api(`/users/${env.graphClientId}/sendMail`).post({
    message: {
      subject,
      body: { contentType: "HTML", content: htmlBody },
      toRecipients: [{ emailAddress: { address: agentEmail } }],
    },
  });
}
