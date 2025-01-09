const { type } = require("express/lib/response")
let mongoose = require("mongoose")
const chatModel = mongoose.Schema({
    chatname:{
        type:String
    },  
    isgroupchat:{
        type:Boolean
    },
    users:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    latestmessage:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Message"
    }],
    groupadmin:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"

    },
    profilepic:{
        type:String,
        // required:true
},
groupdp:{
    type:String,
    // required:true

},timestamp:{
        type:Date,
        default: Date.now,
     }

})
const Chat = mongoose.model("Chat",chatModel)
module.exports = Chat