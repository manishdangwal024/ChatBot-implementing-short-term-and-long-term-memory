const express= require('express');
const cookieParser=require("cookie-parser");

/*Routes*/
const authRoutes=require("../src/routes/auth.routes");
const chatRoutes=require("../src/routes/chat.routes");


const app= express();

// using middlewares
app.use(express.json());
app.use(cookieParser());


/* Using Routes */
app.use("/api/auth",authRoutes);
app.use("/api/chat",chatRoutes);


module.exports=app;