// create discussion 
// answer on the disscusion 
// upvote the question
// upvote the answers
// downvote the question 
// downvote the answer
// delete the question 
// lsit all the answer of the questions
// list all question by usedId
// list all question 
// filters on the questions 
  

import { Request, Response } from 'express';
import prisma from '@dev-flow/prisma';



// Create discussion
export const createDiscussion = async (req: Request, res: Response) => {
  const { title, content, tags, authorId } = req.body;

  if (!title || !content || !tags || !authorId) {
    return res.status(400).json({ message: "Title, content, tags, and  are required" });
  }

  try {
    const newDiscussion = await prisma.discussion.create({
      data: {
        title,
        content,
        tags,
        authorId,
      },
    });

    return res.status(201).json({ 
      message: "Discussion created successfully", 
      data: newDiscussion 
    });
  } catch (error) {
    console.error("Error creating discussion:", error);
    return res.status(500).json({ message: "Failed to create discussion" });
  }
};

// create answer

export const createAsnwer = async(req:Request, res:Response) => {
  const { content, discussionId, authorId } = req.body;

  if (!content || !discussionId || !authorId) {
    return res.status(400).json({ message: "Content, discussionId, and authorId are required" });
  }

  try {
    const newAnswer = await prisma.answer.create({
      data: {
        content,
        discussionId,
        authorId,
      },
    });

    return res.status(201).json({ 
      message: "Answer created successfully", 
      data: newAnswer 
    });
  } catch (error) {
    console.error("Error creating answer:", error);
    return res.status(500).json({ message: "Failed to create answer" });
  }
}



//Upvote discussion 
export const upvoteDiscussion = async (req: Request, res: Response) => {
  const { discussionId, userId } = req.body;

  if (!discussionId || !userId) {
    return res.status(400).json({ message: "Discussion ID and user ID are required" });
  }

  try {
  const upvote = await prisma.discussion.update({
    where: { id: discussionId },
    data: {
      upvotes: {
       increment:1
      }
    },
  })

    return res.status(201).json({ 
      message: "Discussion upvoted successfully", 
      data: upvote 
    });
  } catch (error) {
    console.error("Error upvoting discussion:", error);
    return res.status(500).json({ message: "Failed to upvote discussion" });
  }
};

//downvote discussion
export const downvoteDiscussion = async (req: Request, res: Response) => {
  const { discussionId, userId } = req.body;

  if (!discussionId || !userId) {
    return res.status(400).json({ message: "Discussion ID and user ID are required" });
  }

  try {
    const downvote = await prisma.discussion.update({
      where: { id: discussionId },
      data: {
        downvotes: {
          increment: 1
        }
      },
    });

    return res.status(201).json({ 
      message: "Discussion downvoted successfully", 
      data: downvote 
    });
  } catch (error) {
    console.error("Error downvoting discussion:", error);
    return res.status(500).json({ message: "Failed to downvote discussion" });
  }
};

// Delete discussion
export const deleteDiscussion = async (req: Request, res: Response) => {  
  const { discussionId } = req.params;
   
   
  if (!discussionId) {
    return res.status(400).json({ message: "Discussion ID is required" });
  }

  try {
    await prisma.discussion.delete({
      where: { id: discussionId },
    });

    return res.status(200).json({ message: "Discussion deleted successfully" });
  } catch (error) {
    console.error("Error deleting discussion:", error);
    return res.status(500).json({ message: "Failed to delete discussion" });
  }
}


// List all question by userId 
export const question_by_user = async (req:Request,res:Response) => {
  const user_id = req.user.id;

  try {
      const user_questions = await prisma.discussion.findMany({
    where: {
      authorId: user_id
    }
  })
  if (!user_questions || user_questions.length === 0) {
    return res.status(404).json({ message: "No questions found for this user" });
  }
  return res.status(200).json({ 
    message: "User questions retrieved successfully", 
    data: user_questions 
  });
    
  } catch (error) {
    console.error("Error retrieving user questions:", error);
    return res.status(500).json({ message: "Failed to retrieve user questions" });
    
  }}


// update discussion
export const updateDiscussion = async (req: Request, res: Response) => {
  const { discussionId } = req.params;
  const { title, content, tags } = req.body;

  if (!discussionId || !title || !content || !tags) {
    return res.status(400).json({ message: "Discussion ID, title, content, and tags are required" });
  }

  try {
    const updatedDiscussion = await prisma.discussion.update({
      where: { id: discussionId },
      data: {
        title,
        content,
        tags,
      },
    });

    return res.status(200).json({ 
      message: "Discussion updated successfully", 
      data: updatedDiscussion 
    });
  } catch (error) {
    console.error("Error updating discussion:", error);
    return res.status(500).json({ message: "Failed to update discussion" });
  }
}

// serach discussion by title
export const searchDiscussionByTitle = async (req: Request, res: Response) => {
  const { title } = req.query;

  if (!title) {
    return res.status(400).json({ message: "Title is required for search" });
  }

  try {
    const discussions = await prisma.discussion.findMany({
      where: {
        title: {
          contains: title as string,
          mode: 'insensitive', // Case-insensitive search
        },
      },
    });

    if (discussions.length === 0) {
      return res.status(404).json({ message: "No discussions found with the given title" });
    }

    return res.status(200).json({ 
      message: "Discussions retrieved successfully", 
      data: discussions 
    });
  } catch (error) {
    console.error("Error searching discussions by title:", error);
    return res.status(500).json({ message: "Failed to search discussions" });
  }
}