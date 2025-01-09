let express = require("express");
let User = require("../models/userModel");
const { generatetoken } = require("../controllers/config/common");
const bcrypt = require("bcrypt");

const registerfunction = async (req, res) => {
  const { name, email, password } = req.body;

  const profilepic = req.file.filename;

  try {
    // check all the field is present or not
    if (!name || !email || !password) {
      res.status(400).json({ message: "All the fields are Mandatory" });
    }
    // check the existingmail
    const existingemail = await User.findOne({ email: email });

    if (existingemail) {
      return res.status(409).json({ message: "Already email is present" });
    }
    // check the existinguser
    const existinguser = await User.findOne({ name: name });

    if (existinguser) {
      return res.status(409).json({ message: "Already username  is present" });
    }
    const hashpassword = await bcrypt.hashSync(password, 12);
    const newuser = await User.create({
      name,
      email,
      password: hashpassword,
      profilepic,
    });
    const usertoken = await generatetoken(newuser._id);
    if (usertoken) {
      return res.status(201).json({
        message: "Registered successfully",
        data: {
          _id: newuser._id,
          name: newuser.name,
          email: newuser.email,
          isAdmin: newuser.isAdmin,
          token: usertoken,
        },
      });
    } else {
      return res.status(400).json({ message: "Failed to Register " });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const loginfunction = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (user) {
      const valid = await bcrypt.compare(password, user.password);
      if (valid) {
        const usertoken = await generatetoken(user._id);
        return res.status(200).json({
          message: "Login successfully",
          data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: usertoken,
            profilepic: user.profilepic,
          },
        });
      } else {
        return res.status(401).json({ message: "wrong useremail or password" });
      }
    } else {
      return res.status(401).json({ message: "unauthorized user" });
    }
  } catch (error) {
    console.log(error);
  }
};
module.exports = { registerfunction, loginfunction };
