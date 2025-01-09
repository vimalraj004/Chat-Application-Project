import React from "react";
import style from "../CssFolder/Showpeople.module.css";
import Creategroupepage from "./Creategroupepage";
import { useSelector } from "react-redux";
import Commoncss from "../CssFolder/Commoncss.module.css";
import { baseurl } from "../config";
import { Avatar, IconButton } from "@mui/material";

const Showpeople = ({ props, onuserselect }) => {
  const handleclick = (props) => {
    onuserselect(props);
  };
  const lighttheme = useSelector((state) => state.themekey);

  return (
    <div
      className={` ${!lighttheme ? style.dark : style.background}`}
      onClick={() => {
        handleclick(props);
      }}
    >
      <p className={style.icon}>
        <Avatar
          src={`${baseurl}/Images/${props.profilepic}`}
          sx={{ width: "30px", height: "30px" }}
          alt="Profile Pic"
        />
      </p>
      <p className={style.name}>{props.name}</p>
    </div>
  );
};

export default Showpeople;
