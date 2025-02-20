import { Hono } from "hono";
import { jwt } from "hono/jwt";
import type { JwtVariables } from "hono/jwt";
import { User } from "./models/User.js";
import bcrypt from "bcrypt";
import { Jwt } from "hono/utils/jwt";
import dotenv from "dotenv";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const auth = new Hono();

dotenv.config();

const JWT_KEY = process.env.JWT_SECRET || "";

const route = auth.post(
  "/signup",
  zValidator(
    "form",
    z.object({
      email: z.string(),
      password: z.string(),
    })
  ),
  async (c) => {
    try {
      const { email, password } = await c.req.json();
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return c.json({ error: "This Email Already In Use" }, 400);
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ email, password: hashedPassword });
      await newUser.save();

      return c.json({ message: "User Created Succesfully" });
    } catch (error) {
      return c.json({ error: "Server Error" }, 500);
    }
  }
);

auth.post(
  "/login",
  zValidator("form", z.object({ email: z.string(), password: z.string() })),
  async (c) => {
    try {
      const { email, password } = await c.req.json();
      const user = await User.findOne({ email });
      if (!user) {
        return c.json({ error: "Wrong Email or Password" }, 401);
      }
      // TODO type error düzelt
      // @ts-ignore
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return c.json({ error: "Wrong Email or Password" }, 401);
      }

      const token = await Jwt.sign(
        { UserId: user._id, email: user.email },
        JWT_KEY
      );
      return c.json({ token });
    } catch (error) {
      return c.json({ error: "Internal Server Error" }, 500);
    }
  }
);

const jwtMiddleware = jwt({ secret: JWT_KEY, alg: "HS256" });

auth.get("/protected", jwtMiddleware, async (c) => {
  const user = c.get("jwtPayload");
  return c.json({ message: "Succesfull Login" }, user);
});

export default auth;
