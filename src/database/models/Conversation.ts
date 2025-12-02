import { Schema } from "mongoose";
import User from "./User";
import { chatAppConnection } from "../connection";

const conversationSchema: Schema = new Schema(
  {
    type: { type: String, required: true, enum: ["direct", "room"] },
    members: [{ member: { type: Schema.Types.ObjectId, ref: User } }],
    roomName: { type: String },
  },
  { timestamps: true, versionKey: false }
);

const Conversation = chatAppConnection.model("conversation", conversationSchema, "conversation");

export default Conversation;
