import { RequestHandler } from 'express';
import passport from 'passport';
import { AppError } from '../utils/errorHandler';

// Extend express-session types to include returnTo
declare module 'express-session' {
  interface SessionData {
    returnTo?: string;
  }
}

export const login: RequestHandler = (req, res, next) => {
  // Save redirect path for after login
   console.log("👣 Login route hit");
  if (req.query.returnTo) {
    req.session.returnTo = req.query.returnTo as string;
  }
  
    passport.authenticate('google', {
      scope: ['profile', 'email']
    })(req, res, next);
 
};

export const logout: RequestHandler = async (req, res) => {
  try {
    if (!req.session) {
      return res.redirect('/');
    }

    // Destroy session from store
    await new Promise<void>((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) reject(new AppError('SessionDestruction', 'Failed to destroy session', 500));
        resolve();
      });
    });

    // Clear session cookie
    res.clearCookie('connect.sid', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    });

    res.redirect('/');
  } catch (err) {
    res.status(500).json({ 
      error: 'LOGOUT_FAILED',
      message: typeof err === 'object' && err !== null && 'message' in err ? (err as any).message : String(err)
    });
  }
};

export const oauthCallback: RequestHandler = (req, res, next) => {
  console.log("🔁 Hit /auth/google/callback");
  passport.authenticate('google', (err: any, user: Express.User | false | null, info: any) => {
     console.log("🔐 Passport callback triggered", { err, user, info });
    try {
      if (err) throw new AppError('AuthError', 'Authentication error', 500, err);
      if (!user) throw new AppError('UserNotFound', 'Authentication failed', 401);
      
      
      req.logIn(user, (loginErr: any) => {
        if (loginErr) throw new AppError('LoginError', 'Session creation failed', 500, loginErr);
        
        // Redirect to originally requested page
        const redirectUrl = req.session.returnTo || '/';
        if (req.session.returnTo) delete req.session.returnTo;
        
         console.log(`✅ Logged in successfully. Redirecting to: ${redirectUrl}`); 
        res.redirect(redirectUrl);
      });
    } catch (error) {
      next(error);
    }
  })(req, res, next);
};

