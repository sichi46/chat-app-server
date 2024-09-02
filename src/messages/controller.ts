import { Request, Response } from "express";
import httpStatus from "http-status";
import { prisma } from "../config/db";

class MessageController {
  async sendMessage(req: Request, res: Response) {
    try {
      const { message } = req.body;
      const { id: recieverId } = req.params;
      const senderId = req.user.id;

      // check if a conversation already exists
      let conversation = await prisma.conversation.findFirst({
        where: {
          participantIds: {
            hasEvery: [senderId, recieverId],
          },
        },
      });
      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            participantIds: {
              set: [senderId, recieverId],
            },
          },
        });
      }
      const newMessage = await prisma.message.create({
        data: {
          senderId,
          body: message,
          conversationId: conversation.id,
        },
      });

      // The very first message is being sent, that's why we need to create a new conversation

      if (newMessage) {
        conversation = await prisma.conversation.update({
          where: {
            id: conversation.id,
          },
          data: {
            messages: {
              connect: {
                id: newMessage.id,
              },
            },
          },
        });
      }
      //     socket will go herep
      return res.status(httpStatus.CREATED).json(newMessage);
    } catch (error: any) {
      console.error("Error in sendMessage", error.message);
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal Server error " });
    }
  }
  async getMessages(req: Request, res: Response) {
    try {
      const { id: userToChatId } = req.params;
      const senderId = req.user.id;
      const conversation = await prisma.conversation.findFirst({
        where: {
          participantIds: {
            hasEvery: [senderId, userToChatId],
          },
        },
        include: {
          messages: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });
      if (!conversation) {
        return res.status(httpStatus.OK).json({ messages: [] });
      }

      return res.status(httpStatus.OK).json(conversation.messages);
    } catch (error: any) {
      console.error("Error in getMessages", error.message);
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: "Internal Server Error " });
    }
  }
  async getUsersForSideBar(req: Request, res: Response) {
    try {
      const authUserId = req.user.id;
      const users = await prisma.user.findMany({
        where: {
          id: {
            not: authUserId,
          },
        },
        select: {
          id: true,
          fullName: true,
          profilePic: true,
        },
      });
      return res.status(httpStatus.OK).json(users);
    } catch (error: any) {
      console.error("Error in getUsersSideBar:", error.message);
    }
  }
}

export const messageController = new MessageController();
