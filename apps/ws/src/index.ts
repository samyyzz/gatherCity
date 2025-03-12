import { WebSocketServer } from "ws";
import { User } from "./User";

const wss = new WebSocketServer({ port: 3001 });
wss.on("connection", function connection(ws) {
  let user: User | undefined;
  console.log("user connected");
  user = new User(ws);
  ws.on("error", console.error);

  ws.on("close", () => {
    user?.destroy();
  });
});

console.log('gather.City webSocket server started on port 3001');