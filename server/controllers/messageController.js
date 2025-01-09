const express = require("express");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");
const Message = require("../models/messageModels");

const sendmessage = async (req, res) => {
  const { content, chat_id } = req.body;

  try {
    if (!content || !chat_id) {
      return res.status(400).json({ Message: "insufficient data" });
    }
    let newmessage = {
      sender: req.user._id,
      content: content,
      chat: chat_id,
    };
    let message = await Message.create(newmessage);

    message = await message.populate("sender", "name");

    message = await message.populate("chat");

    message = await message.populate("receiver");

    message = await User.populate(message, {
      path: "chat.users",
      select: "name email profilepic",
    });

    const latestmessage = await Chat.findByIdAndUpdate(chat_id, {
      latestmessage: message,
    });

    if (latestmessage) {
      return res.status(200).json({ data: message });
    } else {
      return res
        .status(400)
        .json({ message: "unable to update the latestmessage" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const fetchallmessage = async (socket, body, io) => {
  const { chatid } = body;

  try {
    const message = await Message.find({ chat: chatid })
      .populate("sender", "name  email profilepic")
      .populate("receiver")
      .populate("chat");

    if (message) {
      socket.emit("fetchallmessageresponse", {
        status: "ok",
        data: message,
      });
      io.in(chatid).emit("fetchallmessage_globally", message);
    } else {
      socket.emit("fetchallmessageresponse", {
        status: "error",
        message: "unable to fetch messages",
      });
    }
  } catch (error) {
    console.log(error);
    socket.emit("fetchallmessageresponse", {
      status: "error",
      message: "Internal Server Error",
    });
  }
};
const deleteAllMessage = async (socket, body, io) => {
  const { chatid } = body;

  try {
    const message = await Message.find({ chat: chatid })
      .populate("sender", "name  email")
      .populate("receiver")
      .populate("chat");

    if (message) {
      const afterdelete = await Message.deleteMany({ chat: chatid });

      const chats = await Chat.findOne({ _id: chatid });

      chats.users.map((x) => {
        const userid = x.toString();
        io.to(userid).emit("deleteAllMessage_globally", afterdelete);
      });

      socket.emit("deleteAllMessageresponse", {
        status: "ok",
        data: afterdelete,
      });
    } else {
      socket.emit("deleteAllMessageresponse", {
        status: "error",
        message: "unable to fetch messages",
      });
    }
  } catch (error) {
    console.log(error);
    socket.emit("deleteAllMessageresponse", {
      status: "error",
      message: "Internal Server Error",
    });
  }
};

module.exports = { sendmessage, fetchallmessage, deleteAllMessage };
