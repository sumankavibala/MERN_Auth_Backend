import mongoose from 'mongoose';

export const connectDB = async()=>{
    try {
        const connection = await mongoose.connect('mongodb://localhost:27017/auth_db')
        console.log('MongoDB connect successfully')
    } catch (error) {
        console.log("Error-->>",error)
    }
}