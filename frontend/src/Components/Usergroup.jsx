import React, { useEffect, useState, useMemo } from "react";
import style from "../CssFolder/Usergroup.module.css";
import Commoncss from "../CssFolder/Commoncss.module.css";
import bgimg from "../icons/aps_504x498_small_transparent-pad_600x600_f8f8f8.ico";
import { IconButton, Menu, MenuItem, Avatar } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useDispatch, useSelector } from "react-redux";
import { commonservice, getsocket, user } from "../common";
import toast, { Toaster } from "react-hot-toast";
import { debounce } from "lodash";
import { useNavigate, Link } from "react-router-dom";
import Showpeople from "./Showpeople";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { baseurl } from "../config";
import DoneIcon from "@mui/icons-material/Done";

const Usergroup = () => {
  const lighttheme = useSelector((state) => state.themekey);
  const socketvalue = useSelector((state) => state.refreshsidebar.Socket);

  const allusers = useSelector((state) => state.refreshsidebar.allusers);
  const [allgroups, setallgroups] = useState([]);
  const [filteredgroups, setfilteredgroups] = useState([]);
  const [search, setsearch] = useState("");
  let userdata = user();
  const [openMenu, setOpenMenu] = useState(false);
  const [anchorPosition, setAnchorPosition] = useState({ top: 0, left: 0 });
  const [plusButton, setPlusButton] = useState(false);
  const [openpopup, setopenpopup] = useState(false);
  const [selectedPeople, setSelectedPeople] = useState([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState("");

  const [indexNo, setIndexNo] = useState(0);
  const [grpDetails, setGrpDetails] = useState({});

  const [alreadyusers, setAlreadyUsers] = useState([]);

  let navigate = useNavigate();
  const fetchallgroups = async () => {
    try {
      const fetchallgroups = await commonservice(
        "/api/chatroutes/fetchallgroups",
        "get"
      );
      if (fetchallgroups.status === 200) {
        setallgroups(fetchallgroups?.data?.data);
      } else {
        toast.error("No Group ");
        setallgroups([]);
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchallgroups();
  }, []);
  useEffect(() => {
    if (socketvalue === true) {
      let socket = getsocket();
      socket.on("creategroupresponse_globally", async (responseglobally) => {
        if (responseglobally.message === "successfully created") {
          await fetchallgroups();
        }
      });
      socket.on("addpeoplegroup_globally", async (response) => {
        if (response.message === "Your Added into this group") {
          toast.success(response?.message);
          await fetchallgroups();
        }
      });
      socket.on("selfexitfromgrp_globally", async (response) => {
        if (response.status === "200") {
          toast.success(response?.message);
          await fetchallgroups();
        }
      });
      socket.on("removepeople_globally", async (response) => {
        if (response.status === "200") {
          toast.success(response.message);
          await fetchallgroups();
        }
      });
      return () => {
        socket.off("creategroupresponse_globally"); // Cleanup on unmount
        socket.off("addpeoplegroup_globally");
        socket.off("selfexitfromgrp_globally");
        socket.off("removepeople_globally");
      };
    }
  }, [socketvalue]);
  const startgroupchat = (socket, x) => {
    let body = {
      users: x.users,
    };
    socket.emit("startgroupchat", body);
  };
  const handledebounce = useMemo(() => {
    return debounce((search) => {
      const result = allgroups.filter((x) => {
        return x.chatname.toLowerCase().includes(search.toLowerCase());
      });

      setfilteredgroups(result); // Update the filtered conversation state
    }, 100);
  }, [allgroups, userdata]);
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
  const handleRightClick = async (e, x, index) => {
    e.preventDefault();
    setAnchorPosition({ top: e.clientY, left: e.clientX });
    setOpenMenu(true);
    setIndexNo(index);
    setGrpDetails(x);
    setAlreadyUsers(x.users);
    setPlusButton(false);
  };

  const handleCloseMenu = () => {
    setOpenMenu(false); // Close the menu
    setAnchorPosition({ top: 0, left: 0 }); // Reset the anchor element
  };
  const handelAddPeople = (e, x, index, action) => {
    setSelectedMenuItem(action);
    // setAnchorPosition({ top: 0, left: 0 });
    if (x.groupadmin === userdata.data.data._id && indexNo === index) {
      setOpenMenu(false);
      setPlusButton(true);
    } else {
      toast.error("Only GroupAdmin Can Add People");
    }
  };
  const handleRemovePeople = (e, x, index, action, socket) => {
    setSelectedMenuItem(action);
    if (x.groupadmin === userdata.data.data._id && indexNo === index) {
      setOpenMenu(false);
      setPlusButton(true);
      if (!selectedPeople || selectedPeople.length === 0) {
        toast.error("Please select the people");
        return;
      }
      let body = {
        groupid: x._id,
        usersid: selectedPeople,
      };
      socket.emit("removepeople", body);
      // Avoid duplicate listeners
      socket.off("removepeopleresponse");
      socket.on("removepeopleresponse", async (response) => {
        if (response.status === "400") {
          toast.error(response.message);
        } else {
          toast.success(response.message);
          setPlusButton(false);
          setSelectedPeople([]);
          setAlreadyUsers([]);
          await fetchallgroups();
        }
      });
    } else {
      toast.error("Only GroupAdmin Can Remove People");
    }
  };
  const handleSelectPeople = (user) => {
    if (selectedMenuItem === "selfexit") {
      setSelectedPeople((prevUsers) => {
        // Check if the user is already selected
        if (prevUsers.some((x) => x._id === user._id)) {
          return prevUsers; // Do nothing if the user is already in the list
        }

        // Check if the limit has been reached
        if (prevUsers.length >= 1) {
          toast.error("You can choose only one person as admin");
          return prevUsers; // Do not add the new user
        }

        // Add the new user to the list
        return [...prevUsers, user];
      });
    } else if (selectedMenuItem === "addpeople") {
      setSelectedPeople((prevUsers) => {
        // Check if the user is already selected
        if (prevUsers.some((x) => x._id === user._id)) {
          return prevUsers; // Do nothing if the user is already in the list
        }

        // Check if the limit has been reached
        if (prevUsers.length >= 5) {
          toast.error("You can only add up to 5 people");
          return prevUsers; // Do not add the new user
        }

        // Add the new user to the list
        return [...prevUsers, user];
      });
    } else {
      setSelectedPeople((prevUsers) => {
        // Check if the user is already selected
        if (prevUsers.some((x) => x._id === user._id)) {
          return prevUsers; // Do nothing if the user is already in the list
        }

        // Check if the limit has been reached
        if (prevUsers.length >= 5) {
          toast.error("You can only Remove up to 5 people");
          return prevUsers; // Do not add the new user
        }

        // Add the new user to the list
        return [...prevUsers, user];
      });
    }
  };
  const handelAddPeopleGrp = (selectedPeople, socket, x, index) => {
    let body = {
      grpid: x._id,
      newusers: selectedPeople,
    };
    socket.emit("addpeoplegroupchat", body);
    setPlusButton(false);
    setSelectedPeople([]);
    setAlreadyUsers([]);
    // Avoid duplicate listeners
    socket.off("addpeoplegroupchatresponse");
    socket.on("addpeoplegroupchatresponse", async (response) => {
      if (response.status === "200") {
        toast.success(response.message);
        await fetchallgroups();
      } else {
        toast.error(response.message);
      }
    });
  };

  const handleSelfExit = (e, x, index, socket, action) => {
    e.preventDefault();
    // Set the selected menu action
    setSelectedMenuItem(action);

    let body;

    if (x.groupadmin === userdata.data.data._id) {
      // Check if user is admin
      if (!selectedPeople || selectedPeople.length === 0) {
        // If no new admin is selected, show toast and wait
        toast.error("Please select the next Admin before exiting");
        setPlusButton(true); // Keep the done button visible
        setOpenMenu(false);
        return;
      }

      // New admin selected, update the body
      body = {
        groupid: x._id,
        userid: userdata.data.data._id,
        username: userdata.data.data.name,
        newadminid: selectedPeople[0]._id,
      };
    } else {
      // If user is not an admin, prepare body for self-exit
      body = {
        groupid: x._id,
        userid: userdata.data.data._id,
        username: userdata.data.data.name,
      };
    }

    if (body) {
      // Emit the event to the server
      socket.emit("selfexitfromgrp", body);
      setOpenMenu(false); // Close the menu after emitting
      setPlusButton(false);
      setSelectedPeople([]);
      setAlreadyUsers([]);
      // Avoid duplicate listeners
      socket.off("selfexitfromgrpresponse");
      socket.on("selfexitfromgrpresponse", async (response) => {
        if (response.status === "400") {
          toast.error(response.message);
        } else {
          toast.success(response.message);
          await fetchallgroups();
        }
      });
    } else {
      console.warn("Body is undefined, emission skipped");
    }
  };
  const handleUnSelectPeople = async (index) => {
    const selectedpeople = selectedPeople.filter((person, i) => i != index);
    setSelectedPeople(selectedpeople);
  };

  return (
    <div className={style.usergroup_container}>
      <Toaster position="top-right" />
      <div
        className={`${style.usergroup_heading} ${
          !lighttheme ? Commoncss.dark : ""
        }`}
      >
        <img src={bgimg} alt="img" className={style.usergroup_heading_img} />
        <p className={style.usergroup_heading_text}>Available Groups</p>
      </div>
      <div
        className={`${style.usergroup_search} ${
          !lighttheme ? Commoncss.dark : ""
        }`}
      >
        <IconButton>
          <SearchIcon className={`${!lighttheme ? Commoncss.dark : ""}`} />
        </IconButton>
        <input
          type="search"
          placeholder="Search"
          onChange={(e) => {
            handlesearchinput(e);
          }}
          className={`${style.ug_search_input} ${
            !lighttheme ? Commoncss.dark : ""
          }`}
        />
      </div>

      <div className={style.ug_list_container}>
        {(filteredgroups.length > 0 ? filteredgroups : allgroups).map(
          (x, index) => {
            return (
              <div
                key={index}
                className={`${style.list_item} ${
                  !lighttheme ? Commoncss.dark : ""
                }`}
                onClick={() => {
                  if (socketvalue) {
                    const socket = getsocket();
                    startgroupchat(socket, x);
                  }
                }}
                onContextMenu={(e) => handleRightClick(e, x, index)}
              >
                <p className={style.icon}>
                  {" "}
                  <Avatar
                    src={`${baseurl}/Images/${x.groupdp}`}
                    sx={{ width: "40px", height: "40px" }}
                    alt="Profile Pic"
                  />
                </p>
                <p className={style.name}>{x.chatname}</p>
                {indexNo === index &&
                  selectedPeople.length > 0 &&
                  selectedPeople.map((person, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        // marginLeft: "30px",
                        // marginTop: "10px",
                        // border:"2px solid red"
                      }}
                    >
                      <Avatar
                        key={index} // Ensure a unique key
                        src={`${baseurl}/Images/${person.profilepic}`}
                        sx={{
                          width: "35px",
                          height: "35px",
                          marginLeft: "30px",
                          // marginTop: "10px",
                        }}
                        alt="Profile Pic"
                        style={{ display: "block" }}
                      />
                      <button
                        onClick={() => {
                          handleUnSelectPeople(index);
                        }}
                        style={{
                          position: "absolute",
                          // top: 0,
                          // right: 0,
                          // background: "red",
                          marginLeft: "70px",
                          marginBottom: "30px",
                          color: "red",
                          border: "none",
                          outline: "none",
                          borderRadius: "50%",
                          width: "20px",
                          height: "20px",
                          cursor: "pointer",
                          display: "block", // Hidden by default
                        }}
                        className={style.closebtn}
                      >
                        x
                      </button>
                    </div>
                  ))}

                {plusButton && indexNo === index && (
                  <IconButton
                    sx={{
                      marginLeft: "auto",
                      marginTop: "4px",
                      marginRight: "15px",
                      color: "black",
                    }}
                    onClick={(e) => {
                      setopenpopup(true);
                      setAnchorPosition({
                        top: e.clientY,
                        left: e.clientX - 170,
                      });
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                )}
                {plusButton && indexNo === index && (
                  <IconButton
                    sx={{
                      color: "black",
                    }}
                    onClick={(e) => {
                      if (socketvalue) {
                        let socket = getsocket();

                        if (selectedMenuItem === "addpeople") {
                          handelAddPeopleGrp(selectedPeople, socket, x, index);
                        } else if (selectedMenuItem === "selfexit") {
                          handleSelfExit(e, x, index, socket, selectedMenuItem);
                        } else {
                          handleRemovePeople(
                            e,
                            x,
                            index,
                            selectedMenuItem,
                            socket
                          );
                        }
                      }
                    }}
                  >
                    <DoneIcon
                      className={`${!lighttheme ? Commoncss.dark : ""}`}
                    />
                  </IconButton>
                )}

                {/* Popup Menu */}
                <Menu
                  open={openpopup}
                  onClose={() => setopenpopup(false)}
                  anchorPosition={anchorPosition}
                  anchorReference="anchorPosition"
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "left",
                  }}
                  sx={{ marginRight: "50px" }}
                >
                  {allusers.length > 0 && selectedMenuItem === "addpeople" ? (
                    allusers
                      // Exclude users who are already in the group
                      .filter((user) => !alreadyusers.includes(user._id))
                      .map((user) => (
                        <MenuItem
                          // key={user.id}
                          onClick={() => {
                            handleSelectPeople(user);
                          }}
                        >
                          <Avatar
                            src={`${baseurl}/Images/${user.profilepic}`}
                            sx={{
                              width: "30px",
                              height: "30px",
                              marginLeft: "5px",
                            }}
                            alt="Profile Pic"
                          />
                          <span style={{ marginLeft: "10px" }}>
                            {user.name}
                          </span>
                        </MenuItem>
                      ))
                  ) : allusers.length > 0 && selectedMenuItem === "selfexit" ? (
                    allusers
                      .filter((user) => alreadyusers.includes(user._id))
                      .map((user) => (
                        <MenuItem
                          key={user.id}
                          onClick={() => {
                            handleSelectPeople(user);
                          }}
                        >
                          <Avatar
                            src={`${baseurl}/Images/${user.profilepic}`}
                            sx={{
                              width: "30px",
                              height: "30px",
                              marginLeft: "5px",
                            }}
                            alt="Profile Pic"
                          />
                          <span style={{ marginLeft: "10px" }}>
                            {user.name}
                          </span>
                        </MenuItem>
                      ))
                  ) : allusers.length > 0 &&
                    selectedMenuItem === "removepeople" ? (
                    allusers
                      .filter((user) => alreadyusers.includes(user._id))
                      .map((user) => (
                        <MenuItem
                          key={user.id}
                          onClick={() => {
                            handleSelectPeople(user);
                          }}
                        >
                          <Avatar
                            src={`${baseurl}/Images/${user.profilepic}`}
                            sx={{
                              width: "30px",
                              height: "30px",
                              marginLeft: "5px",
                            }}
                            alt="Profile Pic"
                          />
                          <span style={{ marginLeft: "10px" }}>
                            {user.name}
                          </span>
                        </MenuItem>
                      ))
                  ) : (
                    <MenuItem>
                      <Link
                        to="/home/onlineusers"
                        style={{ textDecoration: "none", cursor: "pointer" }}
                      >
                        Click here to see the Registered people
                      </Link>
                    </MenuItem>
                  )}
                </Menu>

                {/* Another Menu */}
                <Menu
                  open={openMenu}
                  onClose={handleCloseMenu}
                  anchorPosition={anchorPosition}
                  anchorReference="anchorPosition"
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "left",
                  }}
                  sx={{ marginRight: "50px" }}
                >
                  <MenuItem
                    onClick={(e) =>
                      handelAddPeople(e, grpDetails, indexNo, "addpeople")
                    }
                  >
                    Add People
                  </MenuItem>
                  <MenuItem
                    onClick={(e) => {
                      if (socketvalue) {
                        let socket = getsocket();
                        handleSelfExit(
                          e,
                          grpDetails,
                          indexNo,
                          socket,
                          "selfexit"
                        );
                      }
                    }}
                  >
                    Self Exit
                  </MenuItem>
                  <MenuItem
                    onClick={(e) =>
                      handleRemovePeople(e, grpDetails, indexNo, "removepeople")
                    }
                  >
                    Remove People
                  </MenuItem>
                </Menu>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
};

export default Usergroup;
