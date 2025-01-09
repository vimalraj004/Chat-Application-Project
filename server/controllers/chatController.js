const express = require("express");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");
const Message = require("../models/messageModels");
const fs = require("fs");
const path = require("path");

const accesschat = async (req, res) => {
  const { userID } = req.body;

  try {
    if (!userID) {
      return res.status(400).json({ message: "userId is missing " });
    } else {
      let ischat = await Chat.findOne({
        isgroupchat: false,
        $and: [
          { users: { $elemMatch: { $eq: req.user._id } } },
          { users: { $elemMatch: { $eq: userID } } },
        ],
      })
        .populate("users", "-password")
        .populate("latestmessage");

      ischat = await User.populate(ischat, {
        path: "latestmessage.sender",
        select: "name email",
      });

      if (ischat?.length > 0) {
        return res.status(200).json({ data: ischat[0] });
      } else {
        let chatdata = {
          chatname: "sender",
          isgroupchat: false,
          users: [req.user._id, userID],
        };
        const createdchat = await Chat.create(chatdata);
        const fullchat = await Chat.findOne({ _id: createdchat._id }).populate(
          "users",
          "-password"
        );

        if (fullchat) {
          return res.status(200).json({ data: fullchat });
        } else {
          return res
            .status(400)
            .json({ message: "No chat exists between these users" });
        }
      }
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: error, message: "Internal Server Error" });
  }
};

const fetchallchats = async (socket, io) => {
  try {
    let ischat = await Chat.find({
      users: { $elemMatch: { $eq: socket.user._id } },
    })
      .populate("users", "-password")
      .populate("groupadmin", "-password")
      .populate("latestmessage")
      .sort({ updatedAt: -1 });
    if (ischat) {
      ischat = await User.populate(ischat, {
        path: "latestmessage.sender",
        select: "name email",
      });
      // return res.status(200).json({data:ischat})

      const roomid = socket.user._id.toString();
      io.in(roomid).emit("fetchallchatsresponse_globally", ischat);

      socket.emit("fetchallchatsresponse", {
        status: "ok",
        data: ischat,
      });
    } else {
      // return res.status(400).json({ message: "No chat exists between these users" });
      socket.emit("fetchallchatsresponse", {
        status: "error",
        message: "No chat exists for this user",
      });
    }
  } catch (error) {
    console.log(error);
    socket.emit("fetchallchatsresponse", {
      status: "error",
      message: "Internal Server Error",
    });
  }
};

