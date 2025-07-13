import { User } from "./auth"; // Assuming User is defined in auth.ts

// Interface for a Like on a Post
export interface Like {
  id: string;
  userId: string;
  user?: User; // The user who liked the post
  postId: string;
  createdAt: string;
}

// Interface for a Comment on a Post
export interface Comment {
  id: string;
  userId: string;
  user?: User; // The user who commented
  postId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// Interface for a Post
export interface Post {
  id: string;
  userId: string; // The ID of the user (doctor) who created the post
  user?: User; // The user (doctor) who created the post
  title: string;
  image?: string; // URL to post image (optional)
  description: string;
  comments?: Comment[]; // Array of comments on this post (might be populated by backend)
  likes?: Like[]; // Array of likes on this post (might be populated by backend)
  likesCount?: number; // Optional: total number of likes
  commentsCount?: number; // Optional: total number of comments
  createdAt: string;
  updatedAt: string;
}

// Payloads for Post operations
export interface CreatePostPayload {
  title: string;
  image?: string;
  description: string;
}

export interface UpdatePostPayload {
  postId: string;
  payload: Partial<CreatePostPayload>; // Allow partial updates
}

// Payload for Comment operations
export interface CreateCommentPayload {
  postId: string;
  content: string;
}

// API Response structures for Post operations
export interface PostApiResponse {
  success: boolean;
  message: string;
  data?: Post | Post[]; // Can return a single post or an array of posts
}

// API Response structure for Comment operations
export interface CommentApiResponse {
  success: boolean;
  message: string;
  data?: Comment; // Returns the created comment
}

// API Response structure for Like/Unlike operations
export interface LikeApiResponse {
  success: boolean;
  message: string;
  data?: {
    like?: Like; // For like operation
    postId?: string; // For unlike operation, to identify which post was unliked
    userId?: string; // For unlike operation
  };
}
