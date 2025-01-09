let express = require("express")

const {fetchallmessage,deleteAllMessage}= require("../controllers/messageController")
const {fetchallchats,creategroup,addPeoplesInGrp,selfGroupExit,removePeople}=require("../controllers/chatController")

const routes =async (socket,io)=>{

  socket.on("joinroom",(data)=>{
    console.log(data,"roomid");
    const {userid} = data
        socket.join(userid)
     
     socket.emit("entry",`New user is joined in this ${userid} room`)
     io.to(userid).emit("loggedin",{message:"fetchallusers"}) 
  })
  socket.on("joinchat",(roomid)=>{
    const {chatid} = roomid
     
      socket.join(chatid)
      socket.emit("joinchat_response",`chat with this  ${chatid} user`) 
  })


    socket.on("newmessage",(body)=>{
      console.log(body,"1234");
        const {chat_id}= body
        console.log(chat_id,"5678");
        console.log("dei ne work agariya");
        
        io.to(chat_id).emit("newmessage_globally",{message:"newmessage_received"})
    }
  )
  socket.on("start_chatting",(body)=>{
     const {userID}= body
     io.to(socket.id).emit("start_chatting_globally",{message:"start a new chat"})
     io.to(userID).emit("start_chatting_globally",{message:"start a new chat"})
  })

  socket.on("startgroupchat",async(body)=>{
    const{users}=body
    users.map((x)=>{
      io.to(x).emit("startgroupchatresponse_globally",{message:"startgroupchat"})
    })
  })

  socket.on("fetchallmessage",async(body)=>{
    try{
      await fetchallmessage(socket,body,io)

    }
    catch(error){
console.log("Error handling on fetching all the message");

    }

  })
  socket.on("fetchallchats",async()=>{
    try{
      await fetchallchats(socket,io)
    }
    catch(error){
      console.log("Error handling on fetchallchats");
      
          }
  })
  socket.on("deleteallmessage",async(body)=>{
    try{
      await deleteAllMessage(socket,body,io)
    }
    catch(error){
      console.log("Error handling on deletingmessages");
      
          }
  })
  socket.on("creategroup",async(payload)=>{
    try{
      console.log(payload,"87564");
      
      await creategroup(socket,payload,io)
    }
    catch(error){
      console.log("Error handling on creatinggroup");
      
          }
  })
  socket.on("addpeoplegroupchat",async(body)=>{
    try{
      await addPeoplesInGrp(socket,body,io)
    }
    catch(error){
      console.log("Error handling on addingpeopletothegroup");
      
          }
  })
  socket.on("selfexitfromgrp",async(body)=>{
    try{
      await selfGroupExit(socket,body,io)
    }
    catch(error){
      console.log("Error handling on selfexitfromgrp");
      
          }
  })
  socket.on("removepeople",async(body)=>{
    try{
        await removePeople(socket,body,io)
    }
    catch(error){
      console.log("Error handling on removepeople");
      
          }
  })
  socket.on("leaveroom",(body)=>{
    const {userid}= body
    socket.leave(userid)
  })
socket.on("disconnect",()=>{
  console.log(`${socket.user._id} user is disconnected`);
  
})
  

}
module.exports = {routes}