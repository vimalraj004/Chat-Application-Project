let express = require("express")
const multer = require("multer")
const path=require("path")
const fs = require("fs")
let router = express.Router()
const {registerfunction,loginfunction}=require("../controllers/entryController")

const uploaddir =path.join(__dirname,"../Photos/Images")
if(!fs.existsSync(uploaddir)){
  fs.mkdirSync(uploaddir,{recursive:true})
}

const storage = multer.diskStorage({
  destination:function(req,file,cb){
     cb(null,uploaddir)
  },
  filename:function(req,file,cb){
       cb(null,`${Date.now()}_${file.originalname}`)
  }
})
const upload = multer({storage:storage})
router.use("/Photos/Images",express.static(path.join(__dirname,"../Photos/Images")))
router.post("/registration",upload.single("profilepic"),registerfunction)
router.post("/login",loginfunction)
module.exports = router