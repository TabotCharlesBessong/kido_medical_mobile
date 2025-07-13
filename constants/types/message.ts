import { User } from "./auth"; // Assuming User is defined in auth.ts

export interface Message {
  id: string;
  senderId: string;
  sender?: User; // Populated sender user
  receiverId: string;
  receiver?: User; // Populated receiver user
  content: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

// Payload for POST /api/message/create
export interface CreateMessagePayload {
  receiverId: string;
  content: string;
  // senderId is from `req.user.id` on backend, not sent from frontend
}

// API Response for message creation
export interface CreateMessageApiResponse {
  success: boolean;
  message: string;
  data?: { message: Message }; // Backend returns { message: Message }
}

// API Response for getting messages/conversations
export interface MessagesApiResponse {
  success: boolean;
  message: string;
  data?: { messages: Message[] }; // Backend returns { messages: Message[] }
}

// API Response for marking message as read (204 No Content typically)
export interface MarkMessageReadApiResponse {
  success: boolean;
  message: string;
}
