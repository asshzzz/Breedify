import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"

const connectDB = async () => {
    try {
         const connectionInstance =  await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`) //connectionInstance holds the response
        console.log(`\n MongoDB connected! DB HOST: ${connectionInstance.connection.host}`)
        } catch (error) {
        console.log('MONGODB connection FAILED' , error)
        process.exit(1)/* Ye Node.js ka built-in method hai jo current process ko band kar deta hai.
                          Matlab jo bhi Node.js app chal rahi hai (server, script), turant exit/stop ho jayegi. */
    }
}

export default connectDB