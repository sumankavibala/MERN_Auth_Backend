import Express from "express";
import dotenv from "dotenv";
import { connectDB } from "./database/connectDB";
import { authrouter } from "./router/authRouter";
import cookieParser from 'cookie-parser';

dotenv.config();

const app = Express();

const port = process.env.PORT || 6000;

app.use(cookieParser());//allows to parse the incoming cookies

app.use(Express.json()); //allows to parse incoming request : req.body

app.listen(port,()=>{
    connectDB();
    console.log("Application running on port",port)
});

app.use('/api/auth',authrouter);