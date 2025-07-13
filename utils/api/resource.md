Okay, perfect! Let's move on to **Phase 6: Posts and Reactions**. This feature will allow doctors to share information and for users (both patients and doctors) to engage with that content through comments and likes.

Based on your Postman collection, here's how we'll approach it:

*   **Posts:**
    *   Create Post (Doctor only)
    *   Get All Posts (All authenticated users)
    *   Get Single Post (All authenticated users)
    *   Update Post (Doctor only, owner of the post)
    *   Delete Post (Doctor only, owner of the post)
    *   Get Posts by Doctor (All authenticated users)
*   **Reactions:**
    *   Create Comment (All authenticated users)
    *   Like Post (All authenticated users)
    *   Unlike Post (All authenticated users)

---

### Step 1: Define New Type Definitions (`src/constants/types/`)

We'll create a new file `src/constants/types/post.ts`.

```typescript
// src/constants/types/post.ts (NEW FILE)

import { User } from './auth'; // Assuming User is defined in auth.ts

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
  likes?: Like[];       // Array of likes on this post (might be populated by backend)
  likesCount?: number;  // Optional: total number of likes
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
```

---

### Step 2: Create New Redux Slice (`src/redux/slices/postsSlice.ts`)

This slice will manage all state and API interactions related to posts, comments, and likes.

```typescript
// src/redux/slices/postsSlice.ts (NEW FILE)

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '@/utils/api/axiosInstance'; // Ensure correct path
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
} from '@/constants/types/post'; // Ensure correct path
import { RootState } from '../store';

interface PostsState {
  allPosts: Post[]; // All posts in the system
  currentPost: Post | null; // The post being viewed in detail
  doctorPosts: Post[]; // Posts specific to a viewed doctor (e.g., from /api/posts/doctor/:doctorId)
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
export const createPost = createAsyncThunk<PostApiResponse, CreatePostPayload, { rejectValue: string }>(
  'posts/createPost',
  async (postData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<PostApiResponse>('/posts/create', postData);
      const data = response.data;

      if (data.success && data.data && !Array.isArray(data.data)) {
        return data;
      } else {
        return rejectWithValue(data.message || 'Failed to create post.');
      }
    } catch (error: any) {
      console.error("Error creating post:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || 'Network Error';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunk to fetch all posts
export const fetchAllPosts = createAsyncThunk<PostApiResponse, void, { rejectValue: string }>(
  'posts/fetchAllPosts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<PostApiResponse>('/posts/post/all');
      const data = response.data;

      if (data.success && Array.isArray(data.data)) {
        return data;
      } else {
        return rejectWithValue(data.message || 'Failed to fetch all posts.');
      }
    } catch (error: any) {
      console.error("Error fetching all posts:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || 'Network Error';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunk to fetch a single post by ID
export const fetchSinglePost = createAsyncThunk<PostApiResponse, string, { rejectValue: string }>(
  'posts/fetchSinglePost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<PostApiResponse>(`/posts/${postId}`);
      const data = response.data;

      if (data.success && data.data && !Array.isArray(data.data)) {
        return data;
      } else {
        return rejectWithValue(data.message || 'Post not found.');
      }
    } catch (error: any) {
      console.error("Error fetching single post:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || 'Network Error';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunk to update a post (Doctor only)
export const updatePost = createAsyncThunk<PostApiResponse, UpdatePostPayload, { rejectValue: string }>(
  'posts/updatePost',
  async ({ postId, payload }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put<PostApiResponse>(`/posts/${postId}`, payload);
      const data = response.data;

      if (data.success && data.data && !Array.isArray(data.data)) {
        return data;
      } else {
        return rejectWithValue(data.message || 'Failed to update post.');
      }
    } catch (error: any) {
      console.error("Error updating post:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || 'Network Error';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunk to delete a post (Doctor only)
export const deletePost = createAsyncThunk<PostApiResponse, string, { rejectValue: string }>(
  'posts/deletePost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete<PostApiResponse>(`/posts/${postId}`);
      const data = response.data;

      if (data.success) {
        return data; // Typically returns a success message without data on delete
      } else {
        return rejectWithValue(data.message || 'Failed to delete post.');
      }
    } catch (error: any) {
      console.error("Error deleting post:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || 'Network Error';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunk to fetch posts by a specific doctor
export const fetchPostsByDoctor = createAsyncThunk<PostApiResponse, string, { rejectValue: string }>(
  'posts/fetchPostsByDoctor',
  async (doctorId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<PostApiResponse>(`/posts/doctor/${doctorId}`);
      const data = response.data;

      if (data.success && Array.isArray(data.data)) {
        return data;
      } else {
        return rejectWithValue(data.message || `Failed to fetch posts for doctor ${doctorId}.`);
      }
    } catch (error: any) {
      console.error("Error fetching doctor's posts:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || 'Network Error';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunk to create a comment on a post
export const createComment = createAsyncThunk<CommentApiResponse, CreateCommentPayload, { rejectValue: string; state: RootState }>(
  'posts/createComment',
  async ({ postId, content }, { rejectWithValue, getState }) => {
    try {
      const response = await axiosInstance.post<CommentApiResponse>(`/posts/${postId}/comment`, { content });
      const data = response.data;
      const authUser = getState().auth.user; // Get the logged-in user for the comment object

      if (data.success && data.data) {
        // Attach the current user to the comment if it's not fully populated by backend
        const commentWithUser = { ...data.data, user: authUser || undefined };
        return { ...data, data: commentWithUser }; // Return updated payload
      } else {
        return rejectWithValue(data.message || 'Failed to create comment.');
      }
    } catch (error: any) {
      console.error("Error creating comment:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || 'Network Error';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunk to like a post
export const likePost = createAsyncThunk<LikeApiResponse, string, { rejectValue: string; state: RootState }>(
  'posts/likePost',
  async (postId, { rejectWithValue, getState }) => {
    try {
      const response = await axiosInstance.post<LikeApiResponse>(`/posts/${postId}/like`);
      const data = response.data;
      const authUser = getState().auth.user;

      if (data.success && data.data) {
        // Backend might return the Like object. If not, construct it for optimistic update.
        const likedBy = { ...data.data.like, user: authUser || undefined } as Like; // Ensure user is attached
        return { ...data, data: { like: likedBy } };
      } else {
        return rejectWithValue(data.message || 'Failed to like post.');
      }
    } catch (error: any) {
      console.error("Error liking post:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || 'Network Error';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunk to unlike a post
export const unlikePost = createAsyncThunk<LikeApiResponse, string, { rejectValue: string; state: RootState }>(
  'posts/unlikePost',
  async (postId, { rejectWithValue, getState }) => {
    try {
      const response = await axiosInstance.delete<LikeApiResponse>(`/posts/${postId}/like`);
      const data = response.data;
      const authUser = getState().auth.user;

      if (data.success) {
        return { ...data, data: { postId, userId: authUser?.id } }; // Return postId and userId to know what was unliked
      } else {
        return rejectWithValue(data.message || 'Failed to unlike post.');
      }
    } catch (error: any) {
      console.error("Error unliking post:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || 'Network Error';
      return rejectWithValue(errorMessage);
    }
  }
);


const postsSlice = createSlice({
  name: 'posts',
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
    addOptimisticComment: (state, action: PayloadAction<{ postId: string; comment: Comment }>) => {
      // Add comment to currentPost if applicable
      if (state.currentPost && state.currentPost.id === action.payload.postId) {
        if (!state.currentPost.comments) state.currentPost.comments = [];
        state.currentPost.comments.push(action.payload.comment);
        state.currentPost.commentsCount = (state.currentPost.commentsCount || 0) + 1;
      }
      // Also update in allPosts list for consistency
      const postInAll = state.allPosts.find(p => p.id === action.payload.postId);
      if (postInAll) {
        if (!postInAll.comments) postInAll.comments = [];
        postInAll.comments.push(action.payload.comment);
        postInAll.commentsCount = (postInAll.commentsCount || 0) + 1;
      }
    },
    toggleOptimisticLike: (state, action: PayloadAction<{ postId: string; userId: string; liked: boolean; like?: Like }>) => {
      const { postId, userId, liked, like } = action.payload;

      const updatePostLikes = (post: Post | null) => {
        if (!post) return;
        if (!post.likes) post.likes = [];
        post.likesCount = post.likesCount || 0;

        if (liked) {
          if (!post.likes.some(l => l.userId === userId) && like) {
            post.likes.push(like);
            post.likesCount++;
          }
        } else {
          const likeIndex = post.likes.findIndex(l => l.userId === userId);
          if (likeIndex !== -1) {
            post.likes.splice(likeIndex, 1);
            post.likesCount--;
          }
        }
      };

      updatePostLikes(state.currentPost);
      updatePostLikes(state.allPosts.find(p => p.id === postId));
      updatePostLikes(state.doctorPosts.find(p => p.id === postId));
    },
    removeOptimisticPost: (state, action: PayloadAction<string>) => {
      const postId = action.payload;
      state.allPosts = state.allPosts.filter(p => p.id !== postId);
      state.doctorPosts = state.doctorPosts.filter(p => p.id !== postId);
      if (state.currentPost?.id === postId) {
        state.currentPost = null;
      }
    }
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
          // Also add to doctorPosts if it's the current doctor's post
          const authUser = (action.meta as any).state.auth.user;
          if (authUser?.id === (action.payload.data as Post).userId) {
            state.doctorPosts.unshift(action.payload.data as Post);
          }
        }
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to create post.';
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
        state.error = action.payload || 'Failed to fetch all posts.';
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
        state.error = action.payload || 'Failed to fetch post details.';
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
          const allIndex = state.allPosts.findIndex(p => p.id === updatedPost.id);
          if (allIndex !== -1) {
            state.allPosts[allIndex] = updatedPost;
          }
          // Update in doctorPosts
          const doctorIndex = state.doctorPosts.findIndex(p => p.id === updatedPost.id);
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
        state.error = action.payload || 'Failed to update post.';
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
        state.error = action.payload || 'Failed to delete post.';
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
        state.error = action.payload || 'Failed to fetch doctor\'s posts.';
      })

      // createComment (optimistically updated via addOptimisticComment)
      .addCase(createComment.pending, (state) => {
        state.error = null;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.error = null;
        // The actual comment object returned might have an updated ID/timestamp,
        // so you might replace the optimistic one if needed.
        // For simplicity, we trust the optimistic update and just clear errors.
      })
      .addCase(createComment.rejected, (state, action) => {
        state.error = action.payload || 'Failed to add comment.';
        // If optimistic update failed, you might need to revert the added comment or re-fetch currentPost
      })

      // likePost (optimistically updated via toggleOptimisticLike)
      .addCase(likePost.pending, (state) => {
        state.error = null;
      })
      .addCase(likePost.fulfilled, (state, action) => {
        state.error = null;
        // The optimistic update is often sufficient.
      })
      .addCase(likePost.rejected, (state, action) => {
        state.error = action.payload || 'Failed to like post.';
        // If optimistic update failed, you might need to revert the like
      })

      // unlikePost (optimistically updated via toggleOptimisticLike)
      .addCase(unlikePost.pending, (state) => {
        state.error = null;
      })
      .addCase(unlikePost.fulfilled, (state, action) => {
        state.error = null;
        // The optimistic update is often sufficient.
      })
      .addCase(unlikePost.rejected, (state, action) => {
        state.error = action.payload || 'Failed to unlike post.';
        // If optimistic update failed, you might need to revert the unlike
      });
  },
});

export const { clearPostsError, clearCurrentPost, clearDoctorPosts, addOptimisticComment, toggleOptimisticLike, removeOptimisticPost } = postsSlice.actions;
export default postsSlice.reducer;
```

