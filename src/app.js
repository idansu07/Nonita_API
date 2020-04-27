const express = require('express')
const cors = require('./middleware/cors')
const user = require('./controllers/user')
const post = require('./controllers/post')
const comment = require('./controllers/comment')
const message = require('./controllers/message')
const http = require('http')
const socketio = require('socket.io')
const userService = require('./services/user')
const messageService = require('./services/message')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use((req,res,next) => {
    req.io = io
    next()
})

io.on('connection' , socket => {
    socket.on('connection', async ({client}) => {
        try {
           const user = await new userService().addSocketId(client._id,socket.id)
           socket.broadcast.emit('userConnected' ,user)
        } catch (error) {
            console.log(error)
        }
    })

    socket.on('disconnect', async () => {
        try {
            const user = await new userService().removeSocketId(socket.id)
            socket.broadcast.emit('userDisconnected' ,user)
        } catch (error) {
            console.log(error)
        }
    });

    socket.on('addMessage' , async(message) => {
        try {
            const newMessage = await new messageService().addMessage(message)
            socket.emit('messageAdded' , newMessage)
            const clientSocketId = message.reciver.socketId
            if(clientSocketId){
                socket.broadcast.to(clientSocketId).emit('messageAdded' , newMessage)
            }
        } catch (error) {
            console.log(error)
        }
    })
})

app.use(cors)
app.use(express.json())
app.use(user)
app.use(post)
app.use(comment)
app.use(message)
module.exports = server