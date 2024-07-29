import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { COLORS } from "@/constants/theme";
import { CustomText } from "@/components";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { IUser } from "@/constants/types";
import { baseUrl } from "@/utils/variables";

interface Message {
  id: string;
  text: string;
  time: string;
  fromSender: boolean;
}

const ConversationScreen: React.FC = () => {
  const router = useRouter();
  const { receiverId } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const loggedInUser = await AsyncStorage.getItem("userData");
        const loggedInUserData = loggedInUser ? JSON.parse(loggedInUser) : null;

        if (!token || !loggedInUserData)
          throw new Error("Authentication error");

        setCurrentUser(loggedInUserData);

        const response = await axios.get(
          `${baseUrl}/message/conversation/${loggedInUserData.id}/${receiverId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const fetchedMessages = response.data.data.messages;
        setMessages(
          fetchedMessages.map((msg:any) => {
            const messageTime = new Date(msg.createdAt);
            const formattedTime = messageTime.toLocaleString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            });

            return {
              id: msg.id,
              text: msg.content,
              time: formattedTime,
              fromSender: msg.senderId === loggedInUserData.id,
            };
          })
        );
      } catch (error) {
        console.error("Error fetching conversation:", error);
      }
    };

    fetchConversation();
  }, [receiverId]);

  const handleSendMessage = async () => {
    if (inputMessage.trim()) {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const loggedInUser = await AsyncStorage.getItem("userData");
        const loggedInUserData = loggedInUser ? JSON.parse(loggedInUser) : null;

        if (!token || !loggedInUserData)
          throw new Error("Authentication error");

        await axios.post(
          `${baseUrl}/message/create`,
          {
            receiverId: receiverId as string,
            content: inputMessage,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: Date.now().toString(),
            text: inputMessage,
            time: new Date().toLocaleTimeString(),
            fromSender: true,
          },
        ]);
        setInputMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Image
          source={{ uri: "https://via.placeholder.com/50" }}
          style={styles.profilePic}
        />
        <CustomText type="h4">User Name</CustomText>
      </View>

      <ScrollView style={styles.messagesContainer}>
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageCard,
              message.fromSender
                ? styles.senderMessage
                : styles.receiverMessage,
            ]}
          >
            <CustomText type="body2">{message.text}</CustomText>
            <CustomText type="body4">{message.time}</CustomText>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputMessage}
          onChangeText={setInputMessage}
          placeholder="Type a message"
        />
        <TouchableOpacity onPress={handleSendMessage}>
          <MaterialIcons name="send" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 10,
  },
  headerText: {
    marginLeft: 10,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageCard: {
    marginVertical: 10,
    padding: 10,
    borderRadius: 8,
  },
  senderMessage: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.primary,
  },
  receiverMessage: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.gray,
  },
  messageTime: {
    alignSelf: "flex-end",
    marginTop: 5,
    fontSize: 12,
    color: COLORS.black,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: COLORS.gray,
    padding: 10,
  },
  input: {
    flex: 1,
    marginRight: 10,
    padding: 10,
    backgroundColor: COLORS.gray,
    borderRadius: 20,
  },
});

export default ConversationScreen;
