import { Socket } from "socket.io";
import { createServer } from "http";
import { Namespace, Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";

import { instrument } from "@socket.io/admin-ui";
import { app, pub, sub } from "../app";
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

chat.on("connection", (socket: Socket) => {
  let { userId, userName } = socket.user;

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
    let toUserId: string = payload.toUserId;
    let chatId: any = payload.chatId;
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

    socket.to(`chat:${chatId}`).emit("message", { message: message.content }); // to(socketId | userId)
  });

  socket.on("message:room", (payload, ack) => {});

  // socket.on("leave", ({ chatId }) => {
  //   socket.leave(`chat:${chatId}`);
  // });

  socket.on("disconnect", () => {
    socket.user = {};
  });
});

export { chat, httpServer };
