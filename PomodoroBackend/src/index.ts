import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { connectDB } from "./db.js";
import dotenv from "dotenv";
import auth from "./auth.js";
const app = new Hono();
const port = 3000;

export type AppType = typeof auth;

// app.get("/", (c) => {
//   return c.text("Hello Hono!");
// });

// console.log(`Server is running on http://localhost:${port}`);

connectDB();

app.route("/auth", auth);

serve({
  fetch: app.fetch,
  port,
});
