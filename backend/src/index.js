// require('dotenv').config({path: './env'})  , breaks the consistency 
import dotenv from 'dotenv'
import connectDB from './db/index.js'
import {app} from './app.js'

dotenv.config({ //ye isiliye kaafi taaki dotenv ko import se laa ske require se nhi
    path: './.env'
})
connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000 , () => {
        console.log(`Server is running at PoRt : ${process.env.PORT}`)

    })
    // app.on('error' , (error) => {
    //     console.log("Error" , error)
    //     throw error
    // })
})
.catch((err) => {

    console.log("MONGO db connection failed !!!" , err)
})
// import express from "express";
// const app = express()(
//   /* async → function ko asynchronous banata hai. Iske andar hamesha ek Promise return hota hai.
//    await → promise ke resolve/reject hone ka wait karta hai without blocking main thread. */
//   async () => {
//     try {
//       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//       app.on("error ", (error) => {
//         /* app ek Express instance hai.
//        on('error') ek event listener hai, jo tab trigger hota hai jab Express
//        app me koi error event emit hota hai. */
//         console.log("Error", error);
//         throw error;
//       });

//       app.listen(process.env.PORT , () => {
//          console.log(`App is listening on port ${process.env.PORT}`)
//       })
//     } catch (error) {
//       console.error("ERROR: ", error);
//     }
//   }
// )();
