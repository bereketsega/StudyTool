import express from "express";
import cors from "cors";
import GeminiRoute from "./routes/gemini.routes.js";

export class Server {
  app;
  appServer = null;

  static start() {
    this.app = express();
    this.app.use(express.json({ limit: "50mb" }));
    this.app.use(express.urlencoded({ limit: "50mb", extended: true }));
    this.middleware();
    this.setPort();
    this.routes();

    return this.app;
  }

  static setPort() {
    this.app.set("port", process.env.PORT || 3001);
  }

  static routes() {
    this.app.use("/api/gemini", GeminiRoute);
  }

  static middleware() {
    this.app.use(express.json());
    this.app.use(cors());
  }

  static async listen(port) {
    this.appServer = this.app.listen(this.app.get("port") || port);

    this.app.get("/", (req, res) => {
      res.json({ message: "Welcome to Study Tool API" });
    });
    console.log("SERVER RUNNING ON PORT ", this.app.get("port"));
  }

  static async close() {
    this.appServer.close();
    console.log("SERVER CLOSED");
  }
}
