const { type } = require("express/lib/response");
const mongoose = require("mongoose")
const userModel = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true

    },
    password:{
        type:String,
        required:true

    },
    profilepic:{
            type:String,
            required:true
    },
    timestamp:{
        type:Date,
        default: Date.now,
     }

})
const User=mongoose.model("User",userModel);
module.exports = User