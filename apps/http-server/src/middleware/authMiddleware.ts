// genrating the token 
 
import { Request, Response, NextFunction } from "express";

import jwt from 'jsonwebtoken';

require("dotenv").config();

const jwtSecret = process.env.JWT_SECRET|| "default_secret_key";



 // create token
export const createToken = (userId:string,role:string):string =>{
  const token = jwt.sign({ userId, role }, jwtSecret, {
    expiresIn: "1h"});
   return token;
} 


 // verify token
 export const verifyToken = (req:Request,res:Response,next:NextFunction) => {
  const token =req.headers.authorization?.split(" ")[1] || req.cookies?.AccessToken;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  //verify the token 
 try {
    const decoded = jwt.verify(token, jwtSecret) as { userId: string; role: string };

    if(!decoded){
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = { userId: decoded.userId, role: decoded.role }; 
    next(); // Call the next middleware or route handler
  
 } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }   
  
 }
