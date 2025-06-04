import prisma from '../db';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt'
import { z } from 'zod';




import { signupSchema, SignupInput } from '../validations/auth';



export const Signup = async(req: Request, res: Response) : Promise<void> => {
    try{
       const validatedData: SignupInput = signupSchema.parse(req.body);
        const { email, name, password } = validatedData;
       const existingUser = await prisma.user.findUnique({
        where : {email },
       })

       if(existingUser) {
        res.status(400).json({ message: "User already exists" });
         return;
       }
       
       const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
             data : {
                email ,
                name ,
                password : hashedPassword
             }
        })
         res.status(201).json({
          success: true,
          message: "User created successfully",
          user: newUser,
      });
    }catch(error) {

         if (error instanceof z.ZodError) {
      // Handle validation errors
      const errors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      res.status(500).json({
        success: false,
        message: error,
        errors
      });
    }
 }}

