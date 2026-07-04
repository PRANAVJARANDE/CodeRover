import { Server } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';
import { app } from '../app.js';
import { User } from '../models/user.model.js';
import { Interview } from '../models/interview.model.js';

const getCookieValue = (cookieHeader = "", name) => {
    return cookieHeader
        .split(";")
        .map((cookie) => cookie.trim())
        .find((cookie) => cookie.startsWith(`${name}=`))
        ?.split("=")[1];
};

const getSocketToken = (socket) => {
    const authToken = socket.handshake.auth?.token;
    const headerToken = socket.handshake.headers.authorization?.replace("Bearer ","");
    const cookieToken = getCookieValue(socket.handshake.headers.cookie,"accessToken");
    return authToken || headerToken || cookieToken;
};

const publicUser = (user) => ({
    _id:user._id.toString(),
    fullname:user.fullname,
    username:user.username,
    email:user.email,
    avatar:user.avatar,
});

const asId = (value) => {
    return value?._id?.toString?.() || value?.toString?.();
};

export const createSocketServer = () => {
    const server = http.createServer(app);
    const pendingJoinRequests = new Map();

    const addPendingJoinRequest = (room, request) => {
        const roomRequests = pendingJoinRequests.get(room) || [];
        const filteredRequests = roomRequests.filter((item) => {
            if(item.user?._id && request.user?._id) return item.user._id.toString() !== request.user._id.toString();
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

    const takePendingJoinRequest = (room, requser_id) => {
        const roomRequests = pendingJoinRequests.get(room) || [];
        const request = roomRequests.find((item) => item.requser_id === requser_id);
        const filteredRequests = roomRequests.filter((item) => item.requser_id !== requser_id);
        if(filteredRequests.length) pendingJoinRequests.set(room, filteredRequests);
        else pendingJoinRequests.delete(room);
        return request;
    };

    const removePendingJoinRequestBySocket = (socketId) => {
        pendingJoinRequests.forEach((roomRequests, room) => {
            const filteredRequests = roomRequests.filter((request) => request.requser_id !== socketId);
            if(filteredRequests.length) pendingJoinRequests.set(room, filteredRequests);
            else pendingJoinRequests.delete(room);
        });
    };

    const loadRoomMembership = async(room, userId) => {
        const interview = await Interview.findOne({roomId:room})
            .populate("interviewer","fullname email avatar username")
            .populate("interviewee","fullname email avatar username");

        if(!interview)
        {
            throw new Error("Interview room not found");
        }

        const currentUserId = userId.toString();
        const interviewerId = asId(interview.interviewer);
        const intervieweeId = asId(interview.interviewee);

        if(interviewerId === currentUserId)
        {
            return {interview, role:"interviewer"};
        }

        if(intervieweeId === currentUserId)
        {
            return {interview, role:"interviewee"};
        }

        throw new Error("You are not part of this interview");
    };

    const joinRoomAs = async(socket, room, expectedRole) => {
        if(!room)
        {
            throw new Error("Room is required");
        }

        const membership = await loadRoomMembership(room,socket.data.user._id);
        if(expectedRole && membership.role !== expectedRole)
        {
            throw new Error(`Only the ${expectedRole} can perform this action`);
        }

        socket.data.activeRoom = room;
        socket.data.role = membership.role;
        socket.data.interviewId = membership.interview._id.toString();
        socket.join(room);
        return membership;
    };

    const canRelayTo = (socket, targetSocketId) => {
        if(!targetSocketId || !socket.data.activeRoom || !socket.data.interviewId)
        {
            return false;
        }

        const targetSocket = io.sockets.sockets.get(targetSocketId);
        return Boolean(
            targetSocket &&
            targetSocket.data.activeRoom === socket.data.activeRoom &&
            targetSocket.data.interviewId === socket.data.interviewId
        );
    };

    const relayToPeer = (socket, targetSocketId, event, payload) => {
        if(!canRelayTo(socket,targetSocketId))
        {
            socket.emit('room:error',{message:"Cannot relay outside your interview room"});
            return;
        }

        io.to(targetSocketId).emit(event,payload);
    };

    const handleSocketError = (socket, error) => {
        socket.emit('room:error',{message:error.message || "Realtime action failed"});
    };

    const registerHandler = (socket, event, handler) => {
        socket.on(event,(payload) => {
            Promise.resolve(handler(payload)).catch((error) => handleSocketError(socket,error));
        });
    };

    const io = new Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN,
            methods:  ['GET','POST','PUT','DELETE','PATCH'],
            credentials: true  
        }
    });

    io.use(async(socket,next) => {
        try {
            const token = getSocketToken(socket);
            if(!token)
            {
                throw new Error("Authentication required");
            }

            const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
            const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
            if(!user)
            {
                throw new Error("Invalid access token");
            }

            socket.data.user = user;
            next();
        } catch (error) {
            next(new Error("Socket authentication failed"));
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected',socket.id);

        const joinAsInterviewer = async(data = {}) => {
            const {room} = data;
            await joinRoomAs(socket,room,"interviewer");
            socket.emit("room:join",{
                room,
                id:socket.id,
                ta:null,
                user:publicUser(socket.data.user),
                role:"interviewer",
            });
            sendPendingJoinRequests(room,socket.id);
            console.log(`Host ${socket.data.user.fullname} joined room ${room}`);
        };

        registerHandler(socket,'create-room',joinAsInterviewer);
        registerHandler(socket,'room:join',joinAsInterviewer);

        registerHandler(socket,'room:join_request',async(data = {}) => {
            const {room,proctorCheck,verificationVideo}=data;
            await joinRoomAs(socket,room,"interviewee");
            const request={
                user:publicUser(socket.data.user),
                id:socket.id,
                requser_id:socket.id,
                room,
                proctorCheck,
                verificationVideo,
            };
            addPendingJoinRequest(room,request);
            socket.to(room).emit('user:requested_to_join',request);
            console.log(`Interviewee ${socket.data.user.fullname} requested to join ${room}`);
        });

        registerHandler(socket,'host:req_accepted',async(data = {}) => {
            const {room,requser_id}=data;
            await joinRoomAs(socket,room,"interviewer");
            const request = takePendingJoinRequest(room,requser_id);
            const targetSocket = io.sockets.sockets.get(requser_id);
            if(!request || !targetSocket || !canRelayTo(socket,requser_id))
            {
                throw new Error("Join request is no longer available");
            }

            targetSocket.join(room);
            io.to(requser_id).emit('room:join',{
                room,
                id:requser_id,
                requser_id,
                ta:socket.id,
                user:publicUser(socket.data.user),
                role:"interviewee",
            });
        });

        registerHandler(socket,'host:ready',async({room} = {}) => {
            await joinRoomAs(socket,room,"interviewer");
            sendPendingJoinRequests(room,socket.id);
            socket.to(room).emit('host:available',{from:socket.id});
        });

        registerHandler(socket,'host:leave',(data = {}) => {
            relayToPeer(socket,data.remoteSocketId,'host:hasleft',{...data,room:socket.data.activeRoom});
        });

        registerHandler(socket,'interviewee:leave',(data = {}) => {
            relayToPeer(socket,data.remoteSocketId,'interviewee:hasleft',{...data,room:socket.data.activeRoom});
        });

        registerHandler(socket,'code:change',(data = {}) => {
            relayToPeer(socket,data.remoteSocketId,'change:code',{...data,from:socket.id});
        });

        registerHandler(socket,'question:change',(data = {}) => {
            relayToPeer(socket,data.remoteSocketId,'change:question',{...data,from:socket.id});
        });

        registerHandler(socket,'language:change',(data = {}) => {
            relayToPeer(socket,data.remoteSocketId,'change:language',{...data,from:socket.id});
        });

        registerHandler(socket,'cases:change',(data = {}) => {
            relayToPeer(socket,data.remoteSocketId,'change:cases',{...data,from:socket.id});
        });

        registerHandler(socket,'code:run',(data = {}) => {
            relayToPeer(socket,data.remoteSocketId,'run:code',{...data,from:socket.id});
        });

        registerHandler(socket,'time:change',(data = {}) => {
            relayToPeer(socket,data.remoteSocketId,'change:time',{...data,from:socket.id});
        });

        registerHandler(socket,'user:call',(data = {}) => {
            relayToPeer(socket,data.remoteSocketId,'incomming:call',{from:socket.id,offer:data.offer});
        });

        registerHandler(socket,'call:accepted',({to,answer} = {}) => {
            relayToPeer(socket,to,'call:accepted',{from:socket.id,answer});
        });

        registerHandler(socket,'peer:nego:needed',({to,offer} = {}) => {
            relayToPeer(socket,to,'peer:nego:needed',{from:socket.id,offer});
        });

        registerHandler(socket,'peer:nego:done',({to,ans} = {}) => {
            relayToPeer(socket,to,'peer:nego:final',{from:socket.id,ans});
        });

        registerHandler(socket,'peer:ice-candidate',({to,candidate} = {}) => {
            relayToPeer(socket,to,'peer:ice-candidate',{from:socket.id,candidate});
        });

        registerHandler(socket,'media:status',({to,audioOn,videoOn} = {}) => {
            relayToPeer(socket,to,'media:status',{from:socket.id,audioOn,videoOn});
        });

        registerHandler(socket,'proctor:event',({to,type,message} = {}) => {
            relayToPeer(socket,to,'proctor:event',{from:socket.id,type,message});
        });

        registerHandler(socket,'screen:share-started',({to} = {}) => {
            relayToPeer(socket,to,'screen:share-started',{from:socket.id});
        });

        registerHandler(socket,'screen:share-stopped',({to} = {}) => {
            relayToPeer(socket,to,'screen:share-stopped',{from:socket.id});
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
