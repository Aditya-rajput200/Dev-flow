import express from 'express';
import session from 'express-session';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import { PrismaSessionStore } from './services/sessionService';
import authRouter from './routes/auth';
import { configurePassport } from './services/passportService';
import { errorHandler } from './utils/errorHandler';
import dotenv from 'dotenv';
import cors from 'cors'
import { 
  csrfProtection, 
  csrfTokenProvider,
  csrfErrorHandler
} from './middleware/csrfMiddleware';
import { isAuthenticated } from './middleware/authMiddleware';

dotenv.config( {path : ''})


const app = express();


// Configure passport
configurePassport();

// Middleware
app.use(cookieParser());
app.use(express.json());

// Session configuration
app.use(session({
  name: 'session.id',
  secret: process.env.SESSION_SECRET!,
  store: new PrismaSessionStore(),
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  }
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Apply CSRF protection globally (except for OAuth callbacks)
app.use((req, res, next) => {
  if (req.path.startsWith('/auth/google')) return next();
  csrfProtection(req, res, next);
});

app.use(csrfTokenProvider);
app.use(csrfErrorHandler);

// Routes
app.use('/auth', authRouter);

// Protected route example
app.get('/profile', isAuthenticated, (req, res) => {
  res.json({
    user: req.user,
    csrfToken: res.locals.csrfToken
  });
});

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

