import React, { useEffect, useState } from "react";
import style from "../CssFolder/sbconversation.module.css";
import Commoncss from "../CssFolder/Commoncss.module.css";
import Chatarea from "./Chatarea";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { user, getsocket } from "../common";
import { format } from "date-fns";
import { Avatar } from "@mui/material";
import { baseurl } from "../config";
const Sbconversation = ({ props }) => {
  const socketvalue = useSelector((state) => state.refreshsidebar.Socket);
  const chatid = props._id;

  let userdata = user();

  const navigate = useNavigate();
  const lighttheme = useSelector((state) => state.themekey);
  let chatname = "";
  let profilepic = "";
  if (props.isgroupchat) {
    chatname = props.chatname;
    // const otherusers=   props.users.find((user)=>user._id !=userdata?.data?.data?._id)
    // if(otherusers){
    //   profilepic = otherusers?.profilepic|| ""
    // }
    profilepic = props.groupdp;
  } else {
    props.users.map((user) => {
      if (user._id != userdata?.data?.data?._id) {
        chatname = user?.name;
        profilepic = user?.profilepic;
      }
    });
  }
  return !props.latestmessage || props.latestmessage.length === 0 ? (
    <div
      className={`${style.conversationcontainer} ${
        !lighttheme ? Commoncss.dark : ""
      }`}
      onClick={() => {
        navigate(
          `chatarea/` +
            props._id +
            "&&" +
            chatname +
            "&&" +
            format(new Date(props.timestamp), "HH:mm") +
            "&&" +
            profilepic
        );
      }}
    >
      <p className={style.icon}>{chatname[0]}</p>
      <p className={`${style.name} ${!lighttheme ? Commoncss.dark : ""}`}>
        {chatname}
      </p>
      <p
        className={`${style.lastmessage} ${!lighttheme ? Commoncss.dark : ""}`}
      >
        {" "}
        click here to start a new chat
      </p>
      <p className={`${style.timestamp} ${!lighttheme ? Commoncss.dark : ""}`}>
        {props.timestamp
          ? format(new Date(props.timestamp), "HH:mm")
          : "No time available"}
      </p>
    </div>
  ) : (
    <div
      className={`${style.conversationcontainer} ${
        !lighttheme ? Commoncss.dark : ""
      }`}
      onClick={() => {
        navigate(
          `chatarea/` +
            props._id +
            "&&" +
            chatname +
            "&&" +
            format(
              new Date(
                props.latestmessage[props.latestmessage.length - 1].timestamp
              ),
              "HH:mm"
            ) +
            "&&" +
            profilepic
        );
      }}
    >
      <p className={style.icon}>
        {
          <Avatar
            src={`${baseurl}/Images/${profilepic}`}
            sx={{ width: "40px", height: "40px" }}
            alt="Profile Pic"
          />
        }
      </p>
      <p className={`${style.name} ${!lighttheme ? Commoncss.dark : ""}`}>
        {chatname}
      </p>
      <p
        className={`${style.lastmessage} ${!lighttheme ? Commoncss.dark : ""}`}
      >
        {props.latestmessage[props.latestmessage.length - 1].content}
      </p>
      <p className={`${style.timestamp} ${!lighttheme ? Commoncss.dark : ""}`}>
        {format(
          new Date(
            props.latestmessage[props.latestmessage.length - 1].timestamp
          ),
          "HH:mm"
        )}
      </p>
    </div>
  );
};

export default Sbconversation;
