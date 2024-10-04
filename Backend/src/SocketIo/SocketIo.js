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

    io.on('connection', (socket) => {
        console.log('User connected',socket.id);
        socket.on('create-room',(data)=>{
            const {user,room}=data;
            socket.join(room);
            io.to(socket.id).emit("room:join",data);
            console.log(`Host ${user.fullname} created room- ${room} and Joined`);
        });

        socket.on('room:join_request',(data)=>{
            const {user,room,id}=data;
            io.to(room).emit('user:requested_to_join',{user,id:socket.id,requser_id:id});
            console.log(`Interviewer ${user.fullname} sent request to join ${room}`);
        });

        socket.on('host:req_accepted',(data)=>{
            const {ta,user,room,id,requser_id}=data;
            io.to(requser_id).emit('room:join',data);
        })

        socket.on('room:join',(data)=>{
            const {user,room,id}=data;
            socket.join(room);
            io.to(socket.id).emit("room:join",data);
            console.log('user joined the room');
        })
        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
        socket.emit('welcome', 'Welcome to the server!');
    });

    return server;
};
