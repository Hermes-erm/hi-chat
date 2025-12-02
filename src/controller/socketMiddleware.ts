import jwt from "jsonwebtoken";
import User from "../database/models/User";
import dotenv from "dotenv";
import { Socket } from "socket.io";
import { NextFunction } from "connect";

dotenv.config({ quiet: true });

const verifyToken = (socket: Socket, next: NextFunction) => {
  let token: string | undefined = socket.handshake.headers.token as string;

  if (!token) {
    next(new Error("Unauthorized"));
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY || "", (err, decoded) => {
    if (err) {
      next(new Error("Unauthorized"));
      return;
    }

    let { _id, name } = decoded as any;
    socket.user = { userId: _id, userName: name };

    next();
  });
};

export { verifyToken };
