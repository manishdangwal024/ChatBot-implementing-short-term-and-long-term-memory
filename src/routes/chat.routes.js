const express= require("express");
const { authMiddleware } = require("../middlewares/auth.middlewares");
const { createChat } = require("../controller/chat.controller");

const router=express.Router();

// POST  /api/chat/  to create new chat 
router.post("/",authMiddleware,createChat)



module.exports=router;