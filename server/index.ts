import "dotenv/config";
import express, { Express } from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import apiRouter from "./routes/index";
import { initializeLogs } from "./routes/logs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function createServer(): Promise<Express> {
  const app = express();
  await setupRoutes(app);
  return app;
}

export async function setupRoutes(app: Express) {
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  const uploadsDir = process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads");
  app.use("/uploads", express.static(uploadsDir));

  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../spa")));
  }

  app.use("/api", apiRouter);

  initializeLogs();

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.get("/api/ping", (_req, res) => {
    res.json({ message: "ping", timestamp: new Date().toISOString() });
  });

  if (process.env.NODE_ENV === "production") {
    app.get("*", (_req, res) => {
      res.sendFile(path.join(__dirname, "../spa/index.html"));
    });
  }
}

// Note: Server startup is handled by production-server.js in production
// and by Vite dev server in development
