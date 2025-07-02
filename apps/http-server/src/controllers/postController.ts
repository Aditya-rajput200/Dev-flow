import { Request, Response } from 'express';
import prisma from '@dev-flow/prisma';




export const createPost = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { title, content, type } = req.body;

    if (!title || !type) {
      return res.status(400).json({ message: 'title and type are required' });
    }

    const data: any = {
      title,
      content,
      type,
      authorId: userId,
    };

    if (type === 'CODEQUERY') {
      const { relevantTech, errorDetails, codeSnippet } = req.body;

      data.codeQuery = {
        create: {
          relevantTech: relevantTech.split(',').map((s: string) => s.trim()),
          errorDetails: typeof errorDetails === 'string'
            ? JSON.parse(errorDetails)
            : errorDetails,
          codeSnippet,
        }
      };
    } else {
      const { imageUrl, videoUrl } = req.body;
      data.imageUrl = imageUrl;
      data.videoUrl = videoUrl;
    }

    const post = await prisma.post.create({
      data,
      include: { codeQuery: true },  // Prisma requires include/select for relations :contentReference[oaicite:3]{index=3}
    });

    return res.status(201).json(post);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: err.message || 'Server error' });
  }
};









