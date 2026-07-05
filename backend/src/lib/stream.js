import { StreamChat } from "stream-chat";
import "dotenv/config";

console.log("STEAM_API_KEY:", process.env.STEAM_API_KEY);
console.log("STEAM_API_SECRET:", process.env.STEAM_API_SECRET);

const apiKey = process.env.STEAM_API_KEY;
const apiSecret = process.env.STEAM_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error("❌ Stream API key or Secret is missing");
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export default streamClient;