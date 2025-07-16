import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import {
  getConversation,
  sendMessage,
  clearMessageError,
  addMessageToCurrentConversation,
  updateMessageReadStatusInConversation,
  markMessageAsRead,
  clearCurrentConversation,
} from "@/redux/slice/messageSlice";
import { CustomText, AppButton, AuthInputField } from "@/components"; // AuthInputField for message input
import { COLORS } from "@/utils/constants";
import { FontAwesome } from "@expo/vector-icons"; // For send icon
import { format, parseISO } from "date-fns";
import { Message } from "@/constants/types/message";

const ChatScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();
  const { chatPartnerId, chatPartnerName } = useLocalSearchParams<{
    chatPartnerId: string;
    chatPartnerName: string;
  }>();

  const { currentConversation, isLoading, error } = useSelector(
    (state: RootState) => state.message
  );
  const authUser = useSelector((state: RootState) => state.auth.user); // Logged-in user

  const [messageInput, setMessageInput] = useState("");
  const flatListRef = useRef<FlatList<Message>>(null);

  const senderId = authUser?.id;
  const receiverId = chatPartnerId;

  const fetchAndMarkRead = useCallback(async () => {
    if (senderId && receiverId) {
      const result = await dispatch(getConversation({ senderId, receiverId }));
      if (getConversation.fulfilled.match(result)) {
        // Mark all unread messages in this conversation as read
        const unreadMessages = result.payload.data?.messages?.filter(
          (msg) => !msg.isRead && msg.receiverId === senderId
        );
        if (unreadMessages && unreadMessages.length > 0) {
          // Dispatch individual mark as read for each unread message
          for (const msg of unreadMessages) {
            dispatch(markMessageAsRead(msg.id));
            dispatch(updateMessageReadStatusInConversation(msg.id)); // Optimistic update
          }
        }
      }
    }
  }, [dispatch, senderId, receiverId]);

  useEffect(() => {
    fetchAndMarkRead();
    // Cleanup: Clear conversation when leaving screen
    return () => {
      dispatch(clearCurrentConversation());
      dispatch(clearMessageError());
    };
  }, [fetchAndMarkRead, dispatch]);

  useEffect(() => {
    if (error) {
      Alert.alert(t("common.error"), error);
      dispatch(clearMessageError());
    }
  }, [error, dispatch, t]);

  useEffect(() => {
    // Scroll to bottom on new messages
    if (currentConversation.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [currentConversation]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !receiverId || !senderId) return;

    const newMessage: Message = {
      // Optimistic message object
      id: `temp-${Date.now()}`, // Temporary ID
      senderId: senderId,
      receiverId: receiverId,
      content: messageInput,
      isRead: false, // Will be read by sender, but remote might not be instant
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sender: authUser || undefined, // Include sender object for display
      receiver:
        currentConversation.find((msg) => msg.senderId === receiverId)
          ?.sender || undefined, // Try to get receiver object
    };

    dispatch(addMessageToCurrentConversation(newMessage)); // Optimistic update
    setMessageInput(""); // Clear input immediately

    const resultAction = await dispatch(
      sendMessage({ receiverId, content: newMessage.content })
    );

    if (sendMessage.rejected.match(resultAction)) {
      Alert.alert(
        t("common.error"),
        resultAction.payload || t("messages.failedToSend")
      );
      // Rollback optimistic update if needed, or re-fetch messages
      dispatch(getConversation({ senderId, receiverId })); // Re-fetch to ensure consistency
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.senderId === authUser?.id;
    return (
      <View
        style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessage : styles.otherMessage,
        ]}
      >
        <CustomText
          type="body4"
          style={isMyMessage ? styles.myMessageText : styles.otherMessageText}
        >
          {item.content}
        </CustomText>
        <CustomText type="body2"
          style={isMyMessage ? styles.myMessageTime : styles.otherMessageTime}
        >
          {format(parseISO(item.createdAt), "p")}
          {isMyMessage && item.isRead && (
            <FontAwesome
              name="check-circle"
              size={12}
              color="green"
              style={styles.readIcon}
            />
          )}
        </CustomText>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: chatPartnerName || t("messages.privateChat"),
          // @ts-ignore
          headerBackTitleVisible: false,
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { color: COLORS.white },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <FontAwesome name="chevron-left" size={20} color={COLORS.white} />
            </TouchableOpacity>
          ),
        }}
      />
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0} // Adjust based on your header/tab bar height
      >
        {isLoading && currentConversation.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <CustomText type="body2" style={styles.loadingText}>
              Loading messages...
            </CustomText>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={currentConversation}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messageListContent}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            } // Auto-scroll to bottom
            onLayout={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            } // Auto-scroll on layout change
          />
        )}

        {error && <Text style={styles.globalErrorText}>{error}</Text>}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.messageInputField}
            value={messageInput}
            onChangeText={setMessageInput}
            placeholder={t("messages.typeMessagePlaceholder")}
            placeholderTextColor={COLORS.gray}
            multiline
          />
          <TouchableOpacity
            onPress={handleSendMessage}
            style={styles.sendButton}
          >
            <FontAwesome name="send" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messageListContent: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 10,
    borderRadius: 15,
    marginBottom: 8,
    flexDirection: "column",
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 2, // Slight corner adjustment for visual appeal
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.lightGray,
    borderBottomLeftRadius: 2,
  },
  myMessageText: {
    color: COLORS.white,
    fontSize: 16,
  },
  otherMessageText: {
    color: COLORS.dark,
    fontSize: 16,
  },
  myMessageTime: {
    color: COLORS.white,
    fontSize: 10,
    marginTop: 5,
    alignSelf: "flex-end",
  },
  otherMessageTime: {
    color: COLORS.gray,
    fontSize: 10,
    marginTop: 5,
    alignSelf: "flex-start",
  },
  readIcon: {
    marginLeft: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  messageInputField: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120, // Limit height for multiline input
    backgroundColor: COLORS.background,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingTop: 10, // Adjust for multiline vertical alignment
    paddingBottom: 10,
    fontSize: 16,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.text,
  },
  globalErrorText: {
    color: COLORS.danger,
    textAlign: "center",
    paddingVertical: 10,
  },
  backButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
});
