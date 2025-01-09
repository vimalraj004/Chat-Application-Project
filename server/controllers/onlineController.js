let express = require("express")
let User = require("../models/userModel");

const fetchallusers = async(req,res)=>{
try{
    const fetchallusers = await User.find({_id:{$ne:req.user._id}}).select("-password")
  
    
    if(fetchallusers){
        return res.status(200).json({message:"fetched all the users",data:fetchallusers})
    }else{
        return res.status(404).json({message:"No users are their"})
    }
    

}catch(error){
    console.log(error);
    return res.status(500).json({error:error, message: "Internal Server Error" })
    

}
}
module.exports = {fetchallusers}