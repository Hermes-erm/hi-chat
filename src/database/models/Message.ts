import { Schema, Types } from "mongoose";
import { chatAppConnection } from "../connection";
import Chat from "./Conversation";
import User from "./User";

const messageSchema: Schema = new Schema(
  {
    chatId: { type: Schema.Types.ObjectId, ref: Chat, required: true },
    senderId: { type: Schema.Types.ObjectId, ref: User, required: true },
    type: { type: String, enum: ["direct", "room"] },
    content: { type: Schema.Types.Mixed }, // any
    // deliveredTo: { type: [{ type: Schema.Types.ObjectId, ref: User }] }, // for later use
    delivered: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

const Message = chatAppConnection.model("message", messageSchema, "message");

export default Message;
