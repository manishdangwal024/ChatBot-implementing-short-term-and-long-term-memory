const {Server}=require("socket.io")

function initSocketServer(httpServer){
    const io= new Server(httpServer,{})
    io.on("connection",(socket)=>{
        console.log("New socket connection:",socket.id);

        
    })
}
module.exports=initSocketServer;


require("dotenv").config()
const app= require("./src/app")
const ConnectToDB=require("./src/db/db")
const initSocketServer=require("./src/sockets/socket.server")
const httpServer=require("http").createServer(app);
initSocketServer(httpServer)
ConnectToDB();
httpServer.listen(3000,()=>{
    console.log("Server is running on the port 3000");
})