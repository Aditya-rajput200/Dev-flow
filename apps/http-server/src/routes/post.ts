import express from "express";
import * as postController from "../controllers/postController";
import { verifyToken } from "../middleware/authMiddleware";


const PostRouter = express.Router();

PostRouter.post("/createPost", verifyToken, postController.createPost);
export default PostRouter;