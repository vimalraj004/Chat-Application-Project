let express = require("express")
let router = express.Router()
const {fetchallusers}=require("../controllers/onlineController")
const {authorizeduser} = require("../middleware/Autherizeduser")
router.use(authorizeduser)
router.get("/fetchallusers",fetchallusers)
module.exports = router
