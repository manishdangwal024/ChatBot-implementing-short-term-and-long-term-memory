const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const { generateResponse, generateVector } = require("../service/ai.service");
const messageModel = require("../models/message.model");
const { createMemory, queryMemory } = require("../service/vector.service");

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {});

  io.use(async (socket, next) => {
    const cookies = cookie.parse(socket.handshake.headers?.cookie || "");

    console.log("Socket connection cookies:", cookies);

    if (!cookies.token) {
      next(new Error("Authentication error : no token provided"));
    }
    try {
      const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);

      const user = await userModel.findById(decoded.id);

      socket.user = user;

      next();
    } catch (error) {
      next(new Error("Authentication error:Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    // console.log("New socket connection:",socket.id);
    // console.log("user connected",socket.user)

    socket.on("ai-message", async (messagePayload) => {
      // messagePayload:={chatID:chatID,content:messageTXt}

      const message = await messageModel.create({
        chat: messagePayload.chat,
        user: socket.user._id,
        content: messagePayload.content,
        role: "user",
      });

      const vectors = await generateVector(messagePayload.content);
      // console.log(vectors);  array of object  ==> array

      await createMemory({
        vectors,
        messageId: message._id,
        metadata: {
          chat: messagePayload.chat,
          user: socket.user._id,
          text: messagePayload.content,
        },
      });

      const memory = await queryMemory({
        queryVector,
        limit: 3,
        metadata: {
          user:socket.user._id
        },
      });

      const chatHistory = (
        await messageModel
          .find({
            chat: messagePayload.chat,
          })
          .sort({ createdAt: -1 })
          .limit(4)
          .lean()
      ).reverse();

      const stm = chatHistory.map((item) => {
        return {
          role: item.role,
          parts: [{ text: item.content }],
        };
      });

      const ltm = [
        {
          role:"system",  //user
          parts:[{text:`
            thsese are some previous messages from the chats ,use them to generate response
            ${memory.map(item=>item.metadata.text).join("/n")}
            `}]
        }
      ]


      const response = await generateResponse([...ltm,...stm]);

      const responseMessage = await messageModel.create({
        chat: messagePayload.chat,
        user: socket.user._id,
        content: response,
        role: "model",
      });

      const responseVector = await generateVector(response);

      await createMemory({
        vectors: responseVector,
        messageId: responseMessage._id,
        metadata: {
          chat: messagePayload.chat, //chatid
          user: socket.user._id,
          text: response,
        },
      });

      socket.emit("ai-response", {
        content: response,
        chat: messagePayload.chat,
      });
    });
  });
}
module.exports = initSocketServer;
