const express = require("express")
const multer = require("multer")
const path=require("path")
const router = express.Router()
const {accesschat,fetchallchats,createGroupDp,fetchallgroups,selfGroupExit}= require("../controllers/chatController")
const {authorizeduser}= require("../middleware/Autherizeduser")
router.use(authorizeduser)
const storage = multer.diskStorage({
  destination:function(req,file,cb){
     cb(null,"Photos/Images")
  },
  filename:function(req,file,cb){
       cb(null,`${Date.now()}_${file.originalname}`)
  }
})
const upload = multer({storage:storage})
router.post("/accesschat",accesschat)
router.get("/fetchallchats",fetchallchats)
router.post("/creategrpdpurl",upload.single("groupdp"),createGroupDp)
router.get("/fetchallgroups",fetchallgroups)
router.put("/groupexit",selfGroupExit)
module.exports = router