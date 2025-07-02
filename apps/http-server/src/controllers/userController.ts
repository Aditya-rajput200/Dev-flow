import { Request, Response } from 'express';
import { uploadStream } from '../utils/cloudinary';
import upload from '../utils/multer';
import prisma from '@dev-flow/prisma';
import { v2 as cloudinary } from 'cloudinary';

module.exports.upsertProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    if (!userId) return res.status(400).json({ message: 'Missing user ID' });

    const { userName, bio, skills, githubUrl, portfolioUrl } = req.body;
    const data: any = {
      ...(userName && { userName }),
      ...(bio && { bio }),
      ...(githubUrl && { githubUrl }),
      ...(portfolioUrl && { portfolioUrl }),
      ...(skills ? { skills: skills.split(',').map((s: string) => s.trim()) } : {}),
    };

    // Handle profile picture upload
    if (req.file) {
      const existing = await prisma.profile.findUnique({ where: { userId } });
      if (existing?.profilePublicId) {
        await cloudinary.uploader.destroy(existing.profilePublicId);
      }
      const result = await uploadStream(req.file.buffer);
      Object.assign(data, {
        profilePublicId: result.public_id,
        profileFormat: result.format,
        profileVersion: result.version.toString(),
      });
    }

    // Try updating; if no existing profile, create one
    let profile = await prisma.profile.findUnique({ where: { userId } });
    if (profile) {
      profile = await prisma.profile.update({ where: { userId }, data });
    } else {
      profile = await prisma.profile.create({ data: { userId, ...data } });
    }

    return res.status(200).json({ message: 'Profile saved', profile });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};


module.exports.getProfile = async(req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    if(!userId) {
      res.status(400).json({message : "Missing user Id"})
      return;
    }

   const profile = await prisma.profile.findUnique({
    where:{userId},
  include:{
    user : {
      select : {
        posts : true,
        comments :  true,
        eventsHosted: true
      }
    }
  }
   })
    if(!profile) {
      res.status(404).json({message : "Profile not found"})
      return;
    }

     return res.status(200).json({message: "Profile fetched successfully", profile});
   

  }catch(err) {
    console.error(err);
    return res.status(500).json({message: "Server error"});
  }
}

