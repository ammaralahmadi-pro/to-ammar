import "dotenv/config";
import restify from "restify";
import {
  CloudAdapter,
  ConfigurationBotFrameworkAuthentication,
  ConfigurationServiceClientCredentialFactory,
  ConversationState,
  MemoryStorage,
  UserState,
} from "botbuilder";
import { HelpdeskBot } from "./bots/helpdeskBot";

const credentialsFactory = new ConfigurationServiceClientCredentialFactory({
  MicrosoftAppId: process.env.MicrosoftAppId,
  MicrosoftAppPassword: process.env.MicrosoftAppPassword,
  MicrosoftAppType: process.env.MicrosoftAppType,
  MicrosoftAppTenantId: process.env.MicrosoftAppTenantId,
});

const botFrameworkAuthentication = new ConfigurationBotFrameworkAuthentication(
  {},
  credentialsFactory
);

const adapter = new CloudAdapter(botFrameworkAuthentication);

adapter.onTurnError = async (context, error) => {
  console.error("[onTurnError]", error);
  await context.sendActivity("عذرًا، حدث خطأ غير متوقع في البوت.");
};

// MemoryStorage مناسب للتطوير المحلي فقط — استبدله بـ BlobsStorage أو CosmosDbPartitionedStorage في الإنتاج
const memoryStorage = new MemoryStorage();
const conversationState = new ConversationState(memoryStorage);
const userState = new UserState(memoryStorage);

const bot = new HelpdeskBot(conversationState, userState, process.env.OAUTH_CONNECTION_NAME!);

const server = restify.createServer();
server.use(restify.plugins.bodyParser());

server.post("/api/messages", async (req, res) => {
  await adapter.process(req, res, (context) => bot.run(context));
});

const port = Number(process.env.PORT ?? 3978);
server.listen(port, () => {
  console.log(`Helpdesk Bot يستمع على http://localhost:${port}/api/messages`);
});
