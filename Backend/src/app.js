import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app=express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    methods: 'GET,POST,PUT,DELETE,PATCH',
    credentials: true
}));


app.use(express.json({limit:'16kb'}));
app.use(express.urlencoded({extended:false}));
app.use(express.static("public"));
app.use(cookieParser());

//Import routes
import userRouter from './routes/user.routes.js'
import tweetRouter from './routes/tweet.routes.js'
import problemRouter from './routes/problem.routes.js'
import runcodeRouter from './routes/runcode.route.js'

//Routes Declaration
app.use('/api/v1/users',userRouter);
app.use('/api/v1/tweet',tweetRouter);
app.use('/api/v1/problem',problemRouter);
app.use('/api/v1/runcode',runcodeRouter);

export {app}