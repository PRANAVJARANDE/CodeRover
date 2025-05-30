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
        });
        socket.on('host:leave',(data)=>{
            const {room,remoteSocketId}=data;
            io.to(remoteSocketId).emit('host:hasleft',data);
        });
        socket.on('interviewee:leave',(data)=>{
            const {room,remoteSocketId,msg}=data;
            io.to(remoteSocketId).emit('interviewee:hasleft',data);
        });
        socket.on('code:change',(data)=>{
            const {remoteSocketId}=data;
            io.to(remoteSocketId).emit('change:code',data);
        });
        socket.on('question:change',(data)=>{
            const {remoteSocketId}=data;
            io.to(remoteSocketId).emit('change:question',data);
        });
        socket.on('language:change',(data)=>{
            const {remoteSocketId,language}=data;
            io.to(remoteSocketId).emit('change:language',data);
        });
        socket.on('cases:change',(data)=>{
            const {remoteSocketId,cases}=data;
            io.to(remoteSocketId).emit('change:cases',data);
        });
        socket.on('code:run',(data)=>{
            const {remoteSocketId}=data;
            io.to(remoteSocketId).emit('run:code',data);
        });
        socket.on('room:join',(data)=>{
            const {user,room,id}=data;
            socket.join(room);
            io.to(socket.id).emit("room:join",data);
            console.log('user joined the room');
        });
        socket.on('time:change',(data)=>{
            const {remoteSocketId}=data;
            io.to(remoteSocketId).emit('change:time',data);
        });
        socket.on('user:call',(data)=>{
            const {remoteSocketId,offer}=data;
            io.to(remoteSocketId).emit('incomming:call',{from:socket.id,offer});
        });
        socket.on('call:accepted',({to,answer})=>{
            io.to(to).emit('call:accepted',{from:socket.id,answer});
        });
        socket.on('peer:nego:needed',({to,offer})=>{
            io.to(to).emit('peer:nego:needed',{from:socket.id,offer});
        });
        socket.on('peer:nego:done',({to,ans})=>{
            io.to(to).emit('peer:nego:final',{from:socket.id,ans});
        });
        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
        
        socket.emit('welcome', 'Welcome to the server!');
    });

    return server;
};
