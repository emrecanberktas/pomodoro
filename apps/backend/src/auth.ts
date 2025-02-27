import { Hono } from "hono";
import { jwt } from "hono/jwt";
import type { JwtVariables } from "hono/jwt";
import { Pomodoro } from "./models/Pomodoro.js";
import { User } from "./models/User.js";
import bcrypt from "bcrypt";
import { Jwt } from "hono/utils/jwt";
import dotenv from "dotenv";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const auth = new Hono();

dotenv.config();

const JWT_KEY = process.env.JWT_SECRET || "";

const authSchema = z.object({
  email: z.string().email("Invalid Email"),
  password: z.string().min(6, "Password Must Be At Least 6 Characters"),
});

const route = auth.post(
  "/signup",
  zValidator("json", authSchema),
  async (c) => {
    try {
      const { email, password } = await c.req.valid("json");
      console.log("Received", email, password);
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return c.json({ error: "This Email Already In Use" }, 400);
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ email, password: hashedPassword });
      await newUser.save();

      return c.json({ message: "User Created Succesfully" });
    } catch (error) {
      console.error(error);
      return c.json({ error: "Server Error" }, 500);
    }
  }
);

auth.post(
  "/login",
  zValidator("json", z.object({ email: z.string(), password: z.string() })),
  async (c) => {
    try {
      const { email, password } = await c.req.valid("json");
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
      console.error(error);
      return c.json({ error: "Internal Server Error" }, 500);
    }
  }
);

const jwtMiddleware = jwt({ secret: JWT_KEY, alg: "HS256" });

auth.get("/protected", jwtMiddleware, async (c) => {
  const user = c.get("jwtPayload");
  return c.json({ message: "Succesfull Login" }, user);
});

auth.post(
  "/pomodoro",
  jwtMiddleware,
  zValidator(
    "json",
    z.object({
      workTime: z.number().optional(),
      breakTime: z.number().optional(),
    })
  ),
  async (c) => {
    try {
      const { userId } = c.get("jwtPayload");
      const { workTime, breakTime } = c.req.valid("json");

      const pomodoro = new Pomodoro({
        userId,
        workTime: workTime || 25 * 60,
        breakTime: breakTime || 5 * 60,
      });
      await pomodoro.save();

      return c.json({ message: "Pomodoro Created Succesfully", pomodoro }, 201);
    } catch (error) {
      console.error("Pomodoro Save Error", error);
      return c.json({ error: "Internal Server Erorr" }, 500);
    }
  }
);

auth.get("/pomodoro", jwtMiddleware, async (c) => {
  try {
    const { userId } = c.get("jwtPayload");
    const pomodoro = await Pomodoro.findOne({ userId }).sort({ createdAt: -1 });
    if (!pomodoro) {
      return c.json({ message: "Pomodoro Not Found" }, 404);
    }
    return c.json({
      workTime: pomodoro.workTime,
      breakTime: pomodoro.breakTime,
    });
  } catch (error) {
    console.error("Pomodoro Fetch Error", error);
    return c.json({ error: "Internal Server Error" }, 500);
  }
});

export default auth;
