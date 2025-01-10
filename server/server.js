let express = require("express")
let mongoose = require("mongoose")
let cors = require("cors")
let cookieparser = require("cookie-parser")
const userrouter = require("./Routes/Userrouter")
const onlinerouter = require("./Routes/onlinerouter")
const chatrouter = require("./Routes/chatrouter")
const messagerouter = require("./Routes/messagerouter")
const socketauth = require("./middleware/SocketAuth")
const socketrouter = require("./Routes/socketrouter")
const path =require("path")
require("dotenv").config()
let app = express()
// http cors
app.use(cors())
app.use(cookieparser())
app.use(express.json())
app.use(express.static('Photos'))

const {Server}= require("socket.io")
const {createServer}=require("http")
// socket cors
const allowedorigins =  ["http://localhost:3000"]
const httpserver = createServer(app)
const io = new Server(httpserver, {
  cors: {
    origin: (origin, callback) => {
      if (allowedorigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["content-type", "Authorization"],
    credentials: true,
  },
  
  maxHttpBufferSize: 10 * 1024 * 1024, // Sets the maximum payload size to 10 MB
});

io.use(socketauth)
io.on("connection",(socket)=>{
  console.log("Socket connected:", socket.id);
  
  socketrouter.routes(socket,io)
})
const connectdb = async()=>{
  try{
  const connect = await mongoose.connect(process.env.MONGO_URI)
   if(connect){
    console.log("server is connected to db");
    
   }
   else{
    console.log("server is failed to connect to db");
   }

  }
  catch(error){
    console.log(error);
    
  }
}
connectdb()
app.use("/api/entry",userrouter)
app.use("/api/onlineusers",onlinerouter)
app.use("/api/chatroutes",chatrouter)
app.use("/api/message",messagerouter)

httpserver.listen(process.env.PORT,()=>{
  console.log(`server ${process.env.PORT} is connected`);
  
})