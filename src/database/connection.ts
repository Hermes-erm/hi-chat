import mongoose, { Connection } from "mongoose";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const chatAppConnection: Connection = mongoose.createConnection(process.env.MONGO_CHATAPP || "");

const isConnect = (dbConnection: Connection) => {
  dbConnection.on("connected", () => {
    console.log(`${dbConnection.name} connected`);
  });

  dbConnection.on("disconnected", () => {
    console.log(`${dbConnection.name} disconnected`);
  });

  dbConnection.on("error", (err) => {
    console.log(`${dbConnection.name} connection err : `, err);
  });
};

isConnect(chatAppConnection);

export { chatAppConnection };
