import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { connectDB } from "./db.js";
import auth from "./auth.js";
import { cors } from "hono/cors";

const app = new Hono();
const port = 3000;

app.use(
  cors({
    origin: "http://localhost:5173",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.route("/auth", auth);

async function startServer() {
  try {
    console.log("Connecting to database...");
    await connectDB();
    console.log("Database connected successfully");

    console.log(`Starting server on port ${port}...`);
    serve(
      {
        fetch: app.fetch,
        port,
      },
      () => {
        console.log(`✨ Server is running on http://localhost:${port}`);
      }
    );
  } catch (err) {
    console.error("Server start error:", err);
    process.exit(1);
  }
}

startServer();
