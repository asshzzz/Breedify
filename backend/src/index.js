// require('dotenv').config({path: './env'})  , breaks the consistency 
import dotenv from 'dotenv'
import connectDB from './db/index.js'
import app from './app.js'

dotenv.config({ //ye isiliye kaafi taaki dotenv ko import se laa ske require se nhi
    path: './.env'
})
connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000 , () => {
        console.log(`Server is running at PoRt : ${process.env.PORT}`)

    })
  
})
.catch((err) => {

    console.log("MONGO db connection failed !!!" , err)
})

