const userModel=require("../models/user.model")
const jwt=require("jsonwebtoken")

async function authMiddleware(req,res,next) {
    const {token} =req.cookies;
    if(!token){
       return res.status(401).json({message:"Unautharized"})
    }
    try {
        
        const decoded= jwt.verify(token,process.env.JWT_SECRET)
        const user=await userModel.findById(decoded.id).select("-password");
        req.user=user
        next();
    } catch (error) {
        res.status(401).json({message:"Unauthorized"})
    }
}

module.exports={authMiddleware}