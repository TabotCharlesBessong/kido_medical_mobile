/* eslint-disable */

import { createSlice } from "@reduxjs/toolkit";

import { PostThunk } from "../thunks/posts.thunk";
import { ApiRequestStatus, StoredErrorResponseType } from "@/types/api.types";
import { CommentsType } from "@/types/login.type";

type InitialStateTypes = {
  posts: CommentsType[];
  status: ApiRequestStatus;
  message: string;
};

const initialState: InitialStateTypes = {
  posts: [] as CommentsType[],
  status: ApiRequestStatus.IDLE,
  message: "",
};

const postSlice = createSlice({
  name: "postSlice",
  initialState: initialState,
  reducers: {
    resetPostState: (state) => {
      state.status = ApiRequestStatus.IDLE;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(PostThunk.pending, (state, _action) => {
        (state.status = ApiRequestStatus.PENDING),
          (state.posts = [] as CommentsType[]);
      })
      .addCase(PostThunk.fulfilled, (state, action) => {
        (state.status = ApiRequestStatus.FULFILLED),
          (state.posts = action.payload)
      })
      .addCase(PostThunk.rejected, (state, action) => {
        state.status = ApiRequestStatus.REJECTED;
        state.posts = [] as CommentsType[];
        state.message = (action.payload as StoredErrorResponseType).message;
      });
  },
});

export const { resetPostState } = postSlice.actions;
export default postSlice.reducer;
