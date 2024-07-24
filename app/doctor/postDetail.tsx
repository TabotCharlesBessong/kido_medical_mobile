// import { useRouter, useSearchParams } from "expo-router";
// import React, { useEffect, useState } from "react";
// import { Image, StyleSheet, Text, TouchableOpacity, View, FlatList } from "react-native";
// import { AntDesign, FontAwesome } from "@expo/vector-icons";
// import axios from "axios";
// import { baseUrl } from "@/utils/variables";
// import { Post } from "@/constants/types";
// import { useTranslation } from "react-i18next";

// const PostDetailScreen = () => {
//   const { postId } = useSearchParams();
//   const [post, setPost] = useState<Post | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [errorMessage, setErrorMessage] = useState<string>("");
//   const { t } = useTranslation();

//   const fetchPost = async (id: string) => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`${baseUrl}/posts/post/${id}`);
//       setPost(response.data.data.post);
//       setLoading(false);
//     } catch (error) {
//       setErrorMessage("Failed to fetch post.");
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (postId) {
//       fetchPost(postId as string);
//     }
//   }, [postId]);

//   if (loading) return <Text>Loading
