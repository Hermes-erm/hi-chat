import cors from "cors";
import Redis from "ioredis";
import cookieParser from "cookie-parser";
import express, { Application, Request, Response } from "express";
import {
  chatHistory,
  createRoom,
  createUser,
  login,
  roomMembers,
  userChat,
  verifyToken,
} from "./controller/apiController";

// [express-app]
const app: Application = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());

// [Redis client]
const REDIS_URL = process.env.REDIS_URL || "";

const pub: Redis = new Redis(REDIS_URL);
const sub: Redis = new Redis(REDIS_URL); // or duplicate existing instance => pub.duplicate() [new Redis(url)]
const client: Redis = new Redis(REDIS_URL);

// [API]

app.get("/", verifyToken);

app.get("/health", (req: Request, res: Response) => {
  res.json({ ok: true });
});

app.post("/new-user", createUser);
app.post("/login", login);

app.get("/chat/members/:roomId", roomMembers);
app.get("/chat/user/:userId", userChat);
app.get("/chat/history/:chatId", chatHistory);

app.post("/chat/room", createRoom);

export { app, pub, sub, client };
