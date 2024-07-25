import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS } from "@/constants/theme";
import { CustomText } from "@/components";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { baseUrl } from "@/utils/variables";

interface User {
  id: string;
  username: string;
}

const ChatScreen: React.FC = () => {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) throw new Error("No token found");

        const response = await axios.get(
          `${baseUrl}/user/users/all`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const usersData = response.data.data.users;
        const loggedInUser = await AsyncStorage.getItem("loggedInUser");
        const loggedInUserData = loggedInUser ? JSON.parse(loggedInUser) : null;

        setUsers(
          usersData.filter((user: User) => user.id !== loggedInUserData?.id)
        );
        setCurrentUser(loggedInUserData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleConversationSelect = (receiverId: string) => {
    router.push(`/chat/conversation?receiverId=${receiverId}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <CustomText type="h3">Chats</CustomText>
        {users.map((user) => (
          <TouchableOpacity
            key={user.id}
            style={styles.conversationItem}
            onPress={() => handleConversationSelect(user.id)}
          >
            <View style={styles.avatar}>
              <CustomText type="h4">{user.username.charAt(0)}</CustomText>
            </View>
            <View style={styles.conversationInfo}>
              <CustomText type="body1">{user.username}</CustomText>
              {/* Add last message if available */}
              <CustomText type="body2">Last message preview</CustomText>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollView: {
    paddingHorizontal: 16,
  },
  conversationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  conversationInfo: {
    flex: 1,
  },
});

export default ChatScreen;
