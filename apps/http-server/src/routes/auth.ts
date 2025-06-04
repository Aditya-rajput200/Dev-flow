import express from "express"
import { Request, Response } from "express";
import rateLimit from 'express-rate-limit';
import prisma from "../db";

import { Signup } from "../controllers/authController";



const authRouter = express.Router()



const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 signup requests per window
  message: 'Too many signup attempts, please try again later'
});

authRouter.post('/signup', signupLimiter, Signup);

export default authRouter