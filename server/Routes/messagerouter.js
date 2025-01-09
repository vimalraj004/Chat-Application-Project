const express =require("express")
const {authorizeduser}= require("../middleware/Autherizeduser")
const {sendmessage,fetchallmessage}=require("../controllers/messageController")
const router = express.Router()
router.use(authorizeduser)
router.post("/sendmessage",sendmessage)
router.get("/fetchallmessage/:chatid",fetchallmessage)
module.exports = router