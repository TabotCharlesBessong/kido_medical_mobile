import { CreateMessageApiResponse, CreateMessagePayload, MarkMessageReadApiResponse, Message, MessagesApiResponse } from "@/constants/types/message";
import axiosInstance from "@/utils/api/axiosInstance";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";


interface MessageState {
  currentConversation: Message[]; // Messages in the currently viewed chat
  allConversations: {
    [chatPartnerId: string]: Message[]; // Stores messages grouped by chat partner ID
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: MessageState = {
  currentConversation: [],
  allConversations: {}, // Represents the chat list overview
  isLoading: false,
  error: null,
};

// Async Thunk for sending a message
export const sendMessage = createAsyncThunk<
  CreateMessageApiResponse,
  CreateMessagePayload,
  { rejectValue: string }
>("message/sendMessage", async (payload, { rejectWithValue, getState }) => {
  try {
    // Backend: senderId comes from req.user.id. Frontend only sends receiverId and content.
    const response = await axiosInstance.post<CreateMessageApiResponse>(
      "/message/create",
      {
        receiverId: payload.receiverId,
        content: payload.content,
      }
    );
    const data = response.data;

    if (data.success && data.data?.message) {
      return data;
    } else {
      return rejectWithValue(data.message || "Failed to send message.");
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || error.message || "Network Error";
    return rejectWithValue(errorMessage);
  }
});

// Async Thunk for getting a specific conversation between two users
export const getConversation = createAsyncThunk<
  MessagesApiResponse,
  { senderId: string; receiverId: string },
  { rejectValue: string }
>("message/getConversation", async (params, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get<MessagesApiResponse>(
      `/message/conversation/${params.senderId}/${params.receiverId}`
    );
    const data = response.data;

    if (data.success && Array.isArray(data.data?.messages)) {
      return data;
    } else {
      return rejectWithValue(
        data.message || "Failed to retrieve conversation."
      );
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || error.message || "Network Error";
    return rejectWithValue(errorMessage);
  }
});

// Async Thunk for getting all messages/conversations for the logged-in user
export const getAllMessagesByUserId = createAsyncThunk<
  MessagesApiResponse,
  string,
  { rejectValue: string }
>("message/getAllMessagesByUserId", async (userId, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get<MessagesApiResponse>(
      `/message/${userId}`
    );
    const data = response.data;

    if (data.success && Array.isArray(data.data?.messages)) {
      return data;
    } else {
      return rejectWithValue(
        data.message || "Failed to retrieve all messages."
      );
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || error.message || "Network Error";
    return rejectWithValue(errorMessage);
  }
});

// Async Thunk for marking a message as read
export const markMessageAsRead = createAsyncThunk<
  MarkMessageReadApiResponse,
  string,
  { rejectValue: string }
>("message/markMessageAsRead", async (messageId, { rejectWithValue }) => {
  try {
    // Backend expects PUT to /api/message/:messageId/read
    const response = await axiosInstance.put<MarkMessageReadApiResponse>(
      `/message/${messageId}/read`
    );
    // Backend returns 204 No Content for success, so response.data might be empty
    if (response.status === 204) {
      return { success: true, message: "Message marked as read." };
    } else {
      return rejectWithValue("Failed to mark message as read.");
    }
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || error.message || "Network Error";
    return rejectWithValue(errorMessage);
  }
});

const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    clearMessageError: (state) => {
      state.error = null;
    },
    // Action to add a new message to the current conversation (optimistic update)
    addMessageToCurrentConversation: (
      state,
      action: PayloadAction<Message>
    ) => {
      state.currentConversation.push(action.payload);
    },
    // Action to set the current conversation (when navigating to a chat)
    setCurrentConversation: (state, action: PayloadAction<Message[]>) => {
      state.currentConversation = action.payload;
    },
    // Action to clear the current conversation (when leaving a chat)
    clearCurrentConversation: (state) => {
      state.currentConversation = [];
    },
    // Action to update a message's read status in the current conversation
    updateMessageReadStatusInConversation: (
      state,
      action: PayloadAction<string>
    ) => {
      const messageId = action.payload;
      const messageIndex = state.currentConversation.findIndex(
        (msg:any) => msg.id === messageId
      );
      if (messageIndex !== -1) {
        state.currentConversation[messageIndex].isRead = true;
      }
    },
    // Action to update message's read status across all conversations (less common, but useful)
    updateMessageReadStatusInAllConversations: (
      state,
      action: PayloadAction<{
        messageId: string;
        conversationPartnerId: string;
      }>
    ) => {
      const { messageId, conversationPartnerId } = action.payload;
      const conversation = state.allConversations[conversationPartnerId];
      if (conversation) {
        const messageIndex = conversation.findIndex(
          (msg:any) => msg.id === messageId
        );
        if (messageIndex !== -1) {
          conversation[messageIndex].isRead = true;
        }
      }
    },
    // Action to update the `allConversations` overview
    setAllConversations: (
      state,
      action: PayloadAction<{ [chatPartnerId: string]: Message[] }>
    ) => {
      state.allConversations = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // sendMessage
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        // The message is optimistically added, so no need to push again here.
        // You might want to update the last message in `allConversations` here if you had that structure.
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to send message.";
      })

      // getConversation
      .addCase(getConversation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.currentConversation = [];
      })
      .addCase(getConversation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentConversation = action.payload.data?.messages || [];
        state.error = null;
      })
      .addCase(getConversation.rejected, (state, action) => {
        state.isLoading = false;
        state.currentConversation = [];
        state.error = action.payload || "Failed to retrieve conversation.";
      })

      // getAllMessagesByUserId
      .addCase(getAllMessagesByUserId.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllMessagesByUserId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        // Group messages by partner for the overview. This is a common pattern.
        const groupedMessages: { [chatPartnerId: string]: Message[] } = {};
        const userId = action.meta.arg; // The userId passed to the thunk

        action.payload.data?.messages?.forEach((msg:Message) => {
          const partnerId =
            msg.senderId === userId ? msg.receiverId : msg.senderId;
          if (!groupedMessages[partnerId]) {
            groupedMessages[partnerId] = [];
          }
          groupedMessages[partnerId].push(msg);
        });

        // Sort each conversation by timestamp
        for (const partnerId in groupedMessages) {
          groupedMessages[partnerId].sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        }
        state.allConversations = groupedMessages;
      })
      .addCase(getAllMessagesByUserId.rejected, (state, action) => {
        state.isLoading = false;
        state.allConversations = {};
        state.error = action.payload || "Failed to retrieve all messages.";
      })

      // markMessageAsRead
      .addCase(markMessageAsRead.pending, (state) => {
        // Optimistic update should happen in component
      })
      .addCase(markMessageAsRead.fulfilled, (state, action) => {
        // No state change needed here, optimistic update already handled
      })
      .addCase(markMessageAsRead.rejected, (state, action) => {
        // Handle rollback of optimistic update if needed, or re-fetch
        state.error = action.payload || "Failed to mark message as read.";
      });
  },
});

export const {
  clearMessageError,
  addMessageToCurrentConversation,
  setCurrentConversation,
  clearCurrentConversation,
  updateMessageReadStatusInConversation,
  updateMessageReadStatusInAllConversations,
  setAllConversations, // If you decide to pre-process conversations
} = messageSlice.actions;
export default messageSlice.reducer;
