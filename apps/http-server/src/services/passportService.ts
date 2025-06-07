import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient } from '../../../../packages/prisma/generated/prisma'; // Use proper import path
import crypto from 'crypto';
import { AppError } from '../utils/errorHandler';

const prisma = new PrismaClient();

export const configurePassport = () => {
  // Serialize user to session (store only user ID)
console.log("🛠️ Configuring Google Strategy...");
  passport.use(
  new GoogleStrategy(
   

    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${process.env.BASE_URL}/auth/google/callback`,
      state: true,
    },
    async (accessToken, refreshToken, profile, done) => {
     console.log("🔁 GoogleStrategy called", profile.id);


      try {
        // Validate profile
        if (!profile.id || !profile.displayName) {
           console.log("⚠️ Invalid Google profile");
          throw new AppError('InvalidProfile', 'Invalid profile data from Google', 400);
        }

        const email = profile.emails?.[0]?.value;
        if (!email) {
          throw new AppError('InvalidProfile', 'Email not found in Google profile', 400);
        }

        // 🔍 1. Try to find user by email
        let user = await prisma.user.findUnique({
          where: {
            email: email
          }
        });

        // ✏️ 2. If user exists, update provider info if needed
        if (user) {
          if (user.provider !== 'google' || user.providerId !== profile.id) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                provider: 'google',
                providerId: profile.id,
              }
            });
          }

          // Also optionally update name/email if outdated
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              name: profile.displayName,
              email: email
            }
          });
        } else {
          // 🆕 3. Create user if not found
          user = await prisma.user.create({
            data: {
              provider: 'google',
              providerId: profile.id,
              name: profile.displayName,
              email: email,
              phone: '',
              password:''
              
            }
          });
        }

        // ✅ Pass user to Passport
        done(null, user);
      } catch (error) {
        const err = error instanceof AppError
          ? error
          : new AppError('AuthFailed', 'Authentication failed', 401);

        console.error('GoogleStrategy Error:', err);
        done(err);
      }
    }
  )
)

  passport.serializeUser((user: any, done) => {
    console.log("🔐 Serializing user:", user.id);
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: string, done) => {
     
    try {
         console.log("✅ deserializeUser:", id);
      const user = await prisma.user.findUnique({ 
        where: { id },
        select: { 
          id: true, 
          name: true, 
          email: true,
          provider: true
        } 
      });
      
      if (!user) {
        throw new AppError('UserNotFound', 'User not found', 404);
      }
        console.log("✅ User deserialized:", user);
      done(null, user);
    } catch (err) {
      done(new AppError('DeserializationError', 'Failed to deserialize user', 500));
    }
  });

  console.log("Google Client ID:", process.env.GOOGLE_CLIENT_ID);


}