const createGroupDp = async (req, res) => {
  const groupdp = req.file.filename;

  try {
    if (groupdp) {
      return res.status(200).json({ data: groupdp });
    } else {
      return res.status(400).json({ message: "Failed to store the GroupDP" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ messae: "Internal Server Error" });
  }
};
const creategroup = async (socket, body, io) => {
  const { name, users, groupDp } = body;

  try {
    if (!name || !users) {
      socket.emit("creategroupresponse", {
        status: "error",
        message: "data insufficient",
      });
    }
    users.push(socket.user._id);

    const groupchat = await Chat.create({
      chatname: name,
      isgroupchat: true,
      users: users,
      groupadmin: socket.user,
      groupdp: groupDp,
    });

    if (groupchat) {
      const fullgroupchat = await Chat.find({ _id: groupchat._id })
        .populate("users", "-password")
        .populate("groupadmin", "-password");

      const exceptadmin = fullgroupchat.flatMap((group) =>
        group.users.filter((user) => user._id.toString() != socket.user._id)
      );

      if (exceptadmin.length > 0) {
        exceptadmin.map((x) => {
          const userid = x._id.toString();
          io.to(userid).emit("creategroupresponse_globally", {
            message: "successfully created",
          });
        });
      }
      socket.emit("creategroupresponse", {
        status: "ok",
        message: "successfully created",
      });
    } else {
      socket.emit("creategroupresponse", {
        status: "error",
        message: "unable to create the group",
      });
    }
  } catch (error) {
    console.log(error);
    socket.emit("creategroupresponse", {
      status: "error",
      message: "Internal Server Error",
    });
  }
};
const fetchallgroups = async (req, res) => {
  try {
    const fetchallgroups = await Chat.where("isgroupchat").equals(true);

    if (fetchallgroups) {
      const filteredgroups = fetchallgroups.filter((x) =>
        x.users.some((x) => x.toString() === req.user._id.toString())
      );

      if (filteredgroups.length > 0) {
        return res.status(200).json({ data: filteredgroups });
      } else {
        return res.status(204).json({ message: "No group found" });
      }
    } else {
      return res.status(204).json({ message: "No group found" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: error, message: "Internal Server Error" });
  }
};

const selfGroupExit = async (socket, body, io) => {
  const { groupid, userid, username, newadminid } = body;
  let removed;
  try {
    if (newadminid) {
      removed = await Chat.findByIdAndUpdate(
        { _id: groupid },
        { $pull: { users: userid }, $set: { groupadmin: newadminid } },
        { new: true }
      )
        .populate("users", "-password")
        .populate("groupadmin", "-password");
    } else {
      removed = await Chat.findByIdAndUpdate(
        { _id: groupid },
        { $pull: { users: userid } },
        { new: true }
      )
        .populate("users", "-password")
        .populate("groupadmin", "-password");
    }

    if (!removed) {
      socket.emit("selfexitfromgrpresponse", {
        status: "400",
        message: "failed to exit the group",
      });
      // return res.status(400).json({ message: "failed to exit the group" });
    } else {
      let allusers = [...removed.users, { _id: userid }];

      allusers.map((x) => {
        const userid = typeof x._id === "object" ? x._id.toString() : x._id;

        io.to(userid).emit("selfexitfromgrp_globally", {
          status: "200",
          message: `${username} is Exit From ${removed.chatname} Group`,
        });
      });
      socket.emit("selfexitfromgrpresponse", {
        status: "200",
        message: "successfully Exited ",
      });
    }
  } catch (error) {
    console.log(error);
    socket.emit("selfexitfromgrpresponse", {
      status: "error",
      message: "Internal Server Error",
    });
  }
};
const addPeoplesInGrp = async (socket, body, io) => {
  const { grpid, newusers } = body;

  try {
    const groupchat = await Chat.find({ _id: grpid })
      .populate("users", "-password")
      .populate("groupadmin", "-password");

    if (groupchat) {
      const peopleadded = await Chat.updateOne(
        { _id: grpid },
        { $push: { users: { $each: newusers } } }, // Use $each to add multiple users
        { new: true }
      );

      if (peopleadded) {
        newusers.map((x) => {
          const userid = x._id.toString();
          io.to(userid).emit("addpeoplegroup_globally", {
            message: `Your Added into this group`,
          });
        });
        socket.emit("addpeoplegroupchatresponse", {
          status: "200",
          message: "People Added Successfully",
        });
      } else {
        socket.emit("addpeoplegroupchatresponse", {
          status: "204",
          message: "Unable to add the people",
        });
      }
    } else {
      socket.emit("addpeoplegroupchatresponse", {
        status: "204",
        message: "Your Group is not Exist",
      });
    }
  } catch (error) {
    console.log(error);
    socket.emit("addpeoplegroupchatresponse", {
      status: "error",
      message: "Internal Server Error",
    });
  }
};
const removePeople = async (socket, body, io) => {
  const { groupid, usersid } = body;

  try {
    const removed = await Chat.findByIdAndUpdate(
      { _id: groupid },
      {
        $pull: { users: { $in: Array.isArray(usersid) ? usersid : [usersid] } },
      },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupadmin", "-password");

    if (!removed) {
      socket.emit("removepeopleresponse", {
        status: "400",
        message: "failed to exit the People",
      });
    } else {
      usersid.map((x) => {
        const userid = x._id.toString();
        io.to(userid).emit("removepeople_globally", {
          status: "200",
          message: `You Removed from ${removed.chatname} group`,
        });
      });
      socket.emit("removepeopleresponse", {
        status: "200",
        message: "successfully Removed People ",
      });
    }
  } catch (error) {
    console.log(error);
    socket.emit("removepeopleresponse", {
      status: "error",
      message: "Internal Server Error",
    });
  }
};
module.exports = {
  accesschat,
  fetchallchats,
  createGroupDp,
  creategroup,
  fetchallgroups,
  addPeoplesInGrp,
  selfGroupExit,
  removePeople,
};
