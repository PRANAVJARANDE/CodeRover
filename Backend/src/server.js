import connectDB from "./db/index.js";
import dotenv from 'dotenv'
import { createSocketServer } from "./SocketIo/SocketIo.js";

dotenv.config({
    path:'./.env'
})

const server=createSocketServer();

connectDB()
.then(()=>{
    server.listen(process.env.PORT || 8000,()=>{
        console.log(`APP IS LISTENING ON PORT ${process.env.PORT || 8000}`);
    });
})
.catch((err)=>{
    console.log("MongoDB Connection Failed",err);
})
