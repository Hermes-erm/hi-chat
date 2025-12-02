import { Schema } from "mongoose";
import { chatAppConnection } from "../connection";

const userSchema: Schema = new Schema(
  {
    userName: { type: String, required: true, unique: true },
    password: { type: String }, // not of high importance for now
    lastSeen: { type: Date },
  },
  { timestamps: true, versionKey: false }
);

const User = chatAppConnection.model("user", userSchema, "user");

export default User;
