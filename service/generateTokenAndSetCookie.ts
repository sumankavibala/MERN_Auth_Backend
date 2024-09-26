import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';


export const generateTokenAndSetCookie = (res:Response, userId:Types.ObjectId)=>{

    //token block consist of jwt token which contains userid and expiry date of jwt token.
    const token = jwt.sign({userId},process.env.JWT_SECRET || '',{
    expiresIn:"7d",
        })
    // res.cookie ----?
    res.cookie("token", token,{
        httpOnly:true,//cookie cannot be accessed from javascript
        secure:process.env.NODE_ENV === 'production', //this make secure only available for production and not for QA
        sameSite:"strict", //prevents CSRS attack
        maxAge: 7*24*60*60*1000//7days in miliseconds 
    })
    return token;
}