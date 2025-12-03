import mongoose, { ObjectId } from "mongoose";
import Message from "../database/models/Message";
import User from "../database/models/User";

async function isUserExist(toUserId: string): Promise<boolean> {
  let user = await User.exists({ _id: new mongoose.Types.ObjectId(toUserId) });
  if (user) return true;
  return false;
}

async function saveMessage(message: any, chatId: string, senderId: string): Promise<any> {
  const msg: any = await new Message({
    chatId: new mongoose.Types.ObjectId(chatId),
    senderId: new mongoose.Types.ObjectId(senderId),
    content: message,
  }).save();
  return msg;
}

export { isUserExist, saveMessage };
