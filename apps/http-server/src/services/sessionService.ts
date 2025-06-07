import { Store } from 'express-session';
import { PrismaClient } from '../../../../packages/prisma/generated/prisma'; // Adjust to your actual import path

const prisma = new PrismaClient();


export class PrismaSessionStore extends Store {

   constructor() {
    super(); // ✅ MUST call this to properly initialize
  }


  
  async set(sid: string, session: any, callback?: (err?: any) => void) {

    try {
      const userId = session.passport?.user ;
     console.log("💾 Saving session:", sid, session);
       
      const expiresAt = session.cookie?.expires || 
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await prisma.session.upsert({
        where: { id: sid },
        update: { 
        
          expiresAt,
          userId:  session.passport?.user
          
        },
        create: {
          id: sid,
          expiresAt,
          userId:  session.passport?.user 
         
        }
      });
      callback?.();
    } catch (err) {
      callback?.(err);
    }
  }

  async get(sid: string, callback: (err: any, session?: any) => void) {
    try {
       console.log("🔍 Getting session:", sid);
      const sessionData = await prisma.session.findUnique({
        where: { id: sid }
      });

      if (!sessionData || sessionData.expiresAt < new Date()) {
        if (sessionData) {
          await this.destroy(sid);
        }
        return callback(null, null);
      }

         const session = {
        cookie: { expires: sessionData.expiresAt },
        passport: { user: sessionData.userId }
      };

      callback(null, session);
    } catch (err) {
      callback(err);
    }
  }


  async destroy(sid: string, callback?: (err?: any) => void) {
    try {
      await prisma.session.delete({ 
        where: { id: sid } 
      });
      callback?.();
    } catch (err) {
      // Handle "Record not found" gracefully
      if (err) return callback?.();
      callback?.(err);
    }
  }
}