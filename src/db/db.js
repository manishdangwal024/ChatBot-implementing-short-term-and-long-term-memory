const mongoose =require("mongoose")

async function ConnectToDB() {
    try{
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("Connected to DATABASE");
    }
    catch(error){
        console.log("Error in connecting to db",error);
    }
    
    
}

module.exports=ConnectToDB;