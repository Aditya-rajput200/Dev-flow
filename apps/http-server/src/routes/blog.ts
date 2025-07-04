// Create blog
import express from "express";

const BlogRouter = express.Router();
import * as blogController from "../controllers/blog.Controllers";
import { verifyToken } from "../middleware/authMiddleware";

BlogRouter.post("/createBlog",verifyToken, blogController.createBlog);
BlogRouter.get("/GetBlogsByUserId/:id", verifyToken, blogController.getBlogsByUserId);
BlogRouter.get("/deleteBlog", verifyToken, blogController.deleteBlog);
BlogRouter.get("/getAllBlogs/:id", verifyToken, blogController.getAllBlogs);
BlogRouter.get("/updateBlog/:id", verifyToken, blogController.updateBlog);


export default BlogRouter;