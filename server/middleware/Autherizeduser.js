const jwt = require("jsonwebtoken")
const Usermodel = require("../models/userModel")

const authorizeduser = async(req,res,next)=>{
try{
    if(req.headers){
 
        
        if(req.headers.authorization){  
            const bearertoken = req.headers.authorization
            const token = bearertoken.split(" ")[1]
            const usertoken = jwt.verify(token,process.env.jwtsecretkey)
     
            const user = await Usermodel.findById(usertoken.userid).select("-password")
            if(!user){
                return res.status(401).json({message:"No user"})
            }
            else{
                req.user = user
                next()
            }
           
        
        }
        else{
            return res.status(401).json({message:"No Authorization in req"})
        }

    }
    else{
        return res.status(401).json({message:"No headers in req"})
    }

}
catch(error){
    console.log(error);
    return res.status(500).json({message:"failed to check authorization "})

    
}
}

module.exports = {authorizeduser}