import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../database/models/User";
import dotenv from "dotenv";
import Chat from "../database/models/Conversation";
import mongoose from "mongoose";
import Message from "../database/models/Message";

dotenv.config({ quiet: true });

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined = req.cookies._token;

  if (!token) return res.status(401).json({ message: "Unauthorized", success: false });

  jwt.verify(token, process.env.JWT_SECRET_KEY || "", (err, decoded) => {
    if (err) return res.status(401).json({ message: "Unauthorized", success: false });
    // let { _id, name } = decoded as any;
    next();
  });
};

// [Middleware]

const createUser = async (req: Request, res: Response) => {
  const { name, password } = req.body;

  let isUserExist = await User.exists({ userName: name });
  if (isUserExist) {
    res.status(409).json({ message: "user-name already exists", success: false });
    return;
  }

  await new User({ userName: name, password }).save();

  res.status(201).json({ message: "User created", success: true });
};

const login = async (req: Request, res: Response) => {
  const { name, password } = req.body;

  let user = await User.findOne({ userName: name, password });
  if (!user) {
    res.status(401).json({ message: "User not found", success: false });
    return;
  }

  let token = jwt.sign({ _id: user._id, name: name }, process.env.JWT_SECRET_KEY || "");

  res
    .cookie("_token", token, {
      httpOnly: true,
      sameSite: "none",
      secure: false,
    })
    .json({ token: token, data: user, message: "Logged in successfully, token sent!", success: true });
};

const createRoom = async (req: Request, res: Response) => {
  const { sender, roomName } = req.body;
  if (await Chat.exists({ roomName }))
    return res.status(409).json({ message: "Room name already exists", success: false });

  let room = await Chat.create({ roomName, members: [new mongoose.Types.ObjectId(sender)], type: "room" });

  res.status(201).json({ message: "Room created", room, success: true });
};

const roomMembers = async (req: Request, res: Response) => {
  const roomId = req.params.roomId;

  let users = await Chat.findOne({ _id: roomId }, { members: 1, _id: 0 }).populate({
    path: "members",
    model: User,
    select: { _id: 1, userName: 1, createdAt: 1, updatedAt: 1 },
  });

  res.status(200).json({ users: users?.members, success: true });
};

const userChat = async (req: Request, res: Response) => {
  const senderId = req.params.userId;

  let chat = await Message.find({ senderId });
  return res.status(200).json({ chat });
};

const chatHistory = async (req: Request, res: Response) => {
  const chatId = req.params.chatId;
  if (!(await Chat.exists({ _id: chatId }))) return res.status(404).end();
  const { limit } = req.query;
  let before = req.query.before as string;

  let lastbefore: Date = before ? new Date(before) : new Date();

  let chats = await Message.find(
    { chatId, createdAt: { $lte: lastbefore } },
    { _id: 0, content: 1, senderId: 1, createdAt: 1 }
  )
    .sort({ createdAt: 1 })
    .limit(Number(limit));

  res.status(200).json({ chats });
};

export { verifyToken, createUser, login, createRoom, roomMembers, userChat, chatHistory };
