import { React, useState } from "react";
import style from "../CssFolder/Loginpage.module.css";
import bgimg from "../icons/aps_504x498_small_transparent-pad_600x600_f8f8f8.ico";
import { TextField, Button, Avatar, Dialog } from "@mui/material";
import { json, Link, useNavigate } from "react-router-dom";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import { loginservice } from "../common";
import toast, { Toaster } from "react-hot-toast";
import { use } from "framer-motion/client";
import Cropper from "react-easy-crop";
import GetcroppedImg from "./GetcroppedImg";
import { convertFileToImg } from "../common";
import Profilepic from "./Profilepic";

const Loginpage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [registerpage, setregisterpage] = useState(false);
  const [image, setImage] = useState(null);
  const [createimage, setCreateImage] = useState({});

  const emailregex = /^[a-zA-Z0-9_.+%\-]+@[A-Za-z]+\.[A-Za-z]{2,6}$/;

  const passwordregex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%])[a-zA-Z\d!@#$%]{4,10}$/;

  let navigate = useNavigate();
  let initialuserstate = {
    name: "",
    email: "",
    password: "",
  };
  const [userdetails, setuserdetails] = useState(initialuserstate);

  let inputhandler = (e) => {
    const { name, value } = e.target;
    setuserdetails((preval) => ({
      ...preval,
      [name]: value,
    }));
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };
  const registerFunction = async (userdetails) => {
    const formdata = new FormData();
    formdata.append("name", userdetails.name);
    formdata.append("email", userdetails.email);
    formdata.append("password", userdetails.password);
    formdata.append("profilepic", createimage);

    try {
      if (userdetails.name.length > 4 && userdetails.name.length < 15) {
        if (emailregex.test(userdetails.email)) {
          if (
            userdetails.password.length > 4 &&
            userdetails.password.length <= 10 &&
            passwordregex.test(userdetails.password)
          ) {
            if (createimage.type) {
              const response = await loginservice(
                "/api/entry/registration",
                "post",
                formdata
              );
              if (response?.status === 201) {
                toast.success("Registered successfully ");
                setuserdetails(initialuserstate);
                setImage(null);
              } else if (response?.status === 409) {
                toast.error(response?.data?.message);
                setuserdetails(initialuserstate);
                setImage(null);
              } else if (response?.status === 400) {
                toast.error(response?.data?.message);
                setuserdetails(initialuserstate);
                setImage(null);
              }
            } else {
              toast.error("Profile pic is mandatory");
            }
          } else {
            toast.error(
              "Password length should be between 4 and 10 characters, and must include at least one uppercase letter, one lowercase letter, three digits, and only the following special characters: !@#$%."
            );
          }
        } else {
          toast.error(
            "Email should be in the format: example_3234@example.com."
          );
        }
      } else {
        toast.error("Name length must be between 4 and 15 characters.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const loginfunction = async (userdetails) => {
    const data = {
      email: userdetails.email,
      password: userdetails.password,
    };
    try {
      if (emailregex.test(data.email)) {
        if (
          data.password.length > 4 &&
          data.password.length <= 10 &&
          passwordregex.test(data.password)
        ) {
          const response = await loginservice("/api/entry/login", "post", data);

          if (response.status == 200) {
            toast.success("Login successfully");
            setTimeout(() => {
              setuserdetails(initialuserstate);
              localStorage.setItem("userdata", JSON.stringify(response));
              navigate("/home/welcomepage");
            }, 500);
          } else if (response.status == 401) {
            toast.error(response?.data?.message);
            setuserdetails(initialuserstate);
          } else if (response.status == 400) {
            toast.error(response?.data?.message);
            setuserdetails(initialuserstate);
          }
        } else {
          toast.error("password is required");
        }
      } else {
        toast.error("Email is required");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className={style.loginpage_container}>
      <section className={style.img_section}>
        <img src={bgimg} alt="applogo" className={style.loginbgimg} />
      </section>
      {registerpage === false ? (
        <section className={style.login_section}>
          <p className={style.login_heading}>Login To Your Account</p>
          <TextField
            id="outlined-basic"
            label="Enter Your Email"
            variant="outlined"
            type="email"
            name="email"
            value={userdetails.email}
            onChange={inputhandler}
          />

          <FormControl sx={{ m: 1, width: "25ch" }} variant="outlined">
            <InputLabel htmlFor="outlined-adornment-password">
              Password
            </InputLabel>
            <OutlinedInput
              id="outlined-adornment-password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={userdetails.password}
              onChange={inputhandler}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="Password"
              onKeyDown={(e) => {
                if (e.code === "Enter") {
                  loginfunction(userdetails);
                }
              }}
            />
          </FormControl>

          <Button
            variant="contained"
            onClick={() => loginfunction(userdetails)}
          >
            Login
          </Button>
          <Toaster position="top-right" />
          <p>
            Are You New User ?{" "}
            <Link
              onClick={() => {
                setregisterpage(true);
              }}
              style={{ textDecoration: "none", color: "blue" }}
            >
              Sign up{" "}
            </Link>
          </p>
        </section>
      ) : (
        <section className={style.login_section}>
          <p className={style.login_heading}>Register Your Details</p>

          <TextField
            id="outlined-basic"
            label="Enter Your Name"
            variant="outlined"
            name="name"
            value={userdetails.name}
            onChange={inputhandler}
          />

          <TextField
            id="outlined-basic"
            label="Enter Your Email"
            variant="outlined"
            type="email"
            name="email"
            value={userdetails.email}
            onChange={inputhandler}
          />
          <FormControl sx={{ m: 1, width: "25ch" }} variant="outlined">
            <InputLabel htmlFor="outlined-adornment-password">
              Password
            </InputLabel>
            <OutlinedInput
              id="outlined-adornment-password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={userdetails.password}
              onChange={inputhandler}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="Password"
              onKeyDown={(e) => {
                if (e.code === "Enter") {
                  registerFunction(userdetails);
                }
              }}
            />
          </FormControl>

          <Profilepic
            setCreateImage={setCreateImage}
            setImage={setImage}
            image={image}
          />

          <Button
            variant="contained"
            onClick={() => registerFunction(userdetails)}
          >
            Register
          </Button>

          <Toaster position="top-right" />

          <p>
            Already You have an Account ?{" "}
            <Link
              onClick={() => {
                setregisterpage(false);
              }}
              style={{ textDecoration: "none", color: "blue" }}
            >
              Login{" "}
            </Link>
          </p>
        </section>
      )}
    </div>
  );
};

export default Loginpage;
