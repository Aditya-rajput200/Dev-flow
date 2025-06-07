import { Router } from 'express';
import {
  login,
  logout,
  oauthCallback
} from '../controllers/authController';
import { 
  csrfProtection, 
  csrfTokenProvider,
  csrfErrorHandler
} from '../middleware/csrfMiddleware';
import { isUnauthenticated } from '../middleware/authMiddleware';

const authRouter = Router();


// Google OAuth routes
authRouter.get('/google', isUnauthenticated, login);
authRouter.get('/google/callback', isUnauthenticated, oauthCallback);


// Logout with CSRF protection (POST method)
authRouter.post('/logout', csrfProtection, csrfErrorHandler, logout);

export default authRouter;