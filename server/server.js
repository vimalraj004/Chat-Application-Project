let express = require("express");
let mongoose = require("mongoose");
let cors = require("cors");
let cookieparser = require("cookie-parser");
const userrouter = require("./Routes/Userrouter");
const onlinerouter = require("./Routes/onlinerouter");
const chatrouter = require("./Routes/chatrouter");
const messagerouter = require("./Routes/messagerouter");
const socketauth = require("./middleware/SocketAuth");
const socketrouter = require("./Routes/socketrouter");
const path = require("path");
require("dotenv").config();

let app = express();

// CORS configuration
const allowedorigins = ["https://chat-application-project-orpin.vercel.app", "http://localhost:3000","https://everfine.shop"];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests from allowed origins and also handle requests without origin (e.g., Postman, etc.)
    if (!origin || allowedorigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Allow cookies and authentication headers
};

app.use(cors(corsOptions)); // Use CORS with the configured options
app.use(cookieparser());
app.use(express.json());
app.use(express.static('Photos'));
app.use(express.json({ limit: '10mb' })); // Adjust the limit if needed

const { Server } = require("socket.io");
const { createServer } = require("http");

// Socket.IO server setup
const httpserver = createServer(app);
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

io.use(socketauth);
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  socketrouter.routes(socket, io);
});

// MongoDB connection setup
const connectdb = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGO_URI);
    if (connect) {
      console.log("Server is connected to the database");
    } else {
      console.log("Server failed to connect to the database");
    }
  } catch (error) {
    console.error("Database connection error:", error);
  }
};

connectdb();

// Routes setup
app.use("/api/entry", userrouter);
app.use("/api/onlineusers", onlinerouter);
app.use("/api/chatroutes", chatrouter);
app.use("/api/message", messagerouter);
app.use("/Photos/Images", express.static(path.join(__dirname, "../Photos/Images")));

// Server listening
httpserver.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
