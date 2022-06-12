require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const db = require('./app/config/db');
const routes = require('./routes');
const cors = require('cors');
const socketSever = require('./socketSever');
const port = process.env.PORT || 5000;
const app = express();
const { ExpressPeerServer } = require('peer');

// Middleware
app.use(express.json());
app.use(cors({ credentials: true, origin: ["http://localhost:3000", "http://localhost:5000"] }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Connect DB
db.connect();

const http = require('http').Server(app);

// const io = require('socket.io')(http);

// io.on('connection', (socket) => {
//     socketSever(socket);
// });

// ExpressPeerServer(http, {
//     path: '/',
//     allow_discovery: true,
// });

routes(app);

// Handle 404 errors

app.use((req,res,next)=>{
    const error = new Error('NotFound');
    error.status = 404;
    next(error);   
})

// Handle Error

app.use((error,req, res, next)=>{
    const err = error || {};
    const status = err.status || 500;

    return res.status(status).json({success: false,message: err.message});
})


http.listen(port, () => console.log(`Listening port ${port}`));
