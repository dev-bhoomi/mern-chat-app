const express = require("express");
const cors = require("cors")
const mongoose = require("mongoose");
const userRoutes=require("./routes/userRoutes");
const messagesRoutes = require("./routes/messagesRoute");
const socket = require("socket.io")


const app = express();
require("dotenv").config(); 

app.use(cors());
app.use(express.json());

app.use("/api/auth",userRoutes);
app.use("/api/messages",messagesRoutes);

mongoose.connect(process.env.MONGO_URL,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
})
.then(()=>{
    console.log("DB Connection Successfull")
})
.catch((err)=>{
    console.log(err.message)
})

const server = app.listen(process.env.PORT, ()=>{
    console.log(`Server Started on Port ${process.env.PORT}`)
});


const io = socket(server,{
    cors:{
        origin:"http://localhost:3000",
        credentials:true,
    },
})
global.onlineUsers= new Map();
io.on("connection",(socket)=>{
    global.chatSocket=socket;
    socket.on("add-user",(userId)=>{
        onlineUsers.set(userId,socket.id)
    });
    socket.on("send-msg",(data)=>{
        console.log("=======",data)
        const sendUserSocket=onlineUsers.get(data.to);
        if(sendUserSocket){
            socket.to(sendUserSocket).emit("msg-recieve",data.message)
        }
    })
})


