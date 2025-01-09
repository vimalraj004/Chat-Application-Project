import React from "react";
import style from "../CssFolder/Othermessage.module.css";
import { format } from "date-fns";
import { Avatar } from "@mui/material";
import { baseurl } from "../config";

const Othermessage = ({ props }) => {
  return (
    <div className={style.messageboxcontainer}>
      <div className={style.sendernamecontainer}>
        <p className={style.sendername}>
          {
            <Avatar
              src={`${baseurl}/Images/${props.sender.profilepic}`}
              sx={{ width: "40px", height: "40px" }}
              alt="Profile Pic"
            />
          }
        </p>
      </div>
      <div className={style.messagebox}>
        <p className={style.message}>{props.content}</p>
        <p className={style.timestamp}>
          {props.timestamp
            ? format(new Date(props.timestamp), "HH:mm")
            : "No time available"}
        </p>
      </div>
    </div>
  );
};

export default Othermessage;
