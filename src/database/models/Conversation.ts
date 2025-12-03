import { Schema } from "mongoose";
import User from "./User";
import { chatAppConnection } from "../connection";

const chatSchema: Schema = new Schema(
  {
    type: { type: String, required: true, enum: ["direct", "room"] },
    members: [{ type: Schema.Types.ObjectId, ref: User }],
    roomName: { type: String },
  },
  { timestamps: true, versionKey: false }
);

const Chat = chatAppConnection.model("conversation", chatSchema, "conversation");

export default Chat;
