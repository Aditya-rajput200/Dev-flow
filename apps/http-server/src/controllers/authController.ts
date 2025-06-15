import { Request, Response } from 'express';
import { createToken } from '../middleware/authMiddleware';
import prisma from '@dev-flow/prisma';
import bcrypt from "bcrypt";
import {verifyGoogleToken} from '../utils/googleVerifyToken'

// email password auth
module.exports.EmailPassLogin= async (req: Request, res: Response) => {

  const {email,password}=req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

   const Userpassword =  await bcrypt.compare(password, user.password);
    if (!Userpassword) {
      return res.status(401).json({ message: 'Invalid password' });
    }
    //Genrate token
    const token = createToken(user.id, user.role);
    // Set the token in cookies
    res
    .status(200)
    .cookie("AccessToken", token, {
      maxAge: 3600000,
      httpOnly: true,
    })

    .json(token + "User loged in succesfully");

   return token;
 } catch (error) {
    console.error('Error during authentication:', error);
    return res.status(500).json({ message: 'Internal server error' });
    
  }

}
//email register
module.exports.EmailPassRegister = async (req: Request, res: Response) => {
  const {email, password,name,phone,} = req.body;
  if (!email || !password || !name ) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  const AllreadyExist_email = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (AllreadyExist_email) {
    return res.status(400).json("Email already exist");
  }
  try {
    
    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create user
    const NewUser = await prisma.user.create({
      data: { 
        email,
        password: hashedPassword,
        name,
        phone,
      },
    });
    //Genrate token
    const token = createToken(NewUser.id, NewUser.role);
    // Set the token in cookies
    res
    .status(201)
    .cookie("AccessToken", token, {
      maxAge: 3600000,
      httpOnly: true,
    })
    
    .json({ message: 'User registered successfully', token });
    return ;
  } catch (error) {
    console.error('Error during registration:', error);
    return res.status(500).json({ message: 'Internal server error' });
    
  }

}

//Logoutuser
module.exports.Logout = async (req: Request, res: Response) => {
  try { 
    // Clear the token from cookies
    res
      .status(200)
      .clearCookie("AccessToken")
      .json({ message: 'User logged out successfully' });
  } catch (error) {
    console.error('Error during logout:', error);
    return res.status(500).json({ message: 'Internal server error' });
  } 
}
// google  auth
module.exports.GoogleAuth = async (req: Request, res: Response) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: "Missing Google ID token" });
  }

  try {
    const userInfo = await verifyGoogleToken(idToken);

    // Check if user exists or create new user
    let user = await prisma.user.findUnique({
      where: { email: userInfo.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: userInfo.email,
          name: userInfo.name,
          avatarImg: userInfo.picture,
          oauthProvider: "google",
          oauthId: userInfo.id,
        },
      });
    }

    if(user) {
      //find the user is that user is already register by the google or not
      const exsitingUser= await prisma.user.findUnique({
        where: { email: userInfo.email },
      })
      if(exsitingUser.oauthProvider && exsitingUser.oauthProvider !== "google") {
        return res.status(400).json({ message: "User is not registered " });
    }
    const token = createToken(exsitingUser.id, exsitingUser.role);
    res
    .cookie("AccessToken", token, {
      httpOnly: true,
      maxAge: 3600000,
    })
    .status(200)
    .json({ token, message: "Login successful" });
      return;
     
  }

    const token = createToken(user.id, user.role);

    res
      .cookie("AccessToken", token, {
        httpOnly: true,
        maxAge: 3600000,
      })
      .status(200)
      .json({ token, message: "Login successful" });

  } catch (error) {
    console.error("Google login failed:", error);
    res.status(401).json({ message: "Invalid Google token" });
  }
}; 

//github auth
module.exports.GitAuth= async (req: Request, res: Response) => {
 
}

// forget password
module.exports.ForgetPassword = async (req: Request, res: Response) => {  
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if(user.oauthProvider) {
      return res.status(400).json({ message: 'Cannot reset password for OAuth users' });
    }
      // implement reset password logic > sending the link to the mail and user can reset the password

    return res.status(200).json({ message: 'Password reset link sent to your email' });

  } catch (error) {
    console.error('Error during password reset:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}






