import { type } from "@testing-library/user-event/dist/type";
import axios from "axios";
import { baseurl } from "./config";
import { json } from "react-router-dom";
import { io } from "socket.io-client";
import toast, { Toaster } from "react-hot-toast";
import { aside } from "framer-motion/client";
export const gettoken = () => {
  const userdata = JSON.parse(localStorage.getItem("userdata"));
  const usertoken = userdata?.data?.data?.token;
  return usertoken;
};
export const user = () => {
  const userdata = JSON.parse(localStorage.getItem("userdata"));

  return userdata;
};

export const commonservice = async (endpoint, type, body) => {
  try {
    const response = await axios({
      baseURL: baseurl,
      url: endpoint,
      method: type,
      data: body,
      headers: {
        // "Content-Type":"application/json",
        Authorization: `Bearer ${gettoken()}`,
      },
    });
    return response;
  } catch (error) {
    if (error.response) {
      return error.response;
    } else {
      console.log("Network error or other issue", error);
      throw error;
    }
  }
};
export const loginservice = async (endpoint, type, body) => {
  try {
    const response = await axios({
      baseURL: baseurl,
      url: endpoint,
      method: type,
      data: body,
      headers: {
        // "Content-Type":"application/json",
      },
    });
    return response;
  } catch (error) {
    if (error.response) {
      return error.response;
    } else {
      console.log("Network error or other issue", error);
      throw error;
    }
  }
};

let socket;
export const initsocket = async (usertoken) => {
  <Toaster position="top-right" />;
  try {
    if (!socket) {
      socket = io(`${baseurl}`, {
        transports: ["websocket"],
        auth: {
          token: usertoken,
        },
      });

      socket.on("connect", () => {});
    }

    return socket;
  } catch (error) {
    console.log("socket initialization error", error);
    toast.error("Failed to initialize the socket");
  }
};
export const getsocket = () => {
  <Toaster position="top-right" />;
  if (!socket) {
    toast.error("socket not initialized");
  } else {
    return socket;
  }
};

export const convertFileToImg = (createimage) => {
  if (createimage instanceof File) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imgdata = reader.result; // The image data as a Base64 string

        resolve(imgdata); // Resolve the promise with the image data
      };
      reader.onerror = (error) => {
        reject(error); // Reject the promise if an error occurs
      };
      reader.readAsDataURL(createimage); // Start reading the file
    });
  } else {
    return Promise.reject(new Error("Input is not a File instance"));
  }
};
