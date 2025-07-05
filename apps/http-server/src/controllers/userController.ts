import { Request, Response } from 'express';

import prisma from '@dev-flow/prisma';




interface UserProfileResponse {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  followers: { id: string }[]; 
  following: { id: string }[]; 
  profile: {
    id: string;
    userName: string;
    bio: string | null;
    githubUrl: string | null;
    skills: string[];
    portfolioUrl: string | null;
    profileImageUrl?: string;
  } | null;
}

export const getUserProfile = async (req: Request, res: Response<UserProfileResponse | { message: string }>) => {
  const { id } = req.query;

  // Validate ID
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: "Valid user ID is required" });
  }

  try {
    const userDetails = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        followers: {
          select: {
            id: true,
            // Include other follower fields you need
            followerId: true, // Assuming you want to include the follower user's ID
            follower:true,
          },
        },
        following: {
          select: {
            id: true,
            followerId: true, // Assuming you want to include the following user's ID
            following: true, // Include other following fields you need
          },
        },
        profile: {
          select: {
            id: true,
            userName: true,
            bio: true,
            githubUrl: true,
            skills: true,
            portfolioUrl: true,
            profileImageUrl: true, 
            
          },
        },
      },
    });

    if (!userDetails) {
      return res.status(404).json({ message: "User not found" });
    }

    // Proper response format (fixed the incorrect string concatenation)
    return res.status(200).json({
      message: "User data retrieved successfully",
      data: userDetails,
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    
    // More specific error handling
    if (error instanceof Error) {
      return res.status(500).json({ 
        message: 'Failed to fetch user data',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
    
    return res.status(500).json({ message: 'Internal server error' });
  }
};


// update user profile

interface UpdateProfileRequest {
  userName?: string;
  phone?: string;
  bio?: string; 
  skills?: string[];
  githubUrl?: string;
  portfolioUrl?: string;
  profileImageUrl?: string; 
}
export const updateUserProfile = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId; 
  if (!userId) {
    return res.status(400).json({ message: 'Missing user ID' });
  }

  const { userName, bio, skills, githubUrl, portfolioUrl, profileImageUrl }: UpdateProfileRequest = req.body;

  try {
    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: {
        ...(userName && { userName }),
        ...(bio && { bio }),
        ...(githubUrl && { githubUrl }),
        ...(portfolioUrl && { portfolioUrl }),
        ...(skills && { skills }),
        ...(profileImageUrl && { profileImageUrl }), // Handle profile image URL if provided
      },
    });

    return res.status(200).json({ message: 'Profile updated successfully', profile: updatedProfile });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ message: 'Failed to update profile' });
  }
}


