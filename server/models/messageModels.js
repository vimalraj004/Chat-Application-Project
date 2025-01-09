const { type } = require("express/lib/response")
const mongoose = require("mongoose")
const messageModel = mongoose.Schema({
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    content:{
        type:String,
        trim:true,
    },
    receiver:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    chat:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Chat"
    },
    profilepic:{
        type:String,
        // required:true
},
    timestamp:{
       type:Date,
       default: Date.now,
    }
    


})
const Message = mongoose.model("Message",messageModel)
module.exports = Message