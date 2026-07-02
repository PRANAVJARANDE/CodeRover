import { Server } from 'socket.io';
import http from 'http';
import { app } from '../app.js';

export const createSocketServer = () => {
    const server = http.createServer(app);
    const pendingJoinRequests = new Map();

    const addPendingJoinRequest = (room, request) => {
        const roomRequests = pendingJoinRequests.get(room) || [];
        const filteredRequests = roomRequests.filter((item) => {
            if(item.user?._id && request.user?._id) return item.user._id !== request.user._id;
            return item.requser_id !== request.requser_id;
        });
        filteredRequests.push(request);
        pendingJoinRequests.set(room, filteredRequests);
    };

    const sendPendingJoinRequests = (room, socketId) => {
        const roomRequests = pendingJoinRequests.get(room) || [];
        roomRequests.forEach((request) => {
            io.to(socketId).emit('user:requested_to_join',request);
        });
    };

    const removePendingJoinRequest = (room, requser_id) => {
        const roomRequests = pendingJoinRequests.get(room) || [];
        const filteredRequests = roomRequests.filter((request) => request.requser_id !== requser_id);
        if(filteredRequests.length) pendingJoinRequests.set(room, filteredRequests);
        else pendingJoinRequests.delete(room);
    };

    const removePendingJoinRequestBySocket = (socketId) => {
        pendingJoinRequests.forEach((roomRequests, room) => {
            const filteredRequests = roomRequests.filter((request) => request.requser_id !== socketId);
            if(filteredRequests.length) pendingJoinRequests.set(room, filteredRequests);
            else pendingJoinRequests.delete(room);
        });
    };

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
            socket.data.activeRoom=room;
            socket.data.role='interviewer';
            socket.join(room);
            io.to(socket.id).emit("room:join",data);
            sendPendingJoinRequests(room,socket.id);
            console.log(`Host ${user.fullname} created room- ${room} and Joined`);
        });

        socket.on('room:join_request',(data)=>{
            const {user,room,id,proctorCheck,verificationVideo}=data;
            socket.data.activeRoom=room;
            socket.data.role='interviewee';
            socket.join(room);
            const request={user,id:socket.id,requser_id:socket.id,room,proctorCheck,verificationVideo};
            addPendingJoinRequest(room,request);
            io.to(room).emit('user:requested_to_join',request);
            console.log(`Interviewer ${user.fullname} sent request to join ${room}`);
        });

        socket.on('host:req_accepted',(data)=>{
            const {ta,user,room,id,requser_id}=data;
            removePendingJoinRequest(room,requser_id);
            io.to(requser_id).emit('room:join',data);
        });
        socket.on('host:ready',({room})=>{
            socket.data.activeRoom=room;
            socket.data.role='interviewer';
            socket.join(room);
            sendPendingJoinRequests(room,socket.id);
            socket.to(room).emit('host:available',{from:socket.id});
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
            socket.data.activeRoom=room;
            socket.data.role='interviewer';
            socket.join(room);
            io.to(socket.id).emit("room:join",data);
            sendPendingJoinRequests(room,socket.id);
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
        socket.on('peer:ice-candidate',({to,candidate})=>{
            io.to(to).emit('peer:ice-candidate',{from:socket.id,candidate});
        });
        socket.on('media:status',({to,audioOn,videoOn})=>{
            io.to(to).emit('media:status',{from:socket.id,audioOn,videoOn});
        });
        socket.on('proctor:event',({to,type,message})=>{
            io.to(to).emit('proctor:event',{from:socket.id,type,message});
        });
        socket.on('screen:share-started',({to})=>{
            io.to(to).emit('screen:share-started',{from:socket.id});
        });
        socket.on('screen:share-stopped',({to})=>{
            io.to(to).emit('screen:share-stopped',{from:socket.id});
        });
        socket.on('disconnect', () => {
            const {activeRoom,role}=socket.data;
            if(activeRoom && role==='interviewer')
            {
                socket.to(activeRoom).emit('host:hasleft',{room:activeRoom});
            }
            if(activeRoom && role==='interviewee')
            {
                removePendingJoinRequestBySocket(socket.id);
                socket.to(activeRoom).emit('interviewee:hasleft',{room:activeRoom,msg:"Interviewee disconnected",disconnected:true});
            }
            console.log('User disconnected');
        });
        
        socket.emit('welcome', 'Welcome to the server!');
    });

    return server;
};
