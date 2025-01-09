let express = require("express")
const multer = require("multer")
const path=require("path")
let router = express.Router()
const {registerfunction,loginfunction}=require("../controllers/entryController")


const storage = multer.diskStorage({
  destination:function(req,file,cb){
     cb(null,"Photos/Images")
  },
  filename:function(req,file,cb){
       cb(null,`${Date.now()}_${file.originalname}`)
  }
})
const upload = multer({storage:storage})

router.post("/registration",upload.single("profilepic"),registerfunction)
router.post("/login",loginfunction)
module.exports = router