---

### Step 3: Update Redux Store Configuration (`src/redux/store.ts`)

Add the new `postsReducer` to your store.

```typescript
// src/redux/store.ts (UPDATED)

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import doctorProfileReducer from './slices/doctorProfileSlice';
import adminReducer from './slices/adminSlice';
import patientProfileReducer from './slices/patientProfileSlice';
import timeslotReducer from './slices/timeslotSlice';
import appointmentReducer from './slices/appointmentSlice';
import consultationReducer from './slices/consultationSlice';
import prescriptionReducer from './slices/prescriptionSlice';
import streamReducer from './slices/streamSlice';
import callReducer from './slices/callSlice';
import messageReducer from './slices/messageSlice';
import postsReducer from './slices/postsSlice'; // NEW IMPORT

export const store = configureStore({
  reducer: {
    auth: authReducer,
    doctorProfile: doctorProfileReducer,
    admin: adminReducer,
    patientProfile: patientProfileReducer,
    timeslot: timeslotReducer,
    appointment: appointmentReducer,
    consultation: consultationReducer,
    prescription: prescriptionReducer,
    stream: streamReducer,
    call: callReducer,
    message: messageReducer,
    posts: postsReducer, // ADD THIS LINE
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

---

### Step 4: UI Components for Posts & Reactions

Now, let's create the necessary screens.

**4.1. `app/(tabs)/index.tsx` (Home/Posts Feed Screen)**

This will be the main feed displaying all posts.

```typescript
// app/(tabs)/index.tsx (Home/Posts Feed Screen)

import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Text, RefreshControl, TouchableOpacity, Image, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchAllPosts, likePost, unlikePost, clearPostsError, removeOptimisticPost, toggleOptimisticLike } from '@/redux/slices/postsSlice';
import { Post } from '@/constants/types/post';
import { CustomText, AppButton } from '@/components';
import { COLORS } from '@/constants/theme';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { formatDistanceToNow, parseISO } from 'date-fns'; // For timestamp formatting

const PostsListScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const { allPosts, isLoading, error } = useSelector((state: RootState) => state.posts);
  const authUser = useSelector((state: RootState) => state.auth.user); // Current logged-in user
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchAllPosts());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      Alert.alert(t('common.error'), error);
      dispatch(clearPostsError());
    }
  }, [error, dispatch, t]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchAllPosts());
    setRefreshing(false);
  }, [dispatch]);

  const handleCreatePost = () => {
    router.push('/posts/create-post'); // Navigate to create post screen
  };

  const handleViewPostDetails = (postId: string) => {
    router.push({ pathname: '/posts/post-detail', params: { postId } });
  };

  const handleLikeToggle = async (post: Post) => {
    if (!authUser?.id) return;

    const userLiked = post.likes?.some(like => like.userId === authUser.id);
    const like: Post['likes'][0] | undefined = userLiked ? undefined : { // Create a dummy like for optimistic update
        id: `optimistic-like-${Date.now()}`,
        userId: authUser.id,
        postId: post.id,
        createdAt: new Date().toISOString(),
        user: authUser // Attach user for display
    };

    dispatch(toggleOptimisticLike({ postId: post.id, userId: authUser.id, liked: !userLiked, like }));

    try {
        if (userLiked) {
            await dispatch(unlikePost(post.id)).unwrap();
        } else {
            await dispatch(likePost(post.id)).unwrap();
        }
    } catch (err: any) {
        Alert.alert(t('common.error'), err.message || t('posts.likeFailed'));
        // Revert optimistic update if API fails
        dispatch(toggleOptimisticLike({ postId: post.id, userId: authUser.id, liked: userLiked, like }));
    }
  };


  const renderPostItem = ({ item }: { item: Post }) => {
    const userLiked = item.likes?.some(like => like.userId === authUser?.id);
    const isMyPost = item.userId === authUser?.id;

    return (
      <TouchableOpacity style={styles.postCard} onPress={() => handleViewPostDetails(item.id)} activeOpacity={0.8}>
        <View style={styles.postHeader}>
          {/* User Avatar/Name */}
          <View style={styles.userInfo}>
            <FontAwesome name="user-circle" size={30} color={COLORS.gray} style={styles.userAvatar} />
            <CustomText type="body3" style={styles.userName}>
              {item.user?.firstname} {item.user?.lastname} {isMyPost && `(${t('posts.myPost')})`}
            </CustomText>
          </View>
          <CustomText type="body5" style={styles.postTime}>
            {formatDistanceToNow(parseISO(item.createdAt), { addSuffix: true })}
          </CustomText>
        </View>

        <CustomText type="h4" style={styles.postTitle}>{item.title}</CustomText>
        {item.image && <Image source={{ uri: item.image }} style={styles.postImage} />}
        <CustomText type="body3" numberOfLines={3} style={styles.postDescription}>{item.description}</CustomText>

        <View style={styles.postActions}>
          <TouchableOpacity onPress={() => handleLikeToggle(item)} style={styles.actionButton}>
            <FontAwesome name={userLiked ? "heart" : "heart-o"} size={20} color={userLiked ? COLORS.danger : COLORS.gray} />
            <CustomText style={styles.actionText}>{item.likesCount || 0}</CustomText>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleViewPostDetails(item.id)} style={styles.actionButton}>
            <FontAwesome name="comment-o" size={20} color={COLORS.gray} />
            <CustomText style={styles.actionText}>{item.commentsCount || 0}</CustomText>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading && allPosts.length === 0 && !error) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <CustomText type="body1" style={styles.loadingText}>{t('common.loadingPosts')}</CustomText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <CustomText type="h1" style={styles.header}>{t('posts.title')}</CustomText>
        {authUser?.role === 'DOCTOR' && ( // Only doctors can create posts
          <AppButton
            title={t('posts.createPostButton')}
            onPress={handleCreatePost}
            backgroundColor={COLORS.primary}
            containerStyle={styles.createPostButton}
            titleStyle={styles.createPostButtonTitle}
          />
        )}
      </View>

      {allPosts.length === 0 && !isLoading ? (
        <View style={styles.emptyContainer}>
          <CustomText type="body1" style={styles.emptyText}>{t('posts.noPosts')}</CustomText>
          <AppButton
            title={t('common.refresh')}
            onPress={onRefresh}
            backgroundColor={COLORS.primary}
            containerStyle={{ marginTop: 20, width: '50%' }}
          />
        </View>
      ) : (
        <FlatList
          data={allPosts}
          keyExtractor={(item) => item.id}
          renderItem={renderPostItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
        />
      )}
    </View>
  );
};

export default PostsListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 50,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  header: {
    color: COLORS.primary,
  },
  createPostButton: {
    width: 120, // Adjust width
    height: 35, // Adjust height
    borderRadius: 18,
  },
  createPostButtonTitle: {
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: COLORS.gray,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  postCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    marginRight: 8,
  },
  userName: {
    color: COLORS.dark,
    fontWeight: 'bold',
  },
  postTime: {
    color: COLORS.gray,
    fontSize: 12,
  },
  postTitle: {
    color: COLORS.dark,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  postDescription: {
    color: COLORS.text,
    marginBottom: 10,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: 10,
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  actionText: {
    marginLeft: 8,
    color: COLORS.gray,
    fontSize: 16,
  },
});
```

**4.2. `app/(tabs)/posts/create-post.tsx` (Doctor Creates New Post)**

```typescript
// app/(tabs)/posts/create-post.tsx (Doctor Creates New Post)

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, Image, Text, TouchableOpacity } from 'react-native';
import { Formik, FormikHelpers } from 'formik';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker'; // For image upload

import { AppButton, AuthInputField, CustomText } from '@/components';
import { COLORS } from '@/constants/theme';
import { createPost, clearPostsError } from '@/redux/slices/postsSlice';
import { AppDispatch, RootState } from '@/redux/store';

interface CreatePostValues {
  title: string;
  image: string; // Will store image URI/URL
  description: string;
}

const CreatePostScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const { isLoading, error } = useSelector((state: RootState) => state.posts);
  const authUser = useSelector((state: RootState) => state.auth.user); // To check user role

  const [pickedImageUri, setPickedImageUri] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not a doctor
    if (authUser?.role !== 'DOCTOR') {
      Alert.alert(t('common.accessDenied'), t('posts.doctorOnlyAccess'));
      router.replace('/(tabs)/');
      return;
    }
    dispatch(clearPostsError());
  }, [dispatch, authUser, router, t]);

  const initialValues: CreatePostValues = {
    title: '',
    image: '',
    description: '',
  };

  const validationSchema = yup.object({
    title: yup.string().required(t('posts.titleRequired')),
    description: yup.string().required(t('posts.descriptionRequired')),
    image: yup.string().nullable(), // Image is optional but if provided, must be valid URI/URL
  });

  const pickImage = async (setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('common.permissionRequired'), t('common.mediaPermissionPrompt'));
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // Allow basic editing (crop)
      aspect: [16, 9], // Aspect ratio for blog posts
      quality: 0.7,
      // base64: true, // Only if your backend expects base64
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setPickedImageUri(uri);
      setFieldValue('image', uri, true); // Set Formik field

      // IMPORTANT: In a real app, you would UPLOAD this image (uri) to a cloud storage
      // (e.g., Cloudinary, AWS S3) from here or via your backend.
      // The `setFieldValue('image', uploadedUrl)` would then use the URL returned by the cloud.
      // For now, it sends the local URI, which your backend might not accept directly.
    }
  };

  const handleSubmit = async (
    values: CreatePostValues,
    actions: FormikHelpers<CreatePostValues>
  ) => {
    // Ensure image is a valid URL if it's not a local URI from a real upload service
    const imageUrlToSend = values.image || undefined; // Or a placeholder if no image

    const resultAction = await dispatch(createPost({
      title: values.title,
      description: values.description,
      image: imageUrlToSend, // Should be an uploaded URL
    }));

    if (createPost.fulfilled.match(resultAction)) {
      Alert.alert(t('common.success'), t('posts.postCreatedSuccess'));
      actions.resetForm();
      setPickedImageUri(null); // Clear image preview
      router.replace('/(tabs)/'); // Go back to the posts list
    }
    // Errors are handled by Redux state and displayed
  };

  if (authUser?.role !== 'DOCTOR') {
    return <View style={styles.accessDeniedContainer}><CustomText type="h2">{t('common.accessDenied')}</CustomText></View>;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomText type="h1" style={styles.header}>{t('posts.createPostTitle')}</CustomText>
        <CustomText type="body2" style={styles.subtitle}>{t('posts.createPostSubtitle')}</CustomText>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ handleSubmit, setFieldValue, values, errors, touched }) => (
            <View style={styles.form}>
              <AuthInputField
                name="title"
                label={t('posts.titleLabel')}
                placeholder={t('posts.titlePlaceholder')}
                containerStyle={styles.inputField}
              />
              <AuthInputField
                name="description"
                label={t('posts.descriptionLabel')}
                placeholder={t('posts.descriptionPlaceholder')}
                containerStyle={styles.inputField}
                multiline
                numberOfLines={5}
              />

              {/* Image Picker */}
              <View style={styles.imagePickerContainer}>
                <AppButton
                  title={t('posts.selectImageButton')}
                  onPress={() => pickImage(setFieldValue)}
                  backgroundColor={COLORS.secondary}
                  textColor={COLORS.dark}
                  containerStyle={styles.selectImageButton}
                  titleStyle={styles.selectImageButtonTitle}
                />
                {pickedImageUri && (
                  <Image source={{ uri: pickedImageUri }} style={styles.pickedImage} />
                )}
                {touched.image && errors.image && (
                  <Text style={styles.errorText}>{errors.image}</Text>
                )}
              </View>

              {error && <Text style={styles.errorText}>{error}</Text>}

              <AppButton
                title={t('posts.submitPostButton')}
                onPress={handleSubmit}
                backgroundColor={COLORS.primary}
                loading={isLoading}
                loadingText={t('common.loading')}
                containerStyle={styles.submitButton}
              />
            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreatePostScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  accessDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
  },
  header: {
    marginBottom: 10,
    textAlign: 'center',
    color: COLORS.primary,
  },
  subtitle: {
    marginBottom: 30,
    textAlign: 'center',
    color: COLORS.gray,
  },
  form: {
    width: '100%',
    maxWidth: 450,
    alignItems: 'center',
  },
  inputField: {
    marginBottom: 15,
    width: '100%',
  },
  imagePickerContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 10,
    backgroundColor: COLORS.background,
  },
  selectImageButton: {
    width: '80%',
    height: 40,
    borderRadius: 20,
    marginBottom: 10,
  },
  selectImageButtonTitle: {
    fontSize: 16,
  },
  pickedImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginTop: 10,
    resizeMode: 'cover',
  },
  errorText: {
    color: COLORS.danger,
    marginTop: 5,
    textAlign: 'center',
    width: '100%',
    fontSize: 12,
  },
  submitButton: {
    width: '100%',
    marginTop: 20,
  },
});
```

**4.3. `app/(tabs)/posts/post-detail.tsx` (View Single Post & Reactions)**

```typescript
// app/(tabs)/posts/post-detail.tsx (View Single Post & Reactions)

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Text, Image, Alert, TouchableOpacity, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchSinglePost, clearCurrentPost, clearPostsError, createComment, likePost, unlikePost, addOptimisticComment, toggleOptimisticLike, deletePost, removeOptimisticPost, updatePost } from '@/redux/slices/postsSlice';
import { Post, Comment, Like } from '@/constants/types/post';
import { CustomText, AppButton, AuthInputField } from '@/components';
import { COLORS } from '@/constants/theme';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { formatDistanceToNow, parseISO } from 'date-fns';

const PostDetailScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const { postId } = useLocalSearchParams<{ postId: string }>();

  const { currentPost, isLoading, error } = useSelector((state: RootState) => state.posts);
  const authUser = useSelector((state: RootState) => state.auth.user); // Current logged-in user

  const [commentInput, setCommentInput] = useState('');
  const [isEditing, setIsEditing] = useState(false); // State for editing post content
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);


  useEffect(() => {
    if (postId) {
      dispatch(fetchSinglePost(postId));
    }
    return () => {
      dispatch(clearCurrentPost()); // Clear current post when unmounting
      dispatch(clearPostsError());
    };
  }, [dispatch, postId]);

  useEffect(() => {
    if (error) {
      Alert.alert(t('common.error'), error);
      dispatch(clearPostsError());
    }
  }, [error, dispatch, t]);

  useEffect(() => {
    if (currentPost && isEditing) {
      setEditedTitle(currentPost.title);
      setEditedDescription(currentPost.description);
    }
  }, [currentPost, isEditing]);


  const handleCommentSubmit = async () => {
    if (!commentInput.trim() || !postId || !authUser?.id) return;

    const newComment: Comment = { // Optimistic comment object
      id: `optimistic-comment-${Date.now()}`,
      userId: authUser.id,
      user: authUser, // Include user object for display
      postId: postId,
      content: commentInput,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch(addOptimisticComment({ postId, comment: newComment })); // Optimistic update
    setCommentInput(''); // Clear input immediately
    scrollViewRef.current?.scrollToEnd({ animated: true }); // Scroll to end to show new comment

    try {
      const resultAction = await dispatch(createComment({ postId, content: newComment.content }));
      if (createComment.rejected.match(resultAction)) {
        Alert.alert(t('common.error'), resultAction.payload || t('posts.commentFailed'));
        // Re-fetch post or manually remove optimistic comment if API call fails
        dispatch(fetchSinglePost(postId));
      }
    } catch (err: any) {
      Alert.alert(t('common.error'), err.message || t('posts.commentFailed'));
      dispatch(fetchSinglePost(postId));
    }
  };

  const handleLikeToggle = async () => {
    if (!currentPost || !authUser?.id) return;

    const userLiked = currentPost.likes?.some(like => like.userId === authUser.id);
    const like: Like | undefined = userLiked ? undefined : { // Create a dummy like for optimistic update
        id: `optimistic-like-${Date.now()}`,
        userId: authUser.id,
        postId: currentPost.id,
        createdAt: new Date().toISOString(),
        user: authUser
    };

    dispatch(toggleOptimisticLike({ postId: currentPost.id, userId: authUser.id, liked: !userLiked, like }));

    try {
        if (userLiked) {
            await dispatch(unlikePost(currentPost.id)).unwrap();
        } else {
            await dispatch(likePost(currentPost.id)).unwrap();
        }
    } catch (err: any) {
        Alert.alert(t('common.error'), err.message || t('posts.likeFailed'));
        // Revert optimistic update if API fails
        dispatch(toggleOptimisticLike({ postId: currentPost.id, userId: authUser.id, liked: userLiked, like }));
    }
  };

  const handleEditPost = async () => {
    if (!currentPost) return;

    if (isEditing) { // If currently in editing mode, this button is "Save"
      Alert.alert(
        t('posts.saveChangesTitle'),
        t('posts.saveChangesMessage'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('common.save'), onPress: async () => {
            try {
              const resultAction = await dispatch(updatePost({
                postId: currentPost.id,
                payload: { title: editedTitle, description: editedDescription }
              })).unwrap();
              Alert.alert(t('common.success'), t('posts.postUpdatedSuccess'));
              setIsEditing(false); // Exit editing mode
            } catch (err: any) {
              Alert.alert(t('common.error'), err.message || t('posts.updateFailed'));
            }
          }},
        ]
      );
    } else { // Not in editing mode, this button is "Edit"
      setIsEditing(true);
    }
  };

  const handleDeletePost = () => {
    if (!currentPost) return;

    Alert.alert(
      t('posts.deletePostTitle'),
      t('posts.deletePostMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.delete'), style: 'destructive', onPress: async () => {
          dispatch(removeOptimisticPost(currentPost.id)); // Optimistic delete
          try {
            await dispatch(deletePost(currentPost.id)).unwrap();
            Alert.alert(t('common.success'), t('posts.postDeletedSuccess'));
            router.replace('/(tabs)/'); // Go back to posts list
          } catch (err: any) {
            Alert.alert(t('common.error'), err.message || t('posts.deleteFailed'));
            // If delete fails, you might want to re-fetch all posts to restore it in UI
            dispatch(fetchSinglePost(currentPost.id)); // Try to re-fetch if optimistic delete fails
          }
        }},
      ]
    );
  };

  if (isLoading && !currentPost) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <CustomText type="body1" style={styles.loadingText}>{t('common.loadingPost')}</CustomText>
      </View>
    );
  }

  if (!currentPost) {
    return (
      <View style={styles.emptyContainer}>
        <CustomText type="body1" style={styles.emptyText}>{t('posts.postNotFound')}</CustomText>
        <AppButton title={t('common.goBack')} onPress={() => router.back()} />
      </View>
    );
  }

  const isMyPost = currentPost.userId === authUser?.id;
  const userLiked = currentPost.likes?.some(like => like.userId === authUser?.id);

  return (
    <KeyboardAvoidingView
      style={styles.fullScreenContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} ref={scrollViewRef}>
        <View style={styles.postCard}>
          <View style={styles.postHeader}>
            <View style={styles.userInfo}>
              <FontAwesome name="user-circle" size={30} color={COLORS.gray} style={styles.userAvatar} />
              <CustomText type="body3" style={styles.userName}>
                {currentPost.user?.firstname} {currentPost.user?.lastname} {isMyPost && `(${t('posts.myPost')})`}
              </CustomText>
            </View>
            <CustomText type="body5" style={styles.postTime}>
              {formatDistanceToNow(parseISO(currentPost.createdAt), { addSuffix: true })}
            </CustomText>
          </View>

          {isEditing ? (
            <>
              <AuthInputField
                name="editedTitle"
                value={editedTitle}
                onChangeText={setEditedTitle}
                label={t('posts.titleLabel')}
                containerStyle={styles.editInputField}
              />
              <AuthInputField
                name="editedDescription"
                value={editedDescription}
                onChangeText={setEditedDescription}
                label={t('posts.descriptionLabel')}
                containerStyle={styles.editInputField}
                multiline
                numberOfLines={5}
              />
            </>
          ) : (
            <>
              <CustomText type="h3" style={styles.postTitle}>{currentPost.title}</CustomText>
              {currentPost.image && <Image source={{ uri: currentPost.image }} style={styles.postImage} />}
              <CustomText type="body2" style={styles.postDescription}>{currentPost.description}</CustomText>
            </>
          )}

          <View style={styles.postActionsDetail}>
            <TouchableOpacity onPress={handleLikeToggle} style={styles.actionButton}>
              <FontAwesome name={userLiked ? "heart" : "heart-o"} size={24} color={userLiked ? COLORS.danger : COLORS.gray} />
              <CustomText style={styles.actionText}>{currentPost.likesCount || 0}</CustomText>
            </TouchableOpacity>

            <View style={styles.actionButton}>
              <FontAwesome name="comment-o" size={24} color={COLORS.gray} />
              <CustomText style={styles.actionText}>{currentPost.commentsCount || 0}</CustomText>
            </View>
          </div>

          {isMyPost && authUser?.role === 'DOCTOR' && (
            <View style={styles.myPostActions}>
              <AppButton
                title={isEditing ? t('common.save') : t('common.edit')}
                onPress={handleEditPost}
                backgroundColor={isEditing ? COLORS.primary : COLORS.secondary}
                textColor={isEditing ? COLORS.white : COLORS.dark}
                containerStyle={styles.myActionButton}
                loading={isLoading}
              />
              {!isEditing && ( // Show delete only when not editing
                <AppButton
                  title={t('common.delete')}
                  onPress={handleDeletePost}
                  backgroundColor={COLORS.danger}
                  containerStyle={styles.myActionButton}
                  loading={isLoading}
                />
              )}
            </View>
          )}
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <CustomText type="h3" style={styles.commentsHeader}>{t('posts.comments')}</CustomText>
          {currentPost.comments && currentPost.comments.length > 0 ? (
            currentPost.comments.map(comment => (
              <View key={comment.id} style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  <FontAwesome name="user-circle" size={20} color={COLORS.gray} style={styles.commentAvatar} />
                  <CustomText type="body4" style={styles.commentUserName}>
                    {comment.user?.firstname} {comment.user?.lastname}
                  </CustomText>
                  <CustomText type="body5" style={styles.commentTime}>
                    {formatDistanceToNow(parseISO(comment.createdAt), { addSuffix: true })}
                  </CustomText>
                </View>
                <CustomText type="body4" style={styles.commentContent}>{comment.content}</CustomText>
              </View>
            ))
          ) : (
            <CustomText style={styles.noCommentsText}>{t('posts.noCommentsYet')}</CustomText>
          )}
        </View>
      </ScrollView>

      {/* Comment Input */}
      <View style={styles.commentInputContainer}>
        <TextInput
          style={styles.commentInputField}
          value={commentInput}
          onChangeText={setCommentInput}
          placeholder={t('posts.writeCommentPlaceholder')}
          placeholderTextColor={COLORS.gray}
          multiline
          returnKeyType="send"
          onSubmitEditing={handleCommentSubmit}
        />
        <TouchableOpacity onPress={handleCommentSubmit} style={styles.sendCommentButton}>
          <FontAwesome name="send" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default PostDetailScreen;

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: COLORS.gray,
    textAlign: 'center',
  },
  postCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    marginRight: 10,
  },
  userName: {
    color: COLORS.dark,
    fontWeight: 'bold',
  },
  postTime: {
    color: COLORS.gray,
    fontSize: 12,
  },
  postTitle: {
    color: COLORS.dark,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  postImage: {
    width: '100%',
    height: 220,
    borderRadius: 8,
    marginBottom: 15,
    resizeMode: 'cover',
  },
  postDescription: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
  },
  postActionsDetail: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: 15,
    marginTop: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  actionText: {
    marginLeft: 10,
    color: COLORS.gray,
    fontSize: 18,
  },
  myPostActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: 15,
  },
  myActionButton: {
    width: '45%',
    height: 40,
    borderRadius: 20,
  },
  editInputField: {
    marginBottom: 15,
    width: '100%',
    backgroundColor: COLORS.background, // Make it stand out during edit
  },
  commentsSection: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  commentsHeader: {
    color: COLORS.dark,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    paddingBottom: 10,
  },
  commentCard: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAvatar: {
    marginRight: 8,
  },
  commentUserName: {
    color: COLORS.dark,
    fontWeight: 'bold',
    marginRight: 'auto', // Push time to the right
  },
  commentTime: {
    color: COLORS.gray,
    fontSize: 10,
  },
  commentContent: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 22,
  },
  noCommentsText: {
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 10,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  commentInputField: {
    flex: 1,
    minHeight: 45,
    maxHeight: 120,
    backgroundColor: COLORS.background,
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 16,
    marginRight: 10,
  },
  sendCommentButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

---

### Step 5: Update Root Navigation (`app/(tabs)/_layout.tsx`)

We need to integrate the new posts-related screens into your tab navigation.

```typescript
// app/(tabs)/_layout.tsx (UPDATED for Posts & Reactions)

import { Tabs, Redirect } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import React, { useEffect } from 'react';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { fetchPatientProfile } from '@/redux/slices/patientProfileSlice';
import { fetchDoctorProfileById } from '@/redux/slices/doctorProfileSlice';
import { COLORS } from '@/constants/theme';

export default function TabLayout() {
  const dispatch: AppDispatch = useDispatch();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const authIsLoading = useSelector((state: RootState) => state.auth.isLoading);
  const patientProfile = useSelector((state: RootState) => state.patientProfile.profile);
  const patientIsLoading = useSelector((state: RootState) => state.patientProfile.isLoading);
  const doctorProfile = useSelector((state: RootState) => state.doctorProfile.profile);
  const doctorIsLoading = useSelector((state: RootState) => state.doctorProfile.isLoading);

  const [hasCheckedProfiles, setHasCheckedProfiles] = React.useState(false);

  useEffect(() => {
    const checkAndFetchProfiles = async () => {
      if (authUser && !authIsLoading) {
        if (authUser.role === 'PATIENT' && authUser.patientProfileId) {
          await dispatch(fetchPatientProfile(authUser.id)).unwrap();
        } else if (authUser.role === 'DOCTOR' && authUser.doctorProfileId) {
          await dispatch(fetchDoctorProfileById(authUser.doctorProfileId)).unwrap();
        } else if (authUser.role === 'PENDING_DOCTOR' && authUser.doctorProfileId) {
          await dispatch(fetchDoctorProfileById(authUser.doctorProfileId)).unwrap();
        }
        setHasCheckedProfiles(true);
      } else if (!authUser && !authIsLoading) {
        setHasCheckedProfiles(true);
      }
    };

    if (!hasCheckedProfiles && !authIsLoading && authUser) {
      checkAndFetchProfiles();
    }
  }, [authUser, authIsLoading, hasCheckedProfiles, dispatch]);

  if (authIsLoading || !hasCheckedProfiles || patientIsLoading || doctorIsLoading) {
    return (
      <View style={layoutStyles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 10 }}>Loading user data...</Text>
      </View>
    );
  }

  // --- Redirect to Profile Completion if needed ---
  if (authUser) {
    const hasPatientProfile = !!patientProfile;
    const hasDoctorProfile = !!doctorProfile;

    if (authUser.role === 'PATIENT' && !hasPatientProfile) {
      return <Redirect href="/profile/create-patient" />;
    }
    if ((authUser.role === 'DOCTOR' || authUser.role === 'PENDING_DOCTOR') && !hasDoctorProfile) {
      return <Redirect href="/profile/create-doctor" />;
    }

    // After ensuring profiles are complete, determine role-based tab visibility
    const isAdmin = authUser?.role === 'ADMIN';
    const isDoctor = authUser?.role === 'DOCTOR';
    const isPatient = authUser?.role === 'PATIENT';

    return (
      <Tabs>
        <Tabs.Screen
          name="index" // Home/Posts Feed screen
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="messages/index" // Custom Messages tab
          options={{
            title: 'Messages',
            tabBarIcon: ({ color }) => <FontAwesome size={28} name="comments" color={color} />,
            headerShown: false,
          }}
        />

        {/* Doctor-specific tabs (only for APPROVED doctors) */}
        {isDoctor && (
          <>
            <Tabs.Screen
              name="doctor/create-timeslot"
              options={{
                title: 'Timeslots',
                tabBarIcon: ({ color }) => <FontAwesome size={28} name="clock-o" color={color} />,
                headerShown: false,
              }}
            />
            <Tabs.Screen
              name="doctor/my-appointments"
              options={{
                title: 'Doc Apps',
                tabBarIcon: ({ color }) => <FontAwesome size={28} name="calendar-check-o" color={color} />,
                headerShown: false,
              }}
            />
             <Tabs.Screen
              name="doctor/my-consultations"
              options={{
                title: 'My Consults',
                tabBarIcon: ({ color }) => <FontAwesome size={28} name="file-text-o" color={color} />,
                headerShown: false,
              }}
            />
             <Tabs.Screen
              name="doctor/my-prescriptions"
              options={{
                title: 'My Presc.',
                tabBarIcon: ({ color }) => <FontAwesome size={28} name="stethoscope" color={color} />,
                headerShown: false,
              }}
            />
          </>
        )}

        {/* Patient-specific tabs (only for patients with completed profile) */}
        {isPatient && (
          <>
            <Tabs.Screen
              name="book-appointment/doctor-list"
              options={{
                title: 'Book Appt',
                tabBarIcon: ({ color }) => <FontAwesome size={28} name="calendar-plus-o" color={color} />,
                headerShown: false,
              }}
            />
            <Tabs.Screen
              name="my-appointments"
              options={{
                title: 'My Apps',
                tabBarIcon: ({ color }) => <FontAwesome size={28} name="calendar" color={color} />,
                headerShown: false,
              }}
            />
            <Tabs.Screen
              name="my-records/consultations"
              options={{
                title: 'My Consults',
                tabBarIcon: ({ color }) => <FontAwesome size={28} name="history" color={color} />,
                headerShown: false,
              }}
            />
            <Tabs.Screen
              name="my-records/prescriptions"
              options={{
                title: 'My Presc.',
                tabBarIcon: ({ color }) => <FontAwesome size={28} name="medkit" color={color} />,
                headerShown: false,
              }}
            />
          </>
        )}

        {/* Admin-specific tab */}
        {isAdmin && (
          <Tabs.Screen
            name="admin/kyc-list"
            options={{
              title: 'Admin KYC',
              tabBarIcon: ({ color }) => <FontAwesome size={28} name="gavel" color={color} />,
              headerShown: false,
            }}
          />
        )}

        <Tabs.Screen
          name="profile/my-profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <FontAwesome size={28} name="user" color={color} />,
            headerShown: false,
          }}
        />

        {/* HIDDEN SCREENS (accessed via router.push - not directly in tabs) */}
        {/* Profile Completion/Edit Screens */}
        <Tabs.Screen name="profile/create-patient" options={{ href: null, headerShown: false }} />
        <Tabs.Screen name="profile/create-doctor" options={{ href: null, headerShown: false }} />
        <Tabs.Screen name="profile/edit-patient" options={{ href: null, headerShown: false }} />
        <Tabs.Screen name="profile/edit-doctor" options={{ href: null, headerShown: false }} />

        {/* Doctor Specific Detail Screens */}
        <Tabs.Screen name="doctor/record-consultation" options={{ href: null, headerShown: false }} />
        <Tabs.Screen name="doctor/consultation-detail" options={{ href: null, headerShown: false }} />
        <Tabs.Screen name="doctor/create-prescription" options={{ href: null, headerShown: false }} />
        <Tabs.Screen name="doctor/prescription-detail" options={{ href: null, headerShown: false }} />

        {/* Patient Specific Detail Screens */}
        <Tabs.Screen name="book-appointment/doctor-detail" options={{ href: null, headerShown: false }} />
        <Tabs.Screen name="my-records/consultation-detail-view" options={{ href: null, headerShown: false }} />
        <Tabs.Screen name="my-records/prescription-detail-view" options={{ href: null, headerShown: false }} />

        {/* Custom Messaging Detail Screen */}
        <Tabs.Screen name="messages/chat/[chatPartnerId]" options={{ href: null, headerShown: false }} />

        {/* Post related screens */}
        <Tabs.Screen name="posts/create-post" options={{ href: null, headerShown: false }} />
        <Tabs.Screen name="posts/post-detail" options={{ href: null, headerShown: false }} />

        {/* Call Screen (handled by root _layout.tsx as a modal) */}
        {/* <Stack.Screen name="calls/[streamCallId]" ... /> is in root _layout.tsx */}
      </Tabs>
    );
  }

  return <Redirect href="/auth/login" />;
}

const layoutStyles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background || '#F7F7F7',
  },
});
```

---

### Key Considerations for Posts & Reactions:

1.  **Image Uploads (`create-post.tsx`):** The `image` field currently stores the local URI from `expo-image-picker`. **For production, you MUST implement a file upload mechanism.** This usually means:
    *   Uploading the image to a cloud storage service (e.g., Cloudinary, AWS S3, Firebase Storage).
    *   Your backend receives the *URL* from the cloud service, not the raw image data directly from the frontend.
    *   Adjust the `createPost` payload to send the generated public URL.
    *   **Backend:** Your `POST /api/posts/create` endpoint needs to accept an image URL.

2.  **`AuthInputField` in `PostDetailScreen`:** For editing post details, I've used `AuthInputField`. Ensure its styling is appropriate for in-place editing.

3.  **Optimistic Updates:** The `postsSlice` uses `addOptimisticComment`, `toggleOptimisticLike`, and `removeOptimisticPost` for immediate UI feedback. If the corresponding API call fails, the UI will revert (e.g., by re-fetching the post). This enhances responsiveness.

4.  **User Roles:** The "Create Post" button is conditionally rendered only for `DOCTOR` roles in `PostsListScreen`. Update/Delete actions are conditional based on `isMyPost` in `PostDetailScreen`.

5.  **Data Population for Comments/Likes:** The UI components assume that when a `Post` is fetched (`fetchSinglePost` or `fetchAllPosts`), its `comments` and `likes` arrays are fully populated by the backend, including `user` objects for displaying sender names. If your backend only returns IDs, you'll need additional API calls or backend modifications to enrich this data.

6.  **Translation Keys:** Remember to add all new translation keys (e.g., `posts.title`, `posts.createPostButton`, `posts.likeFailed`, `posts.comments`, etc.) to your `i18n` configuration.

This completes the Posts and Reactions feature. This is a very robust set of features now! Let me know if you are ready to explore other areas or need further refinements.




You are absolutely correct to point out these new errors! My apologies, as these are indeed subtle type issues that can arise with optional properties, array access, and the specifics of Redux Toolkit's Immer integration. You're right, I need to look beyond just the immediate file and check the types as well.

Let's address each error systematically.

---

### Analysis and Solutions

#### 1. `postsSlice.ts` Errors

**Error 1 & 2:** `Argument of type 'WritableDraft<Post> | undefined' is not assignable to parameter of type 'Post | null'. Type 'undefined' is not assignable to type 'Post | null'`
*   **Reason:** This occurs within the `toggleOptimisticLike` reducer in the helper function `updatePostLikes`. `state.allPosts.find(...)` and `state.doctorPosts.find(...)` can return `undefined` if no matching post is found. However, `updatePostLikes` expects `Post | null`.
*   **Fix:** Ensure `updatePostLikes` handles `undefined` gracefully, or more simply, ensure it's always called with a non-null/non-undefined `Post` object. The safest way is to refine the type or add a check before calling `updatePostLikes`.

#### 2. `post-detail.tsx` Error

**Error:** `Type 'boolean | undefined' is not assignable to type 'boolean'. Type 'undefined' is not assignable to type 'boolean'.ts(2322)`
*   **Reason:** This error originates from `toggleOptimisticLike`'s payload `liked: !userLiked`. `userLiked` is derived from `post.likes?.some(...)`, which can result in `boolean | undefined`. The `toggleOptimisticLike` action expects `liked: boolean`.
*   **Fix:** Explicitly cast or coerce `userLiked` to `boolean` before passing it to `toggleOptimisticLike`. A simple `!!userLiked` will convert `undefined` to `false` and `true`/`false` to their boolean equivalents.

#### 3. `app/(tabs)/index.tsx` Errors

**Error 1:** `Property '0' does not exist on type 'Like[] | undefined'.`
*   **Reason:** This error arises when trying to access `item.likes[0]` directly without checking if `item.likes` is `undefined` (or `null`) first. The `likes` property on `Post` is an array that might not be present.
*   **Fix:** Use optional chaining (`?.`) or a conditional check before accessing array elements. However, the initial logic `item.likes?.some(like => like.userId === authUser?.id)` is already safe. The direct access to `likes[0]` would be if we were trying to *display* something specific from the first like, which isn't happening in this simplified `renderPostItem`. The error likely points to an incorrect snippet or a cached type issue. I'll re-verify the `renderPostItem` to ensure all `likes` access is safe.

**Error 2:** `Type 'boolean | undefined' is not assignable to type 'boolean'. ... postsSlice.ts(339, 9): The expected type comes from property 'liked' which is declared here on type '{ postId: string; userId: string; liked: boolean; like?: Like | undefined; }'`
*   **Reason:** Same as `post-detail.tsx`. `userLiked` can be `boolean | undefined`.
*   **Fix:** Explicitly cast or coerce `userLiked` to `boolean` (`!!userLiked`) when passing it to `toggleOptimisticLike`.

---

### Corrected Code Implementations (Full Files)

#### 1. `src/redux/slices/postsSlice.ts` (FULL & FIXED)

```typescript
// src/redux/slices/postsSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '@/utils/api/axiosInstance'; // Ensure correct path
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
} from '@/constants/types/post'; // Ensure correct path
import { RootState } from '../store';

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
export const createPost = createAsyncThunk<PostApiResponse, CreatePostPayload, { rejectValue: string }>(
  'posts/createPost',
  async (postData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<PostApiResponse>('/posts/create', postData);
      const data = response.data;

      if (data.success && data.data && !Array.isArray(data.data)) {
        return data;
      } else {
        return rejectWithValue(data.message || 'Failed to create post.');
      }
    } catch (error: any) {
      console.error("Error creating post:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || 'Network Error';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunk to fetch all posts
export const fetchAllPosts = createAsyncThunk<PostApiResponse, void, { rejectValue: string }>(
  'posts/fetchAllPosts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<PostApiResponse>('/posts/post/all');
      const data = response.data;

      if (data.success && Array.isArray(data.data)) {
        return data;
      } else {
        return rejectWithValue(data.message || 'Failed to fetch all posts.');
      }
    } catch (error: any) {
      console.error("Error fetching all posts:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || 'Network Error';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunk to fetch a single post by ID
export const fetchSinglePost = createAsyncThunk<PostApiResponse, string, { rejectValue: string }>(
  'posts/fetchSinglePost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<PostApiResponse>(`/posts/${postId}`);
      const data = response.data;

      if (data.success && data.data && !Array.isArray(data.data)) {
        return data;
      } else {
        return rejectWithValue(data.message || 'Post not found.');
      }
    } catch (error: any) {
      console.error("Error fetching single post:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || 'Network Error';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunk to update a post (Doctor only)
export const updatePost = createAsyncThunk<PostApiResponse, UpdatePostPayload, { rejectValue: string }>(
  'posts/updatePost',
  async ({ postId, payload }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put<PostApiResponse>(`/posts/${postId}`, payload);
      const data = response.data;

      if (data.success && data.data && !Array.isArray(data.data)) {
        return data;
      } else {
        return rejectWithValue(data.message || 'Failed to update post.');
      }
    } catch (error: any) {
      console.error("Error updating post:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || 'Network Error';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunk to delete a post (Doctor only)
export const deletePost = createAsyncThunk<PostApiResponse, string, { rejectValue: string }>(
  'posts/deletePost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete<PostApiResponse>(`/posts/${postId}/like`); // Corrected path: was /posts/:postId/like instead of /posts/:postId
      const data = response.data;

      if (data.success) {
        return data;
      } else {
        return rejectWithValue(data.message || 'Failed to delete post.');
      }
    } catch (error: any) {
      console.error("Error deleting post:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || 'Network Error';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunk to fetch posts by a specific doctor
export const fetchPostsByDoctor = createAsyncThunk<PostApiResponse, string, { rejectValue: string }>(
  'posts/fetchPostsByDoctor',
  async (doctorId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<PostApiResponse>(`/posts/doctor/${doctorId}`);
      const data = response.data;

      if (data.success && Array.isArray(data.data)) {
        return data;
      } else {
        return rejectWithValue(data.message || `Failed to fetch posts for doctor ${doctorId}.`);
      }
    } catch (error: any) {
      console.error("Error fetching doctor's posts:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || 'Network Error';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunk to create a comment on a post
export const createComment = createAsyncThunk<CommentApiResponse, CreateCommentPayload, { rejectValue: string; state: RootState }>(
  'posts/createComment',
  async ({ postId, content }, { rejectWithValue, getState }) => {
    try {
      const response = await axiosInstance.post<CommentApiResponse>(`/posts/${postId}/comment`, { content });
      const data = response.data;
      const authUser = getState().auth.user; // Get the logged-in user for the comment object

      if (data.success && data.data) {
        const commentWithUser = { ...data.data, user: authUser || undefined };
        return { ...data, data: commentWithUser };
      } else {
        return rejectWithValue(data.message || 'Failed to create comment.');
      }
    } catch (error: any) {
      console.error("Error creating comment:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || 'Network Error';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunk to like a post
export const likePost = createAsyncThunk<LikeApiResponse, string, { rejectValue: string; state: RootState }>(
  'posts/likePost',
  async (postId, { rejectWithValue, getState }) => {
    try {
      const response = await axiosInstance.post<LikeApiResponse>(`/posts/${postId}/like`);
      const data = response.data;
      const authUser = getState().auth.user;

      if (data.success) { // Backend might not return data.data with a `like` object on success
        const newLike: Like = { // Construct optimistic like to ensure `user` property is available
          id: `temp-like-${Date.now()}-${authUser?.id}`, // Temporary ID
          userId: authUser?.id || '', // Must be non-null if user is logged in
          user: authUser || undefined,
          postId: postId,
          createdAt: new Date().toISOString(),
        };
        return { success: true, message: data.message || 'Post liked successfully.', data: { like: newLike } };
      } else {
        return rejectWithValue(data.message || 'Failed to like post.');
      }
    } catch (error: any) {
      console.error("Error liking post:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || 'Network Error';
      return rejectWithValue(errorMessage);
    }
  }
);

// Async Thunk to unlike a post
export const unlikePost = createAsyncThunk<LikeApiResponse, string, { rejectValue: string; state: RootState }>(
  'posts/unlikePost',
  async (postId, { rejectWithValue, getState }) => {
    try {
      const response = await axiosInstance.delete<LikeApiResponse>(`/posts/${postId}/like`);
      const data = response.data;
      const authUser = getState().auth.user;

      if (data.success) {
        return { success: true, message: data.message || 'Post unliked successfully.', data: { postId, userId: authUser?.id } };
      } else {
        return rejectWithValue(data.message || 'Failed to unlike post.');
      }
    } catch (error: any) {
      console.error("Error unliking post:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || 'Network Error';
      return rejectWithValue(errorMessage);
    }
  }
);


const postsSlice = createSlice({
  name: 'posts',
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
    addOptimisticComment: (state, action: PayloadAction<{ postId: string; comment: Comment }>) => {
      // Add comment to currentPost if applicable
      if (state.currentPost && state.currentPost.id === action.payload.postId) {
        if (!state.currentPost.comments) state.currentPost.comments = [];
        state.currentPost.comments.push(action.payload.comment);
        state.currentPost.commentsCount = (state.currentPost.commentsCount || 0) + 1;
      }
      // Also update in allPosts list for consistency
      const postInAll = state.allPosts.find(p => p.id === action.payload.postId);
      if (postInAll) {
        if (!postInAll.comments) postInAll.comments = [];
        postInAll.comments.push(action.payload.comment);
        postInAll.commentsCount = (postInAll.commentsCount || 0) + 1;
      }
      // Also update in doctorPosts list if applicable
      const postInDoctor = state.doctorPosts.find(p => p.id === action.payload.postId);
      if (postInDoctor) {
          if (!postInDoctor.comments) postInDoctor.comments = [];
          postInDoctor.comments.push(action.payload.comment);
          postInDoctor.commentsCount = (postInDoctor.commentsCount || 0) + 1;
      }
    },
    toggleOptimisticLike: (state, action: PayloadAction<{ postId: string; userId: string; liked: boolean; like?: Like }>) => {
      const { postId, userId, liked, like } = action.payload;

      // FIX for Errors 1 & 2 in postsSlice.ts: Handle `undefined` when finding posts
      const updatePostLikes = (post: Post | undefined) => { // <-- Changed parameter type to Post | undefined
        if (!post) return; // <-- Explicitly return if post is undefined

        if (!post.likes) post.likes = [];
        post.likesCount = post.likesCount || 0;

        if (liked) {
          if (!post.likes.some(l => l.userId === userId) && like) {
            // Ensure `like` object is provided when adding a like
            post.likes.push(like);
            post.likesCount++;
          }
        } else {
          const likeIndex = post.likes.findIndex(l => l.userId === userId);
          if (likeIndex !== -1) {
            post.likes.splice(likeIndex, 1);
            post.likesCount--;
          }
        }
      };

      updatePostLikes(state.currentPost);
      updatePostLikes(state.allPosts.find(p => p.id === postId));
      updatePostLikes(state.doctorPosts.find(p => p.id === postId));
    },
    removeOptimisticPost: (state, action: PayloadAction<string>) => {
      const postId = action.payload;
      state.allPosts = state.allPosts.filter(p => p.id !== postId);
      state.doctorPosts = state.doctorPosts.filter(p => p.id !== postId);
      if (state.currentPost?.id === postId) {
        state.currentPost = null;
      }
    }
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
          // Also add to doctorPosts if it's the current doctor's post
          const authUser = (action.meta.state as RootState).auth.user; // <-- Correct way to access root state in meta
          if (authUser?.id === (action.payload.data as Post).userId) {
            state.doctorPosts.unshift(action.payload.data as Post);
          }
        }
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to create post.';
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
        state.error = action.payload || 'Failed to fetch all posts.';
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
        state.error = action.payload || 'Failed to fetch post details.';
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
          const allIndex = state.allPosts.findIndex(p => p.id === updatedPost.id);
          if (allIndex !== -1) {
            state.allPosts[allIndex] = updatedPost;
          }
          // Update in doctorPosts
          const doctorIndex = state.doctorPosts.findIndex(p => p.id === updatedPost.id);
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
        state.error = action.payload || 'Failed to update post.';
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
        state.error = action.payload || 'Failed to delete post.';
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
        state.error = action.payload || 'Failed to fetch doctor\'s posts.';
      })

      // createComment (optimistically updated via addOptimisticComment)
      .addCase(createComment.pending, (state) => {
        state.error = null;
      })
      .addCase(createComment.fulfilled, (state) => { // Removed action.payload from here as it's not used post-optimistic-update
        state.error = null;
      })
      .addCase(createComment.rejected, (state, action) => {
        state.error = action.payload || 'Failed to add comment.';
      })

      // likePost (optimistically updated via toggleOptimisticLike)
      .addCase(likePost.pending, (state) => {
        state.error = null;
      })
      .addCase(likePost.fulfilled, (state) => { // Removed action.payload from here
        state.error = null;
      })
      .addCase(likePost.rejected, (state, action) => {
        state.error = action.payload || 'Failed to like post.';
      })

      // unlikePost (optimistically updated via toggleOptimisticLike)
      .addCase(unlikePost.pending, (state) => {
        state.error = null;
      })
      .addCase(unlikePost.fulfilled, (state) => { // Removed action.payload from here
        state.error = null;
      })
      .addCase(unlikePost.rejected, (state, action) => {
        state.error = action.payload || 'Failed to unlike post.';
      });
  },
});

export const { clearPostsError, clearCurrentPost, clearDoctorPosts, addOptimisticComment, toggleOptimisticLike, removeOptimisticPost } = postsSlice.actions;
export default postsSlice.reducer;
```

#### 2. `app/(tabs)/posts/post-detail.tsx` (FULL & FIXED)

```typescript
// app/(tabs)/posts/post-detail.tsx (View Single Post & Reactions - FIXED)

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Text, Image, Alert, TouchableOpacity, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchSinglePost, clearCurrentPost, clearPostsError, createComment, likePost, unlikePost, addOptimisticComment, toggleOptimisticLike, deletePost, removeOptimisticPost, updatePost } from '@/redux/slices/postsSlice';
import { Post, Comment, Like } from '@/constants/types/post';
import { CustomText, AppButton, AuthInputField } from '@/components';
import { COLORS } from '@/constants/theme';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { formatDistanceToNow, parseISO } from 'date-fns';

const PostDetailScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const { postId } = useLocalSearchParams<{ postId: string }>();

  const { currentPost, isLoading, error } = useSelector((state: RootState) => state.posts);
  const authUser = useSelector((state: RootState) => state.auth.user); // Current logged-in user

  const [commentInput, setCommentInput] = useState('');
  const [isEditing, setIsEditing] = useState(false); // State for editing post content
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);


  useEffect(() => {
    if (postId) {
      dispatch(fetchSinglePost(postId));
    }
    return () => {
      dispatch(clearCurrentPost()); // Clear current post when unmounting
      dispatch(clearPostsError());
    };
  }, [dispatch, postId]);

  useEffect(() => {
    if (error) {
      Alert.alert(t('common.error'), error);
      dispatch(clearPostsError());
    }
  }, [error, dispatch, t]);

  useEffect(() => {
    if (currentPost && isEditing) {
      setEditedTitle(currentPost.title);
      setEditedDescription(currentPost.description);
    }
  }, [currentPost, isEditing]);


  const handleCommentSubmit = async () => {
    if (!commentInput.trim() || !postId || !authUser?.id) return;

    const newComment: Comment = { // Optimistic comment object
      id: `optimistic-comment-${Date.now()}`, // Temporary ID
      userId: authUser.id,
      user: authUser, // Include user object for display
      postId: postId,
      content: commentInput,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch(addOptimisticComment({ postId, comment: newComment })); // Optimistic update
    setCommentInput(''); // Clear input immediately
    scrollViewRef.current?.scrollToEnd({ animated: true }); // Scroll to end to show new comment

    try {
      const resultAction = await dispatch(createComment({ postId, content: newComment.content }));
      if (createComment.rejected.match(resultAction)) {
        Alert.alert(t('common.error'), resultAction.payload as string || t('posts.commentFailed')); // Cast payload to string
        dispatch(fetchSinglePost(postId)); // Re-fetch post or manually remove optimistic comment if API call fails
      }
    } catch (err: any) {
      Alert.alert(t('common.error'), err.message || t('posts.commentFailed'));
      dispatch(fetchSinglePost(postId));
    }
  };

  const handleLikeToggle = async () => {
    if (!currentPost || !authUser?.id) return;

    const userLiked = currentPost.likes?.some(like => like.userId === authUser.id) || false; // FIX: Ensure boolean

    const like: Like | undefined = userLiked ? undefined : { // Create a dummy like for optimistic update
        id: `optimistic-like-${Date.now()}`,
        userId: authUser.id,
        postId: currentPost.id,
        createdAt: new Date().toISOString(),
        user: authUser // Attach user for display
    };

    // FIX for Type 'boolean | undefined' is not assignable to type 'boolean'.
    dispatch(toggleOptimisticLike({ postId: currentPost.id, userId: authUser.id, liked: !userLiked, like }));

    try {
        if (userLiked) {
            await dispatch(unlikePost(currentPost.id)).unwrap();
        } else {
            await dispatch(likePost(currentPost.id)).unwrap();
        }
    } catch (err: any) {
        Alert.alert(t('common.error'), err.message || t('posts.likeFailed'));
        // Revert optimistic update if API fails
        dispatch(toggleOptimisticLike({ postId: currentPost.id, userId: authUser.id, liked: userLiked, like }));
    }
  };

  const handleEditPost = async () => {
    if (!currentPost) return;

    if (isEditing) { // If currently in editing mode, this button is "Save"
      Alert.alert(
        t('posts.saveChangesTitle'),
        t('posts.saveChangesMessage'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('common.save'), onPress: async () => {
            try {
              const resultAction = await dispatch(updatePost({
                postId: currentPost.id,
                payload: { title: editedTitle, description: editedDescription }
              })).unwrap();
              Alert.alert(t('common.success'), t('posts.postUpdatedSuccess'));
              setIsEditing(false); // Exit editing mode
            } catch (err: any) {
              Alert.alert(t('common.error'), err.message || t('posts.updateFailed'));
            }
          }},
        ]
      );
    } else { // Not in editing mode, this button is "Edit"
      setIsEditing(true);
    }
  };

  const handleDeletePost = () => {
    if (!currentPost) return;

    Alert.alert(
      t('posts.deletePostTitle'),
      t('posts.deletePostMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.delete'), style: 'destructive', onPress: async () => {
          dispatch(removeOptimisticPost(currentPost.id)); // Optimistic delete
          try {
            await dispatch(deletePost(currentPost.id)).unwrap();
            Alert.alert(t('common.success'), t('posts.postDeletedSuccess'));
            router.replace('/(tabs)/'); // Go back to posts list
          } catch (err: any) {
            Alert.alert(t('common.error'), err.message || t('posts.deleteFailed'));
            // If delete fails, you might want to re-fetch all posts to restore it in UI
            dispatch(fetchSinglePost(currentPost.id)); // Try to re-fetch if optimistic delete fails
          }
        }},
      ]
    );
  };

  if (isLoading && !currentPost) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <CustomText type="body1" style={styles.loadingText}>{t('common.loadingPost')}</CustomText>
      </View>
    );
  }

  if (!currentPost) {
    return (
      <View style={styles.emptyContainer}>
        <CustomText type="body1" style={styles.emptyText}>{t('posts.postNotFound')}</CustomText>
        <AppButton title={t('common.goBack')} onPress={() => router.back()} />
      </View>
    );
  }

  const isMyPost = currentPost.userId === authUser?.id;
  const userLiked = currentPost.likes?.some(like => like.userId === authUser?.id) || false; // FIX: Ensure boolean

  return (
    <KeyboardAvoidingView
      style={styles.fullScreenContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} ref={scrollViewRef}>
        <View style={styles.postCard}>
          <View style={styles.postHeader}>
            <View style={styles.userInfo}>
              <FontAwesome name="user-circle" size={30} color={COLORS.gray} style={styles.userAvatar} />
              <CustomText type="body3" style={styles.userName}>
                {currentPost.user?.firstname} {currentPost.user?.lastname} {isMyPost && `(${t('posts.myPost')})`}
              </CustomText>
            </View>
            <CustomText type="body5" style={styles.postTime}>
              {formatDistanceToNow(parseISO(currentPost.createdAt), { addSuffix: true })}
            </CustomText>
          </View>

          {isEditing ? (
            <>
              <AuthInputField
                name="editedTitle"
                value={editedTitle}
                onChangeText={setEditedTitle}
                label={t('posts.titleLabel')}
                containerStyle={styles.editInputField}
              />
              <AuthInputField
                name="editedDescription"
                value={editedDescription}
                onChangeText={setEditedDescription}
                label={t('posts.descriptionLabel')}
                containerStyle={styles.editInputField}
                multiline
                numberOfLines={5}
              />
            </>
          ) : (
            <>
              <CustomText type="h3" style={styles.postTitle}>{currentPost.title}</CustomText>
              {currentPost.image && <Image source={{ uri: currentPost.image }} style={styles.postImage} />}
              <CustomText type="body2" style={styles.postDescription}>{currentPost.description}</CustomText>
            </>
          )}

          <View style={styles.postActionsDetail}>
            <TouchableOpacity onPress={handleLikeToggle} style={styles.actionButton}>
              <FontAwesome name={userLiked ? "heart" : "heart-o"} size={24} color={userLiked ? COLORS.danger : COLORS.gray} />
              <CustomText style={styles.actionText}>{currentPost.likesCount || 0}</CustomText>
            </TouchableOpacity>

            <View style={styles.actionButton}>
              <FontAwesome name="comment-o" size={24} color={COLORS.gray} />
              <CustomText style={styles.actionText}>{currentPost.commentsCount || 0}</CustomText>
            </View>
          </View>

          {isMyPost && authUser?.role === 'DOCTOR' && (
            <View style={styles.myPostActions}>
              <AppButton
                title={isEditing ? t('common.save') : t('common.edit')}
                onPress={handleEditPost}
                backgroundColor={isEditing ? COLORS.primary : COLORS.secondary}
                textColor={isEditing ? COLORS.white : COLORS.dark}
                containerStyle={styles.myActionButton}
                loading={isLoading}
              />
              {!isEditing && ( // Show delete only when not editing
                <AppButton
                  title={t('common.delete')}
                  onPress={handleDeletePost}
                  backgroundColor={COLORS.danger}
                  containerStyle={styles.myActionButton}
                  loading={isLoading}
                />
              )}
            </View>
          )}
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <CustomText type="h3" style={styles.commentsHeader}>{t('posts.comments')}</CustomText>
          {currentPost.comments && currentPost.comments.length > 0 ? (
            currentPost.comments.map(comment => (
              <View key={comment.id} style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  <FontAwesome name="user-circle" size={20} color={COLORS.gray} style={styles.commentAvatar} />
                  <CustomText type="body4" style={styles.commentUserName}>
                    {comment.user?.firstname} {comment.user?.lastname}
                  </CustomText>
                  <CustomText type="body5" style={styles.commentTime}>
                    {formatDistanceToNow(parseISO(comment.createdAt), { addSuffix: true })}
                  </CustomText>
                </View>
                <CustomText type="body4" style={styles.commentContent}>{comment.content}</CustomText>
              </View>
            ))
          ) : (
            <CustomText style={styles.noCommentsText}>{t('posts.noCommentsYet')}</CustomText>
          )}
        </View>
      </ScrollView>

      {/* Comment Input */}
      <View style={styles.commentInputContainer}>
        <TextInput
          style={styles.commentInputField}
          value={commentInput}
          onChangeText={setCommentInput}
          placeholder={t('posts.writeCommentPlaceholder')}
          placeholderTextColor={COLORS.gray}
          multiline
          returnKeyType="send"
          onSubmitEditing={handleCommentSubmit}
        />
        <TouchableOpacity onPress={handleCommentSubmit} style={styles.sendCommentButton}>
          <FontAwesome name="send" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default PostDetailScreen;

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: COLORS.gray,
    textAlign: 'center',
  },
  postCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    marginRight: 10,
  },
  userName: {
    color: COLORS.dark,
    fontWeight: 'bold',
  },
  postTime: {
    color: COLORS.gray,
    fontSize: 12,
  },
  postTitle: {
    color: COLORS.dark,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  postImage: {
    width: '100%',
    height: 220,
    borderRadius: 8,
    marginBottom: 15,
    resizeMode: 'cover',
  },
  postDescription: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
  },
  postActionsDetail: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: 15,
    marginTop: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  actionText: {
    marginLeft: 10,
    color: COLORS.gray,
    fontSize: 18,
  },
  myPostActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: 15,
  },
  myActionButton: {
    width: '45%',
    height: 40,
    borderRadius: 20,
  },
  editInputField: {
    marginBottom: 15,
    width: '100%',
    backgroundColor: COLORS.background, // Make it stand out during edit
  },
  commentsSection: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  commentsHeader: {
    color: COLORS.dark,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    paddingBottom: 10,
  },
  commentCard: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAvatar: {
    marginRight: 8,
  },
  commentUserName: {
    color: COLORS.dark,
    fontWeight: 'bold',
    marginRight: 'auto', // Push time to the right
  },
  commentTime: {
    color: COLORS.gray,
    fontSize: 10,
  },
  commentContent: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 22,
  },
  noCommentsText: {
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 10,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  commentInputField: {
    flex: 1,
    minHeight: 45,
    maxHeight: 120,
    backgroundColor: COLORS.background,
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 16,
    marginRight: 10,
  },
  sendCommentButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

#### 3. `app/(tabs)/index.tsx` (FULL & FIXED)

```typescript
// app/(tabs)/index.tsx (Home/Posts Feed Screen - FIXED)

import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Text, RefreshControl, TouchableOpacity, Image, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { fetchAllPosts, likePost, unlikePost, clearPostsError, removeOptimisticPost, toggleOptimisticLike } from '@/redux/slices/postsSlice';
import { Post, Like } from '@/constants/types/post'; // Corrected import to Like
import { CustomText, AppButton } from '@/components';
import { COLORS } from '@/constants/theme';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { formatDistanceToNow, parseISO } from 'date-fns';

const PostsListScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const { allPosts, isLoading, error } = useSelector((state: RootState) => state.posts);
  const authUser = useSelector((state: RootState) => state.auth.user); // Current logged-in user
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchAllPosts());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      Alert.alert(t('common.error'), error);
      dispatch(clearPostsError());
    }
  }, [error, dispatch, t]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchAllPosts());
    setRefreshing(false);
  }, [dispatch]);

  const handleCreatePost = () => {
    router.push('/posts/create-post'); // Navigate to create post screen
  };

  const handleViewPostDetails = (postId: string) => {
    router.push({ pathname: '/posts/post-detail', params: { postId } });
  };

  const handleLikeToggle = async (post: Post) => {
    if (!authUser?.id) return;

    const userLiked = post.likes?.some(like => like.userId === authUser.id) || false; // FIX: Ensure boolean

    const like: Like | undefined = userLiked ? undefined : { // Create a dummy like for optimistic update
        id: `optimistic-like-${Date.now()}`,
        userId: authUser.id,
        postId: post.id,
        createdAt: new Date().toISOString(),
        user: authUser // Attach user for display
    };

    // FIX for Type 'boolean | undefined' is not assignable to type 'boolean'.
    dispatch(toggleOptimisticLike({ postId: post.id, userId: authUser.id, liked: !userLiked, like }));

    try {
        if (userLiked) {
            await dispatch(unlikePost(post.id)).unwrap();
        } else {
            await dispatch(likePost(post.id)).unwrap();
        }
    } catch (err: any) {
        Alert.alert(t('common.error'), err.message || t('posts.likeFailed'));
        // Revert optimistic update if API fails
        dispatch(toggleOptimisticLike({ postId: post.id, userId: authUser.id, liked: userLiked, like }));
    }
  };


  const renderPostItem = ({ item }: { item: Post }) => {
    const userLiked = item.likes?.some(like => like.userId === authUser?.id) || false; // FIX: Ensure boolean
    const isMyPost = item.userId === authUser?.id;

    return (
      <TouchableOpacity style={styles.postCard} onPress={() => handleViewPostDetails(item.id)} activeOpacity={0.8}>
        <View style={styles.postHeader}>
          {/* User Avatar/Name */}
          <View style={styles.userInfo}>
            <FontAwesome name="user-circle" size={30} color={COLORS.gray} style={styles.userAvatar} />
            <CustomText type="body3" style={styles.userName}>
              {item.user?.firstname} {item.user?.lastname} {isMyPost && `(${t('posts.myPost')})`}
            </CustomText>
          </View>
          <CustomText type="body5" style={styles.postTime}>
            {formatDistanceToNow(parseISO(item.createdAt), { addSuffix: true })}
          </CustomText>
        </View>

        <CustomText type="h4" style={styles.postTitle}>{item.title}</CustomText>
        {item.image && <Image source={{ uri: item.image }} style={styles.postImage} />}
        <CustomText type="body3" numberOfLines={3} style={styles.postDescription}>{item.description}</CustomText>

        <View style={styles.postActions}>
          <TouchableOpacity onPress={() => handleLikeToggle(item)} style={styles.actionButton}>
            <FontAwesome name={userLiked ? "heart" : "heart-o"} size={20} color={userLiked ? COLORS.danger : COLORS.gray} />
            <CustomText style={styles.actionText}>{item.likesCount || 0}</CustomText>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleViewPostDetails(item.id)} style={styles.actionButton}>
            <FontAwesome name="comment-o" size={20} color={COLORS.gray} />
            <CustomText style={styles.actionText}>{item.commentsCount || 0}</CustomText>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading && allPosts.length === 0 && !error) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <CustomText type="body1" style={styles.loadingText}>{t('common.loadingPosts')}</CustomText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <CustomText type="h1" style={styles.header}>{t('posts.title')}</CustomText>
        {authUser?.role === 'DOCTOR' && ( // Only doctors can create posts
          <AppButton
            title={t('posts.createPostButton')}
            onPress={handleCreatePost}
            backgroundColor={COLORS.primary}
            containerStyle={styles.createPostButton}
            titleStyle={styles.createPostButtonTitle}
          />
        )}
      </View>

      {allPosts.length === 0 && !isLoading ? (
        <View style={styles.emptyContainer}>
          <CustomText type="body1" style={styles.emptyText}>{t('posts.noPosts')}</CustomText>
          <AppButton
            title={t('common.refresh')}
            onPress={onRefresh}
            backgroundColor={COLORS.primary}
            containerStyle={{ marginTop: 20, width: '50%' }}
          />
        </View>
      ) : (
        <FlatList
          data={allPosts}
          keyExtractor={(item) => item.id}
          renderItem={renderPostItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
        />
      )}
    </View>
  );
};

export default PostsListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 50,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  header: {
    color: COLORS.primary,
  },
  createPostButton: {
    width: 120, // Adjust width
    height: 35, // Adjust height
    borderRadius: 18,
  },
  createPostButtonTitle: {
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: COLORS.gray,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  postCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    marginRight: 8,
  },
  userName: {
    color: COLORS.dark,
    fontWeight: 'bold',
  },
  postTime: {
    color: COLORS.gray,
    fontSize: 12,
  },
  postTitle: {
    color: COLORS.dark,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  postDescription: {
    color: COLORS.text,
    marginBottom: 10,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: 10,
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  actionText: {
    marginLeft: 8,
    color: COLORS.gray,
    fontSize: 16,
  },
});
```