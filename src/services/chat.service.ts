import mongoose, { ObjectId } from "mongoose";
import Message from "../database/models/Message";
import User from "../database/models/User";
import Chat from "../database/models/Conversation";

class ChatService {
  constructor() {}

  async isUserExist(toUserId: string): Promise<boolean> {
    let user = await User.exists({ _id: new mongoose.Types.ObjectId(toUserId) });
    if (user) return true;
    return false;
  }

  async saveMessage(message: any, chatId: string, senderId: string): Promise<any> {
    const msg: any = await new Message({
      chatId: new mongoose.Types.ObjectId(chatId),
      senderId: new mongoose.Types.ObjectId(senderId),
      content: message,
    }).save();
    return msg;
  }

  async isChatExists(chatId: string): Promise<boolean> {
    let chat = await Chat.exists({ _id: new mongoose.Types.ObjectId(chatId) });
    if (chat) return true;
    return false;
  }

  async createChatIfNotExists(chatType: "direct" | "room", members: string[]): Promise<string> {
    let sender = new mongoose.Types.ObjectId(members[0]);
    let toUser = new mongoose.Types.ObjectId(members[1]);

    let chat: any = await Chat.findOne({ members: { $all: [sender, toUser] } });
    if (!chat) chat = await Chat.create({ type: chatType, members: [sender, toUser] });
    return chat._id;
  }
}

export default new ChatService();
