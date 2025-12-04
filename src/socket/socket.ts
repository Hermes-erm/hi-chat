import { Socket } from "socket.io";
import { createServer } from "http";
import { Namespace, Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";

import { instrument } from "@socket.io/admin-ui";
import { app, client, pub, sub } from "../app";
import { verifyToken } from "../controller/socketMiddleware";
import chatService from "../services/chat.service";
import Chat from "../database/models/Conversation";
import mongoose from "mongoose";

const httpServer = createServer(app);

const io = new Server(httpServer, {
  adapter: createAdapter(pub, sub),
  cors: {
    origin: "*",
    credentials: true,
  },
});

// instrument(io, { auth: false });

const chat: Namespace = io.of("/chat");

chat.use(verifyToken);

chat.on("connection", async (socket: Socket) => {
  let { userId, userName } = socket.user;
  await client.set(userId, socket.id);

  // [join room]
  socket.on("join:room", async (payload, ack) => {
    let senderId: string = userId;
    let chatId: string | undefined = payload.chatId;

    if (chatId && !(await chatService.isChatExists(chatId))) {
      if (ack) ack({ message: "room not found" });
      return;
    }

    if (!chatId) {
      let sender = new mongoose.Types.ObjectId(senderId);
      let chat: any = await Chat.create({ type: "room", members: [sender] });
      chatId = chat._id;
    } else await chatService.addMemberIfNotExists(chatId, senderId);

    socket.join(`room:${chatId}`);
  });

  // [ one:one chat ]
  socket.on("message:chat", async (payload, ack) => {
    if (!payload.toUserId) if (ack) ack({ message: "Recipient not found", ok: true });

    let senderId: string = userId;

    let chatId: any = payload.chatId; // optional
    let toUserId: string = payload.toUserId;
    let content: any = payload.content;

    if (!(await chatService.isUserExist(toUserId))) {
      if (ack) ack({ message: "Recipient not found", ok: true });
      return;
    }

    if (!chatId) chatId = await chatService.createChatIfNotExists("direct", [senderId, toUserId]);

    await chatService.saveMessage(content, chatId, senderId);

    let recipient: any | null = await client.get(toUserId);

    if (recipient) socket.to(recipient).emit("message", { message: content, from: userName });
  });

  // [room chat]
  socket.on("message:room", async (payload, ack) => {
    let senderId: string = userId;

    let chatId: any = payload.chatId; // optional
    let content: any = payload.content;

    if (!chatId) return;

    let message = await chatService.saveMessage(content, chatId, senderId);

    socket.to(`room:${chatId}`).emit("message", { message: message.content, from: userName });
  });

  socket.on("leave:room", ({ chatId }) => {
    socket.leave(`room:${chatId}`);
  });

  socket.on("disconnect", async () => {
    await client.del(socket.user.userId);
    socket.user = {}; // redundant
  });
});

export { chat, httpServer };
