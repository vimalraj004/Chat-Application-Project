import React, { useContext, useEffect, useState } from "react";
import style from "../CssFolder/chatarea.module.css";
import Commoncss from "../CssFolder/Commoncss.module.css";
import { IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import { Height } from "@mui/icons-material";
import Othermessage from "./Othermessage";
import Selfmessage from "./Selfmessage";
import { commonservice, getsocket, initsocket } from "../common";
import { useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { user } from "../common";
import { myContext } from "./Maincontainer";
import { useDispatch, useSelector } from "react-redux";
import { setsocket } from "./Redux/refreshsidebar";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import { Avatar } from "@mui/material";
import { baseurl } from "../config";

const Chatarea = () => {
  const [message, setmessage] = useState("");
  const [open, setopen] = useState(false);
  let userdata = user();
  const dispatch = useDispatch();
  const socketvalue = useSelector((state) => state.refreshsidebar.Socket);
  const lighttheme = useSelector((state) => state.themekey);

  const params = useParams();
  const [chatid, chatname, timestamp, profilepic] = params._id.split("&&");

  const [conversation, setconversation] = useState([]);

  const [datasent, setdatasent] = useState(false);
  const { refresh, setrefresh } = useContext(myContext);

  const sendmessage = async (socket) => {
    let data = null;
    let body = {
      content: message,
      chat_id: chatid,
    };

    try {
      const sendmessage = await commonservice(
        "/api/message/sendmessage",
        "post",
        body
      );
      if (sendmessage.status === 200) {
        data = sendmessage?.data?.data;

        socket.emit("newmessage", body);
        fetchallmessage(socket);
        // setdatasent(true);
      } else {
        toast.error(sendmessage?.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const fetchallmessage = async (socket) => {
    let body = {
      chatid,
    };

    await socket.emit("fetchallmessage", body);
    await socket.on("fetchallmessageresponse", (message) => {
      if (message.status === "ok") {
        // setconversation(message?.data);
      } else {
        toast.error(message?.message);
      }
    });
  };

  useEffect(() => {
    if (socketvalue) {
      let body = {
        chatid,
      };
      let socket = getsocket();

      fetchallmessage(socket);
      socket.on("fetchallmessage_globally", (message2) => {
        setconversation(message2);
      });
      socket.on("deleteAllMessage_globally", (newdata) => {
        fetchallmessage(socket);
      });

      return () => {
        socket.off("fetchallmessage_globally"); // Cleanup on unmount
        socket.off("deleteAllMessage_globally");
      };
    }
  }, [socketvalue, chatid]);

  const handleopen = () => {
    setopen(true);
  };

  const handleclose = () => {
    setopen(false);
  };
  const deleteAllMessage = async (socket) => {
    let body = {
      chatid,
    };
    socket.emit("deleteallmessage", body);
    socket.off("deleteAllMessageresponse");
    socket.on("deleteAllMessageresponse", (data) => {});
  };

  return (
    <div className={style.chatareacontainer}>
      <Toaster position="top-right" />
      <div className={`${style.header} ${!lighttheme ? Commoncss.dark : ""}`}>
        <div className={style.profileicon}>
          <p className={style.icon}>
            {
              <Avatar
                src={`${baseurl}/Images/${profilepic}`}
                sx={{ width: "40px", height: "40px" }}
                alt="Profile Pic"
              />
            }
          </p>
        </div>

        <div className={style.nametimestamp}>
          <p className={`${style.name} ${!lighttheme ? Commoncss.dark : ""}`}>
            {chatname}
          </p>

          <p
            className={`${style.timestamp} ${
              !lighttheme ? Commoncss.dark : ""
            }`}
          >
            Lastmessage at {timestamp}
          </p>
        </div>

        <div className={style.deleteicon}>
          <IconButton onClick={handleopen}>
            <DeleteIcon className={`${!lighttheme ? Commoncss.dark : ""}`} />
          </IconButton>
        </div>
      </div>
      <div className={`${style.message} ${!lighttheme ? Commoncss.dark : ""}`}>
        {conversation.slice(0).map((message, index) => {
          const sender = message.sender;
          const selfid = userdata?.data?.data?._id;

          if (sender._id === selfid) {
            return <Selfmessage props={message} key={index} />;
          } else {
            return <Othermessage props={message} key={index} />;
          }
        })}
      </div>
      <div className={`${style.input} ${!lighttheme ? Commoncss.dark : ""}`}>
        <div
          className={`${style.input_typearea} ${
            !lighttheme ? Commoncss.dark : ""
          }`}
        >
          <input
            style={{
              height: "100%",
              width: "100%",
              border: "none",
              outline: "none",
              fontSize: "15px",
              backgroundColor: `${!lighttheme ? "black" : "white"}`,
              color: `${!lighttheme ? "white" : "black"}`,
            }}
            type="text"
            placeholder="Type a message"
            value={message}
            onChange={(e) => {
              setmessage(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.code === "Enter") {
                let socket = getsocket();
                sendmessage(socket);
                setmessage("");
              }
            }}
          />
        </div>
        <div className={style.input_sendicon}>
          <IconButton
            onClick={() => {
              let socket = getsocket();
              sendmessage(socket);
              setmessage("");
            }}
          >
            <SendIcon className={`${!lighttheme ? Commoncss.dark : ""}`} />
          </IconButton>
        </div>
        {/* Dialog Component */}
        <Dialog
          open={open}
          onClose={handleclose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Are you sure !"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              you want to Delete all the Messages?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleclose}>NO</Button>
            <Button
              onClick={() => {
                if (socketvalue === true) {
                  let socket = getsocket();
                  deleteAllMessage(socket);
                  handleclose();
                }
              }}
              autoFocus
            >
              YES
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default Chatarea;
