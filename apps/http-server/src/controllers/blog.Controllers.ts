import { Request, Response } from 'express';
import prisma from '@dev-flow/prisma';



// Create blog
export const createBlog = async (req: Request, res: Response) => {
  const { title, content, imgUrl, vidUrl, tags, authorId } = req.body;

  if (!title || !content || !tags || !authorId) {
    return res.status(400).json({ message: "Title, content, tags, and author ID are required" });
  }

  try {
    const newBlog = await prisma.blog.create({
      data: {
        title,
        content,
        imgUrl,
        vidUrl,
        tags,
        authorId,
      },
    });

    return res.status(201).json({ 
      message: "Blog created successfully", 
      data: newBlog 
    });
  } catch (error) {
    console.error("Error creating blog:", error);
    return res.status(500).json({ message: "Failed to create blog" });
  }
};

// Get blogs by user ID
export const getBlogsByUserId = async (req: Request, res: Response) => {
  const { userId } = req.params; 

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const blogs = await prisma.blog.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
      take:5
    });

    return res.status(200).json(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return res.status(500).json({ message: "Failed to fetch blogs" });
  }
};

// Delete blog
export const deleteBlog = async (req: Request, res: Response) => {
  const { blogId } = req.params;

  if (!blogId) {
    return res.status(400).json({ message: "Blog ID is required" });
  }

  try {
    const deletedBlog = await prisma.blog.delete({
      where: { id: blogId },
    });

    return res.status(200).json({ 
      message: "Blog deleted successfully", 
      data: deletedBlog 
    });
  } catch (error) {
    console.error("Error deleting blog:", error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ message: "Blog not found" });
    }
    
    return res.status(500).json({ message: "Failed to delete blog" });
  }
};

// Get all blogs
export const getAllBlogs = async (req: Request, res: Response) => {
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20 
    });

    return res.status(200).json(blogs);
  } catch (error) {
    console.error("Error fetching all blogs:", error);
    return res.status(500).json({ message: "Failed to fetch blogs" });
  }
};

// Update blog
export const updateBlog = async (req: Request, res: Response) => {
  const { blogId } = req.params;
  const { title, content, imgUrl, vidUrl, tags } = req.body;

  if (!blogId || !title || !content || !tags) {
    return res.status(400).json({ message: "Blog ID, title, content, and tags are required" });
  }

  try {
    const updatedBlog = await prisma.blog.update({
      where: { id: blogId },
      data: {
        title,
        content,
        imgUrl,
        vidUrl,
        tags,
      },
    });

    return res.status(200).json({ 
      message: "Blog updated successfully", 
      data: updatedBlog 
    });
  } catch (error) {
    console.error("Error updating blog:", error);
    
    if (error.code === 'P2025') { // Prisma not found error code
      return res.status(404).json({ message: "Blog not found" });
    }
    
    return res.status(500).json({ message: "Failed to update blog" });
  }
};