import express from "express";

import * as userController from "../controllers/userController";
import { verifyToken } from "../middleware/authMiddleware";

//import upload from '../utils/multer';
const Userrouter = express.Router();
// User profile update route
Userrouter.put('/profile/:id', verifyToken, userController.updateUserProfile);
Userrouter.get('/profile/:id',verifyToken, userController.getUserProfile);

export {Userrouter};