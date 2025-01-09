import React, { useContext, useEffect, useState, useMemo } from "react";
import style from "../CssFolder/sidebar.module.css";
import Commoncss from "../CssFolder/Commoncss.module.css";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { Icon, IconButton, Avatar } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import NightlightIcon from "@mui/icons-material/Nightlight";
import LightModeIcon from "@mui/icons-material/LightMode";
import SearchIcon from "@mui/icons-material/Search";
import Sbconversation from "./Sbconversation";
import { useNavigate } from "react-router-dom";
import { dark } from "@mui/material/styles/createPalette";
import { useDispatch, useSelector } from "react-redux";
import { toggletheme } from "./Redux/themeSlice";
import { motion } from "framer-motion";
import LogoutIcon from "@mui/icons-material/Logout";
import { commonservice, getsocket, user, initsocket } from "../common";
import toast, { Toaster } from "react-hot-toast";
import { refreshsidebarfun } from "./Redux/refreshsidebar";
import { myContext } from "./Maincontainer";
import { setsocket } from "./Redux/refreshsidebar";
import { debounce } from "lodash";
import { baseurl } from "../config";

const Sidebar = () => {
  let navigate = useNavigate();
  let userdata = user();
  const dispatch = useDispatch();
  const socketvalue = useSelector((state) => state.refreshsidebar.Socket);
  const { refresh, setrefresh } = useContext(myContext);
  const lighttheme = useSelector((state) => state.themekey);
  const [conversation, setconversation] = useState([]);
  const [filteredconversation, setfilteredconversation] = useState([]);
  const [search, setsearch] = useState("");

  useEffect(() => {
    if (socketvalue && conversation.length > 0) {
      const socket = getsocket();
      const chatIds = conversation.map((chat) => chat._id);

      // Emit joinChat for all chat IDs
      chatIds.forEach((chatId) => {
        socket.emit("joinchat", { chatid: chatId });
      });

      // Listen for joinchat_response
      socket.on("joinchat_response", (message) => {});

      // Cleanup to avoid duplicate listeners
      return () => {
        socket.off("joinchat_response");
      };
    }
  }, [conversation, socketvalue]);

  const fetchchats = async (socket) => {
    socket.emit("fetchallchats");
    socket.on("fetchallchatsresponse", (newchats) => {
      if (newchats.status === "ok") {
        setconversation(newchats.data);
      } else {
        toast(newchats.message);
      }
    });
  };

  useEffect(() => {
    if (socketvalue) {
      let body = {
        userid: userdata?.data?.data._id,
      };
      let socket = getsocket();
      socket.emit("joinroom", body);
      socket.on("entry", (message) => {});
      fetchchats(socket);
      socket.on("fetchallchatsresponse_globally", (newchats) => {
        setconversation(newchats);
      });

      socket.on("newmessage_globally", (newmessage) => {
        if (newmessage.message) {
          fetchchats(socket);
        }
      });
      socket.on("start_chatting_globally", (newmessage) => {
        if (newmessage.message) {
          fetchchats(socket);
        }
      });
      socket.on("startgroupchatresponse_globally", (response) => {
        if (response.message === "startgroupchat") {
          fetchchats(socket);
        }
      });
      socket.on("deleteAllMessage_globally", async (newdata) => {
        if (newdata.acknowledged === true) {
          await fetchchats(socket);
        }
      });
      return () => {
        socket.off("fetchallchatsresponse"); // Cleanup on unmount
        socket.off("newmessage_globally");
        socket.off("start_chatting_globally");
        socket.off("startgroupchatresponse_globally");
        socket.off("deleteAllMessage_globally");
      };
    }
  }, [socketvalue]);
  useEffect(() => {
    initsocket(userdata?.data?.data?.token);
    dispatch(setsocket(true));
  }, []);
  const handledebounce = useMemo(() => {
    return debounce((search) => {
      const result = conversation.filter((chat) => {
        // Check if any user in the chat matches the search criteria
        return chat.users.some(
          (user) =>
            user.name.toLowerCase() !==
              userdata?.data?.data?.name.toLowerCase() &&
            user.name.toLowerCase().includes(search.toLowerCase())
        );
      });

      setfilteredconversation(result); // Update the filtered conversation state
    }, 100);
  }, [conversation, userdata]);
  const handlesearchinput = (e) => {
    const value = e.target.value;
    setsearch(value);
    handledebounce(value);
  };
  useEffect(() => {
    // This effect runs when the component unmounts
    return () => {
      // Cancel the debounced calls if component unmounts
      handledebounce.cancel();
    };
  }, []);
  const logout = (socket) => {
    let body = {
      userid: userdata.data.data._id,
    };
    socket.emit("leaveroom", body);
    socket.disconnect();
    localStorage.clear();
    navigate("/");
  };
  return (
    <div className={style.sidebarcontainer}>
      <div className={`${style.sbheader} ${!lighttheme ? Commoncss.dark : ""}`}>
        <div>
          <IconButton
            onClick={() => {
              navigate("welcomepage");
            }}
          >
            {/* <AccountCircleIcon className={`${!lighttheme ? Commoncss.dark: ''}`} sx={{height:"30px",width:"30px"}} /> */}
            <Avatar
              src={`${baseurl}/Images/${userdata.data.data.profilepic}`}
              sx={{ width: "30px", height: "30px" }}
              alt="Profile Pic"
            />
          </IconButton>
        </div>
        <div>
          <IconButton
            onClick={() => {
              navigate("onlineusers");
            }}
          >
            <PersonAddIcon className={`${!lighttheme ? Commoncss.dark : ""}`} />
          </IconButton>
          <IconButton
            onClick={() => {
              navigate("usergroup");
            }}
          >
            <GroupAddIcon className={`${!lighttheme ? Commoncss.dark : ""}`} />
          </IconButton>
          <IconButton
            onClick={() => {
              navigate("creategroupepage");
            }}
          >
            <AddCircleIcon className={`${!lighttheme ? Commoncss.dark : ""}`} />
          </IconButton>
          <IconButton
            onClick={() => {
              dispatch(toggletheme());
            }}
          >
            {lighttheme ? (
              <NightlightIcon
                className={`${!lighttheme ? Commoncss.dark : ""}`}
              />
            ) : (
              <LightModeIcon
                className={`${!lighttheme ? Commoncss.dark : ""}`}
              />
            )}
          </IconButton>
          <IconButton
            onClick={() => {
              if (socketvalue) {
                let socket = getsocket();
                logout(socket);
              }
            }}
          >
            <LogoutIcon className={`${!lighttheme ? Commoncss.dark : ""}`} />
          </IconButton>
        </div>
      </div>
      <div className={`${style.sbsearch} ${!lighttheme ? Commoncss.dark : ""}`}>
        <div>
          <IconButton>
            <SearchIcon className={`${!lighttheme ? Commoncss.dark : ""}`} />
          </IconButton>
        </div>
        <div
          className={`${style.searchbox} ${!lighttheme ? Commoncss.dark : ""}`}
        >
          <input
            className={`${style.searchinput} ${
              !lighttheme ? Commoncss.dark : ""
            }`}
            type="search"
            placeholder="Search"
            value={search}
            onChange={(e) => {
              handlesearchinput(e);
            }}
          />
        </div>
      </div>
      <div
        className={`${style.sbconversation} ${!lighttheme ? style.dark : ""}`}
      >
        {(filteredconversation.length > 0
          ? filteredconversation
          : conversation
        ).map((x, index) => {
          return <Sbconversation props={x} key={index} />;
        })}
      </div>
    </div>
  );
};

export default Sidebar;
