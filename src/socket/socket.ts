import { Socket } from "socket.io";
import { createServer } from "http";
import { Namespace, Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";

import { instrument } from "@socket.io/admin-ui";
import { app, pub, sub } from "../app";
import { verifyToken } from "../controller/socketMiddleware";

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

  socket.on("message", (data) => {});
});

export { chat, httpServer };
