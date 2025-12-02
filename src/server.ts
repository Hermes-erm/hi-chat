import dotenv from "dotenv";
import { httpServer } from "./socket/socket";

dotenv.config({ quiet: true });

httpServer.listen(process.env.PORT, () => {
  console.log("Server is up!");
});
