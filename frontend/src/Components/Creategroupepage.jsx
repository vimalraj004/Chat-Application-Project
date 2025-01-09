import React, { useState, useRef, useEffect } from "react";
import style from "../CssFolder/Creategroupepage.module.css";
import Commoncss from "../CssFolder/Commoncss.module.css";
import { IconButton, Avatar } from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";
import { useSelector } from "react-redux";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { commonservice, getsocket } from "../common";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { Drawer, Typography } from "@mui/material";
import Showpeople from "./Showpeople";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Diversity1Icon from "@mui/icons-material/Diversity1";
import { baseurl } from "../config";
import Profilepic from "./Profilepic";

const Creategroupepage = () => {
  const lighttheme = useSelector((state) => state.themekey);
  const allusers = useSelector((state) => state.refreshsidebar.allusers);
  const socketvalue = useSelector((state) => state.refreshsidebar.Socket);
  const [selectpeople, setselectpeople] = useState([]);

  const [image, setImage] = useState(null);
  const [createimage, setCreateImage] = useState({});

  const [open, setopen] = useState(false);
  const [groupname, setgroupname] = useState("");
  const [openpopup, setopenpopup] = useState(false);
  const handlepopup = (value) => {
    setopenpopup((prevalue) => !prevalue);
  };
  const navigate = useNavigate();
  const handleopen = () => {
    setopen(true);
  };

  const handleclose = () => {
    setopen(false);
  };

  const Creategroup = async (socket) => {
    if (!createimage || !(createimage instanceof File)) {
      toast.error("Please select the GroupDp");
      return;
    }

    const formdata = new FormData();
    formdata.append("groupdp", createimage);

    const imgurl = await commonservice(
      "/api/chatroutes/creategrpdpurl",
      "post",
      formdata
    );

    if (imgurl.status === 200) {
      let body = {
        name: groupname,
        users: [...selectpeople.map((x) => x._id)],
        groupDp: imgurl?.data?.data,
      };

      // Emit the event with the body data
      socket.emit("creategroup", body);

      const handleGroupResponse = (response) => {
        if (response.status === "ok") {
          toast.success("Group created");
          setTimeout(() => {
            navigate("/home/usergroup");
          }, 800);
        } else {
          toast.error("Failed to create group");
        }
        socket.off("creategroupresponse", handleGroupResponse); // Remove this specific listener
      };

      socket.on("creategroupresponse", handleGroupResponse);
    } else {
      toast.error(imgurl.message);
    }
  };

  const handleselectpeople = (user) => {
    setselectpeople((prevuser) => {
      if (prevuser.some((x) => x._id === user._id)) {
        return prevuser;
      }
      return [...prevuser, user];
    });
  };
  const handleDelete = (username) => {
    setselectpeople((prepeople) =>
      prepeople.filter((x) => x._id != username._id)
    );
  };

  return (
    <div className={style.Creategroupepage_border}>
      <Toaster position="top-right" />
      <div
        className={`${style.Creategroupepage_container} ${
          !lighttheme ? Commoncss.dark : ""
        }`}
      >
        <input
          type="text"
          className={`${style.grpname_input} ${
            !lighttheme ? Commoncss.dark : ""
          }`}
          placeholder="Enter the Group Name"
          onChange={(e) => {
            setgroupname(e.target.value);
          }}
        />
        <IconButton onClick={handleopen}>
          <DoneIcon className={`${!lighttheme ? Commoncss.dark : ""}`} />
        </IconButton>

        {/* Dialog Component */}
        <Dialog
          open={open}
          onClose={handleclose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {"Do you want to create Groupname as " + groupname}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              This will create a group in which you will be the admin and others
              will be people for this Group.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleclose}>Disagree</Button>
            <Button
              onClick={() => {
                if (socketvalue === true) {
                  let socket = getsocket();
                  Creategroup(socket);
                  handleclose();
                  // setgroupname("");
                }
              }}
              autoFocus
            >
              Agree
            </Button>
          </DialogActions>
        </Dialog>
      </div>
      <div className={style.selectepeoplecontainer}>
        <div className={style.showpeople}>
          {selectpeople.length > 0 &&
            selectpeople.map((x) => {
              return (
                <Stack
                  direction="column-reverse"
                  spacing={1}
                  sx={{ marginTop: "15px", width: "90%", display: "flex" }}
                >
                  <Chip
                    avatar={
                      <Avatar
                        src={`${baseurl}/Images/${x.profilepic}`}
                        sx={{
                          width: "40px",
                          height: "40px",
                          marginLeft: "20px",
                        }}
                        alt="Profile Pic"
                      />
                    }
                    label={x.name}
                    onDelete={() => {
                      handleDelete(x);
                    }}
                    deleteIcon={
                      <span
                        style={{
                          marginLeft: "190px",
                          color: `${!lighttheme ? "white" : "black"}`,
                          fontSize: "20px",
                          marginRight: "10px",
                        }}
                      >
                        x
                      </span>
                    }
                    sx={{
                      color: "black",
                      backgroundColor: "white",
                      boxShadow: "1px 1px 5px black",
                      textOverflow: "unset",
                      fontSize: "20px",
                      fontWeight: "bold",
                      height: "40px",
                      borderRadius: "15px",
                      gap: "15px",
                      "& .MuiChip-avatar": {
                        width: "35px",
                        height: "35px",
                        marginRight: "10px",
                      },
                    }}
                    className={`${!lighttheme ? Commoncss.dark : ""}`}
                  />
                </Stack>
              );
            })}
        </div>
        <div className={style.grpcontainer}>
          <div className={style.uploadgrpdp}>
            <Profilepic
              setCreateImage={setCreateImage}
              setImage={setImage}
              image={image}
            />
          </div>

          <div className={style.selectepeopleavatarcontainer}>
            {openpopup && (
              <div className={`${style.popup} ${openpopup ? style.show : ""}`}>
                {allusers.length > 0 ? (
                  allusers.map((x, index) => (
                    <Showpeople
                      key={index}
                      props={x}
                      onuserselect={handleselectpeople}
                    />
                  ))
                ) : (
                  <div
                    style={{
                      height: "auto",
                      width: "100%",
                      textAlign: "center",
                      marginTop: "90px",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Diversity1Icon
                      sx={{ fontSize: "150px", marginLeft: "45px" }}
                      className={`${!lighttheme ? style.dark : ""}`}
                    />

                    <Link
                      to="/home/onlineusers"
                      style={{ textDecoration: "none", cursor: "pointer" }}
                    >
                      Click here to see the Registered people
                    </Link>
                  </div>
                )}
              </div>
            )}

            <Fab
              color="primary"
              aria-label="add"
              onClick={() => handlepopup()}
              sx={{ marginRight: "10px", marginBottom: "10px" }}
            >
              {openpopup ? <CloseIcon /> : <AddIcon />}
            </Fab>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Creategroupepage;
