import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import axios from "axios";
import { baseUrl } from "@/utils/constants";
import { Post } from "@/constants/types";
import { useTranslation } from "react-i18next";
import { COLORS } from "@/constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Toast } from "react-native-toast-notifications";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    firstname: string;
    lastname: string;
  };
}

const PostDetailScreen = () => {
  const { post: postString } = useLocalSearchParams();
  const post = JSON.parse(postString as string) as Post;
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [currentPost, setCurrentPost] = useState<Post>(post);
  const { t } = useTranslation();

  const fetchPost = async (id: string) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      const response = await axios.get(`${baseUrl}/posts/post/${id}`, {
        headers: { Authorization: `bearer ${token}` },
      });
      const postData = response.data.data.post;
      setCurrentPost(postData);
      setLoading(false);
    } catch (error) {
      setErrorMessage("Failed to fetch post.");
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      const response = await axios.post(
        `${baseUrl}/posts/like/${currentPost.id}`,
        {},
        {
          headers: { Authorization: `bearer ${token}` },
        }
      );
      if (response.data.success) {
        fetchPost(currentPost.id);
        Toast.show(t("post.likeSuccess"), {
          type: "success",
          placement: "top",
          duration: 2000,
        });
      }
    } catch (error) {
      Toast.show(t("post.likeError"), {
        type: "error",
        placement: "top",
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      const response = await axios.post(
        `${baseUrl}/posts/comment/${currentPost.id}`,
        { content: comment },
        {
          headers: { Authorization: `bearer ${token}` },
        }
      );
      if (response.data.success) {
        setComment("");
        fetchPost(currentPost.id);
        Toast.show(t("post.commentSuccess"), {
          type: "success",
          placement: "top",
          duration: 2000,
        });
      }
    } catch (error) {
      Toast.show(t("post.commentError"), {
        type: "error",
        placement: "top",
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentPost.id) {
      fetchPost(currentPost.id);
    }
  }, [currentPost.id]);

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentContainer}>
      <View style={styles.commentHeader}>
        <Text style={styles.commentUser}>
          {item.user?.firstname} {item.user?.lastname}
        </Text>
        <Text style={styles.commentDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.commentContent}>{item.content}</Text>
    </View>
  );

  if (loading)
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );

  if (errorMessage)
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{errorMessage}</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );

  if (!currentPost)
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Post not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <AntDesign name="arrowleft" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("post.details")}</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.postContainer}>
            {currentPost.image && (
              <Image source={{ uri: currentPost.image }} style={styles.postImage} />
            )}
            <Text style={styles.postTitle}>{currentPost.title}</Text>
            <Text style={styles.postDescription}>{currentPost.description}</Text>

            <View style={styles.postInfo}>
              <TouchableOpacity
                style={styles.infoItem}
                onPress={handleLike}
                disabled={loading}
              >
                <FontAwesome
                  name="heart"
                  size={18}
                  color={currentPost.likes?.length ? COLORS.primary : "gray"}
                />
                <Text style={styles.infoText}>
                  {currentPost.likes?.length || 0} {t("post.likes")}
                </Text>
              </TouchableOpacity>
              <View style={styles.infoItem}>
                <FontAwesome name="comment" size={18} color={COLORS.primary} />
                <Text style={styles.infoText}>
                  {currentPost.comments?.length || 0} {t("post.comments")}
                </Text>
              </View>
            </View>

            <View style={styles.commentsSection}>
              <Text style={styles.commentsTitle}>{t("post.comments")}</Text>
              <FlatList
                data={currentPost.comments}
                renderItem={renderComment}
                keyExtractor={(item) => `comment-${item.id}`}
                scrollEnabled={false}
              />
            </View>
          </View>

          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder={t("post.writeComment")}
              value={comment}
              onChangeText={setComment}
              multiline
            />
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!comment.trim() || loading) && styles.submitButtonDisabled,
              ]}
              onPress={handleComment}
              disabled={!comment.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {t("post.submit")}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.danger,
    marginBottom: 16,
    textAlign: "center",
  },
  backButton: {
    color: COLORS.primary,
    fontSize: 16,
    padding: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  postContainer: {
    padding: 16,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  postTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  postDescription: {
    fontSize: 16,
    marginBottom: 16,
    color: "#333",
  },
  postInfo: {
    flexDirection: "row",
    marginTop: 8,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  infoText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#666",
  },
  commentsSection: {
    marginTop: 16,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  commentContainer: {
    backgroundColor: "#f8f8f8",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  commentUser: {
    fontWeight: "bold",
    fontSize: 14,
  },
  commentDate: {
    fontSize: 12,
    color: "#666",
  },
  commentContent: {
    fontSize: 14,
    color: "#333",
  },
  commentInputContainer: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "white",
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc",
  },
  submitButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default PostDetailScreen;
