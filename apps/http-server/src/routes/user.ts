import express from "express";

import * as userController from "../controllers/userController";
import { verifyToken } from "../middleware/authMiddleware";

import upload from '../utils/multer';
const Userrouter = express.Router();

Userrouter.post("/profile", verifyToken ,upload.single('profilePic'), userController.upsertProfile);

export {Userrouter};