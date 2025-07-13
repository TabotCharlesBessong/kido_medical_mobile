import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import {
  getAllMessagesByUserId,
  clearMessageError,
} from "@/redux/slice/messageSlice";
import { CustomText, AppButton } from "@/components";
import { COLORS } from "@/utils/constants"
import { useRouter } from "expo-router";
import { formatDistanceToNow, parseISO } from "date-fns"; // `npm install date-fns`
import { Message } from "@/constants/types/message";

// Helper to group messages into conversations and find the last message
interface ConversationSummary {
  chatPartnerId: string;
  chatPartnerName: string;
  chatPartnerEmail: string; // Assuming email is available on User
  lastMessage: Message | null;
  unreadCount: number;
}

const MessagesListScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();

  const { allConversations, isLoading, error } = useSelector(
    (state: RootState) => state.message
  );
  const authUser = useSelector((state: RootState) => state.auth.user); // Current logged-in user

  const [refreshing, setRefreshing] = useState(false);
  const [conversationSummaries, setConversationSummaries] = useState<
    ConversationSummary[]
  >([]);

  const fetchConversations = useCallback(async () => {
    if (authUser?.id) {
      const result = await dispatch(getAllMessagesByUserId(authUser.id));
      if (getAllMessagesByUserId.fulfilled.match(result)) {
        // Redux state `allConversations` is already grouped.
        // We need to create a displayable list of summaries.
        const summaries: ConversationSummary[] = [];
        for (const partnerId in result.payload.data?.messages) {
          // @ts-ignore
          const messages = result.payload.data?.messages[partnerId];
          if (messages && messages.length > 0) {
            // Assuming messages are sorted by date in the reducer
            const lastMessage = messages[messages.length - 1];
            const chatPartner =
              lastMessage.senderId === authUser.id
                ? lastMessage.receiver
                : lastMessage.sender;
            const unreadCount = messages.filter(
              (msg:any) => !msg.isRead && msg.receiverId === authUser.id
            ).length;

            summaries.push({
              chatPartnerId: partnerId,
              chatPartnerName: `${chatPartner?.firstname || "Unknown"} ${
                chatPartner?.lastname || "User"
              }`,
              chatPartnerEmail: chatPartner?.email || "",
              lastMessage: lastMessage,
              unreadCount: unreadCount,
            });
          }
        }
        // Sort conversations by last message time
        summaries.sort((a, b) => {
          if (!a.lastMessage || !b.lastMessage) return 0;
          return (
            parseISO(b.lastMessage.createdAt).getTime() -
            parseISO(a.lastMessage.createdAt).getTime()
          );
        });
        setConversationSummaries(summaries);
      }
    }
  }, [dispatch, authUser]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (error) {
      Alert.alert(t("common.error"), error);
      dispatch(clearMessageError());
    }
  }, [error, dispatch, t]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchConversations();
    setRefreshing(false);
  };

  const handleSelectConversation = (partnerId: string, partnerName: string) => {
    router.push({
      // @ts-ignore
      pathname: `/messages/chat/[chatPartnerId]`,
      params: { chatPartnerId: partnerId, chatPartnerName: partnerName },
    });
  };

  const renderConversationSummary = ({
    item,
  }: {
    item: ConversationSummary;
  }) => (
    <TouchableOpacity
      style={styles.conversationCard}
      onPress={() =>
        handleSelectConversation(item.chatPartnerId, item.chatPartnerName)
      }
    >
      <View style={styles.cardHeaderContent}>
        <CustomText type="h4" style={styles.cardHeader}>
          {item.chatPartnerName}
        </CustomText>
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unreadCount}</Text>
          </View>
        )}
      </View>
      {item.lastMessage && (
        <>
          <CustomText
            type="body4"
            // numberOfLines={1}
            style={styles.lastMessageText}
          >
            {item.lastMessage.senderId === authUser?.id ? "You: " : ""}
            {item.lastMessage.content}
          </CustomText>
          <CustomText type="body5" style={styles.messageTime}>
            {formatDistanceToNow(parseISO(item.lastMessage.createdAt), {
              addSuffix: true,
            })}
          </CustomText>
        </>
      )}
    </TouchableOpacity>
  );

  if (isLoading && conversationSummaries.length === 0 && !error) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <CustomText type="body1" style={styles.loadingText}>
          {t("messages.loadingConversations")}
        </CustomText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomText type="h1" style={styles.header}>
        {t("messages.title")}
      </CustomText>
      {conversationSummaries.length === 0 && !isLoading ? (
        <View style={styles.emptyContainer}>
          <CustomText type="body1" style={styles.emptyText}>
            {t("messages.noConversations")}
          </CustomText>
          <AppButton
            title={t("common.refresh")}
            onPress={onRefresh}
            backgroundColor={COLORS.primary}
            containerStyle={{ marginTop: 20, width: "50%" }}
          />
        </View>
      ) : (
        <FlatList
          data={conversationSummaries}
          keyExtractor={(item) => item.chatPartnerId}
          renderItem={renderConversationSummary}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
            />
          }
        />
      )}
    </View>
  );
};

export default MessagesListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.text,
  },
  header: {
    marginBottom: 20,
    textAlign: "center",
    color: COLORS.primary,
  },
  listContent: {
    paddingBottom: 20,
  },
  conversationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeaderContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  cardHeader: {
    color: COLORS.dark,
    flexShrink: 1, // Allow text to shrink
  },
  unreadBadge: {
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 10,
    minWidth: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  lastMessageText: {
    color: COLORS.gray,
    fontSize: 14,
    marginBottom: 5,
  },
  messageTime: {
    fontSize: 12,
    color: COLORS.text,
    textAlign: "right",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: COLORS.gray,
    textAlign: "center",
  },
});
