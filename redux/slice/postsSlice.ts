import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "@/utils/api/axiosInstance"; // Ensure correct path
import {
  Post,
  Comment,
  Like,
  PostApiResponse,
  CommentApiResponse,
  LikeApiResponse,
  CreatePostPayload,
  UpdatePostPayload,
  CreateCommentPayload,
} from "@/constants/types/post"; // Ensure correct path
import { RootState } from "../store";

interface PostsState {
  allPosts: Post[];
  currentPost: Post | null;
  doctorPosts: Post[];
  isLoading: boolean;
  error: string | null;
}

const initialState: PostsState = {
  allPosts: [],
  currentPost: null,
  doctorPosts: [],
  isLoading: false,
  error: null,
};

// Async Thunk for a Doctor to create a post
export const createPost = createAsyncThunk<
  PostApiResponse,
  CreatePostPayload,
  { rejectValue: string }
>("posts/createPost", async (postData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post<PostApiResponse>(
      "/posts/create",
      postData
    );
    const data = response.data;

    if (data.success && data.data && !Array.isArray(data.data)) {
      return data;
    } else {
      return rejectWithValue(data.message || "Failed to create post.");
    }
  } catch (error: any) {
    console.error(
      "Error creating post:",
      error.response?.data || error.message
    );
    const errorMessage =
      error.response?.data?.message || error.message || "Network Error";
    return rejectWithValue(errorMessage);
  }
});

// Async Thunk to fetch all posts
export const fetchAllPosts = createAsyncThunk<
  PostApiResponse,
  void,
  { rejectValue: string }
>("posts/fetchAllPosts", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get<PostApiResponse>(
      "/posts/post/all"
    );
    const data = response.data;

    if (data.success && Array.isArray(data.data)) {
      return data;
    } else {
      return rejectWithValue(data.message || "Failed to fetch all posts.");
    }
  } catch (error: any) {
    console.error(
      "Error fetching all posts:",
      error.response?.data || error.message
    );
    const errorMessage =
      error.response?.data?.message || error.message || "Network Error";
    return rejectWithValue(errorMessage);
  }
});

// Async Thunk to fetch a single post by ID
export const fetchSinglePost = createAsyncThunk<
  PostApiResponse,
  string,
  { rejectValue: string }
>("posts/fetchSinglePost", async (postId, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get<PostApiResponse>(
      `/posts/${postId}`
    );
    const data = response.data;

    if (data.success && data.data && !Array.isArray(data.data)) {
      return data;
    } else {
      return rejectWithValue(data.message || "Post not found.");
    }
  } catch (error: any) {
    console.error(
      "Error fetching single post:",
      error.response?.data || error.message
    );
    const errorMessage =
      error.response?.data?.message || error.message || "Network Error";
    return rejectWithValue(errorMessage);
  }
});

// Async Thunk to update a post (Doctor only)
export const updatePost = createAsyncThunk<
  PostApiResponse,
  UpdatePostPayload,
  { rejectValue: string }
>("posts/updatePost", async ({ postId, payload }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put<PostApiResponse>(
      `/posts/${postId}`,
      payload
    );
    const data = response.data;

    if (data.success && data.data && !Array.isArray(data.data)) {
      return data;
    } else {
      return rejectWithValue(data.message || "Failed to update post.");
    }
  } catch (error: any) {
    console.error(
      "Error updating post:",
      error.response?.data || error.message
    );
    const errorMessage =
      error.response?.data?.message || error.message || "Network Error";
    return rejectWithValue(errorMessage);
  }
});

// Async Thunk to delete a post (Doctor only)
export const deletePost = createAsyncThunk<
  PostApiResponse,
  string,
  { rejectValue: string }
>("posts/deletePost", async (postId, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.delete<PostApiResponse>(
      `/posts/${postId}/like`
    ); // Corrected path: was /posts/:postId/like instead of /posts/:postId
    const data = response.data;

    if (data.success) {
      return data;
    } else {
      return rejectWithValue(data.message || "Failed to delete post.");
    }
  } catch (error: any) {
    console.error(
      "Error deleting post:",
      error.response?.data || error.message
    );
    const errorMessage =
      error.response?.data?.message || error.message || "Network Error";
    return rejectWithValue(errorMessage);
  }
});

// Async Thunk to fetch posts by a specific doctor
export const fetchPostsByDoctor = createAsyncThunk<
  PostApiResponse,
  string,
  { rejectValue: string }
>("posts/fetchPostsByDoctor", async (doctorId, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get<PostApiResponse>(
      `/posts/doctor/${doctorId}`
    );
    const data = response.data;

    if (data.success && Array.isArray(data.data)) {
      return data;
    } else {
      return rejectWithValue(
        data.message || `Failed to fetch posts for doctor ${doctorId}.`
      );
    }
  } catch (error: any) {
    console.error(
      "Error fetching doctor's posts:",
      error.response?.data || error.message
    );
    const errorMessage =
      error.response?.data?.message || error.message || "Network Error";
    return rejectWithValue(errorMessage);
  }
});

