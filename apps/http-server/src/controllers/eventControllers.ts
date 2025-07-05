

import { Request, Response } from 'express';
import { prisma } from '@dev-flow/prisma';


//create event
export const createEvent = async (req: Request, res: Response) => {
  try {
    const { title, description, date, location,time,eventImage } = req.body;
    const userId = req.user.id; // Assuming user ID is stored in req.user

    const Newevent = await prisma.event.create({
      data: {
        title,
        description,
        date,
        location,
        time,
        eventImage,
        host: {
          connect: { id: userId },
        },
      },
    });

    res.status(201).json(Newevent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
};

//delete event
export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Assuming user ID is stored in req.user

    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.hostId !== userId) {
      return res.status(403).json({ error: 'You are not authorized to delete this event' });
    }

    await prisma.event.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
}

//get all upcoimg events
export const getAllUpcomingEvents = async (req: Request, res: Response) => {
  const {page=1,limit=12}= req.query;
  try {
    const events = await prisma.event.findMany({
      where: {
        date: {
          gte: new Date(), 
        },
      },
      skip:(Number(page)-1)*Number(limit),
      take:Number(limit),
      orderBy: {
        date: 'asc', // Order by date ascending
      },
    });

    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming events' });
  }
}

//get all past events
export const getAllPastEvents = async (req: Request, res: Response) => {
  const{page=1,limit=12}= req.query;
  try {
    const events = await prisma.event.findMany({
      where: {
        date: {
          lt: new Date(), // Fetch past events
        },
      },
      skip:(Number(page)-1) *Number(limit),
      take: Number(limit),
      orderBy: {
        date: 'desc',
      },
    });

    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching past events:', error);
    res.status(500).json({ error: 'Failed to fetch past events' });
  }
}

//get event by id
export const getEventById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        host: true,
        attendees: true,
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.status(200).json(event);
  } catch (error) {
    console.error('Error fetching event by ID:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
}

//get events by user id
export const getEventsByUserId = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id; // Assuming user ID is stored in req.user

    const events = await prisma.event.findMany({
      where: {
        hostId: userId,
      },
      include: {
        attendees: true,
      },
    });

    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events by user ID:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
}

// get all attendes of an event
export const getAllAttendeesForEvent = async (req: Request, res: Response) => {
  const{page=1,limit=12}= req.query;
  try {
    const { eventId } = req.params;

    const attendees = await prisma.attendee.findMany({
      where: { eventId },
      include: {
        user:{
          select:{
          name: true,
          email: true,
          profile: {
            select: {
              userName: true,
              bio: true,
              githubUrl: true,
              portfolioUrl: true,
              skills: true,
              profileImageUrl: true, 
            },
          }
        }
        }
        , 
      },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    if (attendees.length === 0) {
      return res.status(404).json({ error: 'No attendees found for this event' });
    }

    res.status(200).json(attendees);
  } catch (error) {
    console.error('Error fetching attendees for event:', error);
    res.status(500).json({ error: 'Failed to fetch attendees' });
  }
}


//update event
export const updateEvent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, date, location, time, eventImage } = req.body;


  try {
    const userId = req.user.id;

    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.hostId !== userId) {
      return res.status(403).json({ error: 'You are not authorized to update this event' });
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        title,
        description,
        date,
        location,
        time,
        eventImage,
      },
    });

    res.status(200).json(updatedEvent);
    
  } catch (error) {
    
  }
}