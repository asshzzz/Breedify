// require('dotenv').config({path: './env'})  , breaks the consistency 
import dotenv from 'dotenv'
import http from 'http'
import { Server } from 'socket.io'
import connectDB from './db/index.js'
import app from './app.js'
import { registerSocketHandlers } from './socket.js'

dotenv.config({ //ye isiliye kaafi taaki dotenv ko import se laa ske require se nhi
    path: './.env'
})
connectDB()
.then(() => {
    const httpServer = http.createServer(app)
    const io = new Server(httpServer, {
        cors: {
            origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map((origin) => origin.trim()),
            credentials: true
        }
    })
    registerSocketHandlers(io)
    httpServer.listen(process.env.PORT || 8000 , () => {
        console.log(`Server is running at PoRt : ${process.env.PORT}`)

    })
  
})
.catch((err) => {

    console.log("MONGO db connection failed !!!" , err)
})

