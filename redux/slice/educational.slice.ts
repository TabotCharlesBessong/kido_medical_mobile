import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { RootState } from '../store';

interface Comment {
  id: string;
  content: string;
  userId: string;
  userName: string;
  createdAt: string;
}

interface EducationalContent {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  likes: number;
  comments: Comment[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface EducationalState {
  posts: EducationalContent[];
  loading: boolean;
  error: string | null;
}

const initialState: EducationalState = {
  posts: [],
  loading: false,
  error: null,
};

export const fetchEducationalPosts = createAsyncThunk(
  'educational/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/educational-posts');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch educational posts');
    }
  }
);

export const createEducationalPost = createAsyncThunk(
  'educational/create',
  async (postData: Partial<EducationalContent>, { rejectWithValue }) => {
    try {
      const response = await api.post('/educational-posts', postData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create educational post');
    }
  }
);

export const likePost = createAsyncThunk(
  'educational/like',
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/educational-posts/${postId}/like`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to like post');
    }
  }
);

export const addComment = createAsyncThunk(
  'educational/comment',
  async ({ postId, content }: { postId: string; content: string }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/educational-posts/${postId}/comments`, { content });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add comment');
    }
  }
);

const educationalSlice = createSlice({
  name: 'educational',
  initialState,
  reducers: {
    clearPosts: (state) => {
      state.posts = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEducationalPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEducationalPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchEducationalPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createEducationalPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload);
      })
      .addCase(likePost.fulfilled, (state, action) => {
        const post = state.posts.find(p => p.id === action.payload.id);
        if (post) {
          post.likes = action.payload.likes;
        }
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const post = state.posts.find(p => p.id === action.payload.postId);
        if (post) {
          post.comments.push(action.payload.comment);
        }
      });
  },
});

export const { clearPosts } = educationalSlice.actions;
export const selectEducationalPosts = (state: RootState) => state.educational.posts;
export const selectEducationalLoading = (state: RootState) => state.educational.loading;
export const selectEducationalError = (state: RootState) => state.educational.error;

export default educationalSlice.reducer; 