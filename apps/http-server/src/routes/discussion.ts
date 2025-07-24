import express from "express";
import { createAsnwer, createDiscussion, downvoteDiscussion, question_by_user, upvoteDiscussion } from "../controllers/disscussion.Controllers";
import { deleteBlog } from './../controllers/blog.Controllers';

const Discussion_Router  = express.Router();

Discussion_Router.post('/create/question', createDiscussion);

Discussion_Router.post('/create/answer',createAsnwer);

Discussion_Router.post('/upvote',upvoteDiscussion);

Discussion_Router.post('/downvote',downvoteDiscussion);

Discussion_Router.delete('/delete/question/:id',deleteBlog);

Discussion_Router.get('/get/question/:id',question_by_user);




export default Discussion_Router;

 