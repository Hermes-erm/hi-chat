import mongoose, { ObjectId } from "mongoose";
import Message from "../database/models/Message";
import User from "../database/models/User";
import Chat from "../database/models/Conversation";

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

async function isChatExists(chatId: string): Promise<boolean> {
  let chat = await Chat.exists({ _id: new mongoose.Types.ObjectId(chatId) });
  if (chat) return true;
  return false;
}

export { isUserExist, saveMessage, isChatExists };