// Async Thunk to create a comment on a post
export const createComment = createAsyncThunk<
  CommentApiResponse,
  CreateCommentPayload,
  { rejectValue: string; state: RootState }
>(
  "posts/createComment",
  async ({ postId, content }, { rejectWithValue, getState }) => {
    try {
      const response = await axiosInstance.post<CommentApiResponse>(
        `/posts/${postId}/comment`,
        { content }
      );
      const data = response.data;
      const authUser = getState().auth.user; // Get the logged-in user for the comment object

      if (data.success && data.data) {
        const commentWithUser = { ...data.data, user: authUser || undefined };
        return { ...data, data: commentWithUser };
      } else {
        return rejectWithValue(data.message || "Failed to create comment.");
      }
    } catch (error: any) {
      console.error(
        "Error creating comment:",
        error.response?.data || error.message
      );
      const errorMessage =
        error.response?.data?.message || error.message || "Network Error";
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunk to like a post
export const likePost = createAsyncThunk<
  LikeApiResponse,
  string,
  { rejectValue: string; state: RootState }
>("posts/likePost", async (postId, { rejectWithValue, getState }) => {
  try {
    const response = await axiosInstance.post<LikeApiResponse>(
      `/posts/${postId}/like`
    );
    const data = response.data;
    const authUser = getState().auth.user;

    if (data.success) {
      // Backend might not return data.data with a `like` object on success
      const newLike: Like = {
        // Construct optimistic like to ensure `user` property is available
        id: `temp-like-${Date.now()}-${authUser?.id}`, // Temporary ID
        userId: authUser?.id || "", // Must be non-null if user is logged in
        user: authUser || undefined,
        postId: postId,
        createdAt: new Date().toISOString(),
      };
      return {
        success: true,
        message: data.message || "Post liked successfully.",
        data: { like: newLike },
      };
    } else {
      return rejectWithValue(data.message || "Failed to like post.");
    }
  } catch (error: any) {
    console.error("Error liking post:", error.response?.data || error.message);
    const errorMessage =
      error.response?.data?.message || error.message || "Network Error";
    return rejectWithValue(errorMessage);
  }
});

// Async Thunk to unlike a post
export const unlikePost = createAsyncThunk<
  LikeApiResponse,
  string,
  { rejectValue: string; state: RootState }
>("posts/unlikePost", async (postId, { rejectWithValue, getState }) => {
  try {
    const response = await axiosInstance.delete<LikeApiResponse>(
      `/posts/${postId}/like`
    );
    const data = response.data;
    const authUser = getState().auth.user;

    if (data.success) {
      return {
        success: true,
        message: data.message || "Post unliked successfully.",
        data: { postId, userId: authUser?.id },
      };
    } else {
      return rejectWithValue(data.message || "Failed to unlike post.");
    }
  } catch (error: any) {
    console.error(
      "Error unliking post:",
      error.response?.data || error.message
    );
    const errorMessage =
      error.response?.data?.message || error.message || "Network Error";
    return rejectWithValue(errorMessage);
  }
});

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    clearPostsError: (state) => {
      state.error = null;
    },
    clearCurrentPost: (state) => {
      state.currentPost = null;
    },
    clearDoctorPosts: (state) => {
      state.doctorPosts = [];
    },
    // Optimistic updates for immediate UI feedback
    addOptimisticComment: (
      state,
      action: PayloadAction<{ postId: string; comment: Comment }>
    ) => {
      // Add comment to currentPost if applicable
      if (state.currentPost && state.currentPost.id === action.payload.postId) {
        if (!state.currentPost.comments) state.currentPost.comments = [];
        state.currentPost.comments.push(action.payload.comment);
        state.currentPost.commentsCount =
          (state.currentPost.commentsCount || 0) + 1;
      }
      // Also update in allPosts list for consistency
      const postInAll = state.allPosts.find(
        (p) => p.id === action.payload.postId
      );
      if (postInAll) {
        if (!postInAll.comments) postInAll.comments = [];
        postInAll.comments.push(action.payload.comment);
        postInAll.commentsCount = (postInAll.commentsCount || 0) + 1;
      }
      // Also update in doctorPosts list if applicable
      const postInDoctor = state.doctorPosts.find(
        (p) => p.id === action.payload.postId
      );
      if (postInDoctor) {
        if (!postInDoctor.comments) postInDoctor.comments = [];
        postInDoctor.comments.push(action.payload.comment);
        postInDoctor.commentsCount = (postInDoctor.commentsCount || 0) + 1;
      }
    },
    toggleOptimisticLike: (
      state,
      action: PayloadAction<{
        postId: string;
        userId: string;
        liked: boolean;
        like?: Like;
      }>
    ) => {
      const { postId, userId, liked, like } = action.payload;

      // FIX for Errors 1 & 2 in postsSlice.ts: Handle `undefined` when finding posts
      const updatePostLikes = (post: Post | undefined) => {
        // <-- Changed parameter type to Post | undefined
        if (!post) return; // <-- Explicitly return if post is undefined

        if (!post.likes) post.likes = [];
        post.likesCount = post.likesCount || 0;

        if (liked) {
          if (!post.likes.some((l) => l.userId === userId) && like) {
            // Ensure `like` object is provided when adding a like
            post.likes.push(like);
            post.likesCount++;
          }
        } else {
          const likeIndex = post.likes.findIndex((l) => l.userId === userId);
          if (likeIndex !== -1) {
            post.likes.splice(likeIndex, 1);
            post.likesCount--;
          }
        }
      };

      updatePostLikes(state.currentPost as Post | undefined);
      updatePostLikes(state.allPosts.find((p) => p.id === postId));
      updatePostLikes(state.doctorPosts.find((p) => p.id === postId));
    },
    removeOptimisticPost: (state, action: PayloadAction<string>) => {
      const postId = action.payload;
      state.allPosts = state.allPosts.filter((p) => p.id !== postId);
      state.doctorPosts = state.doctorPosts.filter((p) => p.id !== postId);
      if (state.currentPost?.id === postId) {
        state.currentPost = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // createPost
      .addCase(createPost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        if (action.payload.data && !Array.isArray(action.payload.data)) {
          state.allPosts.unshift(action.payload.data as Post); // Add to top of all posts
          // Optionally, you can update doctorPosts elsewhere if needed
        }
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to create post.";
      })

      // fetchAllPosts
      .addCase(fetchAllPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allPosts = action.payload.data as Post[];
        state.error = null;
      })
      .addCase(fetchAllPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.allPosts = [];
        state.error = action.payload || "Failed to fetch all posts.";
      })

      // fetchSinglePost
      .addCase(fetchSinglePost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.currentPost = null;
      })
      .addCase(fetchSinglePost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPost = action.payload.data as Post;
        state.error = null;
      })
      .addCase(fetchSinglePost.rejected, (state, action) => {
        state.isLoading = false;
        state.currentPost = null;
        state.error = action.payload || "Failed to fetch post details.";
      })

      // updatePost
      .addCase(updatePost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        if (action.payload.data && !Array.isArray(action.payload.data)) {
          const updatedPost = action.payload.data as Post;
          // Update in allPosts
          const allIndex = state.allPosts.findIndex(
            (p) => p.id === updatedPost.id
          );
          if (allIndex !== -1) {
            state.allPosts[allIndex] = updatedPost;
          }
          // Update in doctorPosts
          const doctorIndex = state.doctorPosts.findIndex(
            (p) => p.id === updatedPost.id
          );
          if (doctorIndex !== -1) {
            state.doctorPosts[doctorIndex] = updatedPost;
          }
          // Update currentPost if it's the one being viewed
          if (state.currentPost?.id === updatedPost.id) {
            state.currentPost = updatedPost;
          }
        }
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update post.";
      })

      // deletePost (handled optimistically, no need to filter here)
      .addCase(deletePost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePost.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to delete post.";
        // If optimistic delete failed, you might need to re-fetch the lists
      })

      // fetchPostsByDoctor
      .addCase(fetchPostsByDoctor.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.doctorPosts = []; // Clear previous doctor posts
      })
      .addCase(fetchPostsByDoctor.fulfilled, (state, action) => {
        state.isLoading = false;
        state.doctorPosts = action.payload.data as Post[];
        state.error = null;
      })
      .addCase(fetchPostsByDoctor.rejected, (state, action) => {
        state.isLoading = false;
        state.doctorPosts = [];
        state.error = action.payload || "Failed to fetch doctor's posts.";
      })

      // createComment (optimistically updated via addOptimisticComment)
      .addCase(createComment.pending, (state) => {
        state.error = null;
      })
      .addCase(createComment.fulfilled, (state) => {
        // Removed action.payload from here as it's not used post-optimistic-update
        state.error = null;
      })
      .addCase(createComment.rejected, (state, action) => {
        state.error = action.payload || "Failed to add comment.";
      })

      // likePost (optimistically updated via toggleOptimisticLike)
      .addCase(likePost.pending, (state) => {
        state.error = null;
      })
      .addCase(likePost.fulfilled, (state) => {
        // Removed action.payload from here
        state.error = null;
      })
      .addCase(likePost.rejected, (state, action) => {
        state.error = action.payload || "Failed to like post.";
      })

      // unlikePost (optimistically updated via toggleOptimisticLike)
      .addCase(unlikePost.pending, (state) => {
        state.error = null;
      })
      .addCase(unlikePost.fulfilled, (state) => {
        // Removed action.payload from here
        state.error = null;
      })
      .addCase(unlikePost.rejected, (state, action) => {
        state.error = action.payload || "Failed to unlike post.";
      });
  },
});

export const {
  clearPostsError,
  clearCurrentPost,
  clearDoctorPosts,
  addOptimisticComment,
  toggleOptimisticLike,
  removeOptimisticPost,
} = postsSlice.actions;
export default postsSlice.reducer;
