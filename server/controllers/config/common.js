
let jwt = require("jsonwebtoken")
require("dotenv").config()


const generatetoken = async (userid)=>{
  
    
try{
    const token = await jwt.sign({userid},process.env.jwtsecretkey,{expiresIn:"2d"})
     return token

}
catch(error){
    console.log(error);
    
}
}
module.exports = {generatetoken}