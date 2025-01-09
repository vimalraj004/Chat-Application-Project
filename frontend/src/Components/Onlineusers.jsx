import React, { useContext, useEffect, useState, useMemo } from "react";
import style from "../CssFolder/Onlineusers.module.css";
import Commoncss from "../CssFolder/Commoncss.module.css";
import bgimg from "../icons/aps_504x498_small_transparent-pad_600x600_f8f8f8.ico";
import { Avatar, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useSelector } from "react-redux";
import { commonservice, getsocket, user } from "../common";
import { body } from "framer-motion/client";
import toast, { Toaster } from "react-hot-toast";
import { refreshsidebarfun } from "./Redux/refreshsidebar";
import { useDispatch } from "react-redux";
import { myContext } from "./Maincontainer";
import { debounce } from "lodash";
import { setallusers } from "./Redux/refreshsidebar";
import { baseurl } from "../config";
const Onlineusers = () => {
  const lighttheme = useSelector((state) => state.themekey);
  const allusers = useSelector((state) => state.refreshsidebar.allusers);
  const socketvalue = useSelector((state) => state.refreshsidebar.Socket);
  const { refresh, setrefresh } = useContext(myContext);

  const [filteredallusers, setfilteredallusers] = useState([]);
  const [search, setsearch] = useState("");

  let userdata = user();
  const dispatch = useDispatch();
  useEffect(() => {
    fetchallusers();
  }, [socketvalue]);
  const fetchallusers = async () => {
    try {
      const fetchallusers = await commonservice(
        "/api/onlineusers/fetchallusers",
        "get"
      );
      dispatch(setallusers(fetchallusers?.data?.data));
      // setallusers(fetchallusers?.data?.data);
    } catch (error) {
      console.log(error);
    }
  };
  const accesschat = async (x, socket) => {
    const body = {
      userID: x._id,
    };
    try {
      const accesschat = await commonservice(
        "/api/chatroutes/accesschat",
        "post",
        body
      );
      if (accesschat.status === 200) {
        // dispatch(refreshsidebarfun())
        socket.emit("start_chatting", body);
        // setrefresh(!refresh)
      } else {
        toast.error(accesschat?.data?.message);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handledebounce = useMemo(() => {
    return debounce((search) => {
      const result = allusers.filter((x) => {
        return x.name.toLowerCase().includes(search.toLowerCase());
      });

      setfilteredallusers(result); // Update the filtered conversation state
    }, 100);
  }, [allusers, userdata]);
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
  return (
    <div className={style.Onlineusers_container}>
      <div
        className={`${style.Onlineusers_heading} ${
          !lighttheme ? Commoncss.dark : ""
        }`}
      >
        <img src={bgimg} alt="img" className={style.Onlineusers_heading_img} />
        <p className={style.Onlineusers_heading_text}>Online users</p>
      </div>
      <div
        className={`${style.Onlineusers_search} ${
          !lighttheme ? Commoncss.dark : ""
        }`}
      >
        <IconButton>
          <SearchIcon className={`${!lighttheme ? Commoncss.dark : ""}`} />
        </IconButton>
        <input
          type="search"
          placeholder="Search"
          value={search}
          onChange={(e) => {
            handlesearchinput(e);
          }}
          className={`${style.ug_search_input} ${
            !lighttheme ? Commoncss.dark : ""
          }`}
        />
      </div>

      <div className={style.ug_list_container}>
        {(filteredallusers.length > 0 ? filteredallusers : allusers).map(
          (x, index) => {
            return (
              <div
                className={`${style.list_item} ${
                  !lighttheme ? Commoncss.dark : ""
                }`}
                onClick={() => {
                  let socket = getsocket();
                  accesschat(x, socket);
                }}
                key={index}
              >
                <p className={style.icon}>
                  <Avatar
                    src={`${baseurl}/Images/${x.profilepic}`}
                    sx={{ width: "30px", height: "30px" }}
                    alt="Profile Pic"
                  />
                </p>
                <p className={style.name}>{x.name}</p>
                <Toaster position="top-right" />
              </div>
            );
          }
        )}
      </div>
    </div>
  );
};

export default Onlineusers;
