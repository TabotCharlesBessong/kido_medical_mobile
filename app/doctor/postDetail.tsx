import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View, FlatList, ActivityIndicator } from "react-native";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import axios from "axios";
import { baseUrl } from "@/utils/constants";
import { Post } from "@/constants/types";
import { useTranslation } from "react-i18next";
import { COLORS } from "@/constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";

const PostDetailScreen = () => {
  const params = useLocalSearchParams();
  const postId = params.postId;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const router = useRouter();
  const { t } = useTranslation();

  const fetchPost = async (id: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseUrl}/posts/post/${id}`);
      setPost(response.data.data.post);
      setLoading(false);
    } catch (error) {
      setErrorMessage("Failed to fetch post.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId) {
      fetchPost(postId as string);
    }
  }, [postId]);

  if (loading) return (
    <SafeAreaView style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </SafeAreaView>
  );

  if (errorMessage) return (
    <SafeAreaView style={styles.errorContainer}>
      <Text style={styles.errorText}>{errorMessage}</Text>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.backButton}>Go Back</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  if (!post) return (
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
        <Text style={styles.headerTitle}>Post Details</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <View style={styles.postContainer}>
        {post.image && (
          <Image source={{ uri: post.image }} style={styles.postImage} />
        )}
        <Text style={styles.postTitle}>{post.title}</Text>
        <Text style={styles.postDescription}>{post.description}</Text>
        
        <View style={styles.postInfo}>
          <View style={styles.infoItem}>
            <FontAwesome name="heart" size={18} color={COLORS.primary} />
            <Text style={styles.infoText}>{post.likes?.length || 0} likes</Text>
          </View>
          <View style={styles.infoItem}>
            <FontAwesome name="comment" size={18} color={COLORS.primary} />
            <Text style={styles.infoText}>{post.comments?.length || 0} comments</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "white",
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "white",
    padding: 16,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.danger,
    marginBottom: 16,
    textAlign: 'center',
  },
  backButton: {
    color: COLORS.primary,
    fontSize: 16,
    padding: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  postContainer: {
    flex: 1,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  postTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  postDescription: {
    fontSize: 16,
    marginBottom: 16,
    color: '#333',
  },
  postInfo: {
    flexDirection: 'row',
    marginTop: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  infoText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
  },
});

export default PostDetailScreen;
