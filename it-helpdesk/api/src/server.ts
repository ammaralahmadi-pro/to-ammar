import "express-async-errors";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { requireEntraAuth } from "./middleware/auth";
import { ticketsRouter } from "./routes/tickets";
import { commentsRouter } from "./routes/comments";
import { lookupsRouter } from "./routes/lookups";

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("tiny"));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

// كل ما بعد هذا السطر يتطلب رمز دخول صالح صادر من Entra ID
app.use(requireEntraAuth);

app.use("/lookups", lookupsRouter);
app.use("/tickets", ticketsRouter);
app.use("/tickets/:ticketId/comments", commentsRouter);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "خطأ غير متوقع في الخادم" });
});

app.listen(env.port, () => {
  console.log(`Helpdesk API يعمل على http://localhost:${env.port}`);
});
