import { Socket } from "socket.io";
import { createServer } from "http";
import { Namespace, Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";

import { instrument } from "@socket.io/admin-ui";
import { app, client, pub, sub } from "../app";
import { verifyToken } from "../controller/socketMiddleware";
import { isUserExist, saveMessage } from "../services/apiService";
import Chat from "../database/models/Conversation";
import mongoose, { ObjectId } from "mongoose";

const httpServer = createServer(app);
const io = new Server(httpServer, {
  adapter: createAdapter(pub, sub),
  cors: { origin: "*" },
});

// instrument(io, { auth: false });

const chat: Namespace = io.of("/chat");

chat.use(verifyToken);

chat.on("connection", async (socket: Socket) => {
  let { userId, userName } = socket.user;
  await client.set(userId, socket.id);

  socket.on("join:chat", (payload) => {
    const chatId: string | undefined = payload.chatId;
    if (!chatId) return;
    socket.join(`chat:${chatId}`);
  });

  socket.on("join:room", ({ roomId }) => {
    socket.join(`room:${roomId}`);
  });

  socket.on("message:chat", async (payload, ack) => {
    if (!payload.toUserId) if (ack) ack({ message: "Recipient not found", ok: true });

    let senderId: string = userId;

    let chatId: any = payload.chatId; // optional
    let toUserId: string = payload.toUserId;
    let content: any = payload.content;

    if (!(await isUserExist(toUserId))) {
      if (ack) ack({ message: "Recipient not found", ok: true });
      return;
    }

    if (!chatId) {
      let sender = new mongoose.Types.ObjectId(senderId);
      let toUser = new mongoose.Types.ObjectId(toUserId);

      let chat = await Chat.findOne({ members: { $all: [sender, toUser] } });
      if (!chat) chat = await Chat.create({ type: "direct", members: [sender, toUser] });
      chatId = chat._id;
    }

    await saveMessage(content, chatId, senderId);

    let recipient: any | null = await client.get(toUserId);

    if (recipient) socket.to(recipient).emit("message", { message: content });
  });

  socket.on("message:room", async (payload, ack) => {
    if (!payload.toUserId) if (ack) ack({ message: "Recipient not found", ok: true });

    let senderId: string = userId;

    let chatId: any = payload.chatId; // optional
    let toUserId: string = payload.toUserId;
    let content: any = payload.content;

    if (!(await isUserExist(toUserId))) {
      if (ack) ack({ message: "Recipient not found", ok: true });
      return;
    }

    if (!chatId) {
      let sender = new mongoose.Types.ObjectId(senderId);
      let toUser = new mongoose.Types.ObjectId(toUserId);

      let chat = await Chat.findOne({ members: { $all: [sender, toUser] } });
      if (!chat) chat = await Chat.create({ type: "direct", members: [sender, toUser] });
      chatId = chat._id;
    }

    let message = await saveMessage(content, chatId, senderId);

    let recipient: any | null = await client.get(toUserId);
    console.log(recipient);

    // socket.to(`chat:${chatId}`).emit("message", { message: message.content }); // to(socketId | userId)
    if (recipient) socket.to(recipient).emit("message", { message: content });
  });

  // socket.on("leave", ({ chatId }) => {
  //   socket.leave(`chat:${chatId}`);
  // });

  socket.on("disconnect", async () => {
    await client.del(socket.user.userId);
    socket.user = {}; // redundant
  });
});

export { chat, httpServer };
