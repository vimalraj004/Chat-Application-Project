const jwt = require("jsonwebtoken")
const Usermodel = require("../models/userModel")

const socketauth = async(socket,next)=>{
 try{

    if(socket.handshake){
        if(socket.handshake.auth){
            const token = socket.handshake.auth.token
            const usertoken = jwt.verify(token,process.env.jwtsecretkey) 
            const user = await Usermodel.findById(usertoken.userid).select("-password")
            if(!user){
                return next(new Error("No user"))  
            }
            else{
                socket.user = user
                 next()

            }
        }
        else{
            return next(new Error("No auth in socket"))

        }

    }
    else{
        return next(new Error("No handshake in socket"))
    }
    

 }catch(error){
    console.log(error);
    return next(new Error("Failed to check socketauth"))
 }
}
module.exports = socketauth