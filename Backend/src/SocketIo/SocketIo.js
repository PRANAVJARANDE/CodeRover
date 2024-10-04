import { Server } from 'socket.io';
import http from 'http';
import { app } from '../app.js';

export const createSocketServer = () => {
    const server = http.createServer(app);
    const io = new Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN,
            methods:  ['GET','POST','PUT','DELETE','PATCH'],
            credentials: true  
        }
    });

    const useridToSocketIdMap = new Map();
    const SocketIdTouseridMap = new Map();

    io.on('connection', (socket) => {
        console.log('User connected',socket.id);
        socket.on('room:join',(data)=>{
            const {user,room}=data;
            useridToSocketIdMap.set(user._id,socket.id);
            SocketIdTouseridMap.set(socket.id,user._id);
            io.to(room).emit('user:joined',{user,id:socket.id});
            socket.join(room);
            io.to(socket.id).emit("room:join",data);
        })
        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
        socket.emit('welcome', 'Welcome to the server!');
    });

    return server;
};
