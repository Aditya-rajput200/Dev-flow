
import express from "express";
// import {GoogleAuth,EmailPassRegister,EmailPassLogin,Logout,GitAuth,ForgetPassword} from '../controllers/authController'
import * as authController from "../controllers/authController";
const Authrouter = express.Router();
 
Authrouter.post("/google", authController.GoogleAuth);
//Authrouter.post("/gitHub",authController.GitAuth);
Authrouter.post("/login", authController.EmailPassLogin);
Authrouter.post("/register", authController.EmailPassRegister);
Authrouter.post("/logout", authController.Logout);
//Authrouter.post("/forget", authController.ForgetPassword);

export { Authrouter };
