// import {
//   CustomText,
//   DoctorCard,
//   LoadingOverlay,
//   Notificationcard,
//   PharmacieCard,
// } from "@/components";
// import { COLORS } from "@/constants/theme";
// import { AntDesign, FontAwesome } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import { StatusBar } from "expo-status-bar";
// import React, { useEffect, useState } from "react";
// import {
//   FlatList,
//   Image,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import doctorsData from "../../constants/data/doctorData";
// import generateRandomPharmaciesData from "@/constants/data/pharmacieData";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Doctor, Post } from "@/constants/types";
// import { generatePosts } from "@/constants/data/posts";
// import { useTranslation } from "react-i18next";
// import axios from "axios";
// import { baseUrl } from "@/utils/constants";

// const index = () => {
//   const router = useRouter();
//   const doctorData = doctorsData();
//   const { t, i18n } = useTranslation();
//   const pharmacyData = generateRandomPharmaciesData();
//   const [doctors, setDoctors] = useState<Doctor[]>([]);
//   // console.log(pharmacyData);
//   const [posts, setPosts] = useState<Post[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [errorMessage, setErrorMessage] = useState<string>("");
//   // console.log(posts)

//   const getData = async () => {
//     const token = await AsyncStorage.getItem("userToken");
//     const data = await AsyncStorage.getItem("userData");

//     // const keys = await AsyncStorage.getAllKeys();
//     // const result = await AsyncStorage.multiGet(keys);
//     console.log({ token, data });
//   };

//   const fetchDoctors = async () => {
//     try {
//       setLoading(true);
//       const token = await AsyncStorage.getItem("userToken");
//       const datas = await AsyncStorage.getItem("userData");
//       console.log(datas);
//       const response = await axios.get(`${baseUrl}/doctor/doctor/all`, {
//         headers: { Authorization: `bearer ${token}` },
//       });
//       // Check the structure of the response data
//       const fetchedDoctors = response.data.data.doctors.map((doctor: any) => ({
//         ...doctor,
//         users: {
//           firstname: doctor["users.firstname"],
//           lastname: doctor["users.lastname"],
//           username: doctor["users.username"],
//         },
//       }));
//       setDoctors(fetchedDoctors);
//       setLoading(false);
//     } catch (error) {
//       setErrorMessage("Failed to fetch doctors.");
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchDoctors();
//     // getData()
//   }, []);
//   // console.log(doctors)
//   // console.log(errorMessage)

//   const renderDoctor = ({ item }: { item: Doctor }) => (
//     <TouchableOpacity
//       onPress={() =>
//         router.push({
//           pathname: "/doctor/profile",
//           params: { doctor: JSON.stringify(item) },
//         })
//       }
//     >
//       <DoctorCard
//         name={`${item.users.firstname} ${item.users.lastname}`}
//         location={item.users.username}
//         experience={item.experience}
//         speciality={item.specialization}
//         language={item.language}
//         fee={item.fee}
//         image={item.users.profileImage || "https://via.placeholder.com/150"}
//         rating={4.5}
//       />
//     </TouchableOpacity>
//   );

//   const changeLanguage = () => {
//     if (i18n.language === "en") i18n.changeLanguage("fr");
//     else i18n.changeLanguage("en");
//   };

//   const fetchPosts = async () => {
//     try {
//       setLoading(true);
//       const token = await AsyncStorage.getItem("userToken");
//       const response = await axios.get(`${baseUrl}/posts/post/all`, {
//         headers: { Authorization: `bearer ${token}` },
//       });
//       const fetchedPosts = response.data.data.posts;
//       setPosts(fetchedPosts);
//       setLoading(false);
//     } catch (error) {
//       setErrorMessage("Failed to fetch posts.");
//       setLoading(false);
//     }
//   };

//   const renderPost = ({ item }: { item: Post }) => (
//     <TouchableOpacity
//       onPress={() =>
//         router.push({
//           pathname: "/doctor/postDetail",
//           params: { post: JSON.stringify(item) },
//         })
//       }
//     >
//       <View style={styles.post}>
//         {item.image ? (
//           <Image source={{ uri: item.image }} style={styles.image} />
//         ) : (
//           <Image
//             source={require("../../assets/images/doctor1.jpg")}
//             style={styles.image}
//           />
//         )}
//         <Text style={styles.title}>{item.title}</Text>
//         <Text style={styles.description}>{item.description}</Text>
//         <View style={styles.footerContainer}>
//           <TouchableOpacity style={styles.iconContainer} onPress={() => {}}>
//             <FontAwesome name="thumbs-up" size={20} color="blue" />
//             <Text style={styles.text}>{item.likes?.length}</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.iconContainer} onPress={() => {}}>
//             <FontAwesome name="comment" size={20} color="blue" />
//             <Text style={styles.text}>{item.comments?.length}</Text>
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.iconContainer} onPress={() => {}}>
//             <FontAwesome name="share" size={20} color="blue" />
//           </TouchableOpacity>
//         </View>
//       </View>
//     </TouchableOpacity>
//   );

//   useEffect(() => {
//     getData();
//     fetchPosts();
//   }, []);
//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <View style={styles.headerLeft}>
//           <TouchableOpacity onPress={() => changeLanguage()}>
//             <AntDesign name="bars" size={32} color={COLORS.primary} />
//           </TouchableOpacity>
//           <Image
//             source={{ uri: "https://via.placeholder.com/100x40?text=Logo" }}
//             style={styles.logo}
//           />
//         </View>
//         <View style={styles.headerRight}>
//           <AntDesign name="bells" size={32} color={COLORS.primary} />
//           <TouchableOpacity onPress={() => router.push("/auth/register")}>
//             <Image
//               source={require("../../assets/images/doctor1.jpg")}
//               style={styles.profileImage}
//             />
//           </TouchableOpacity>
//         </View>
//       </View>

//       <FlatList
//         data={[{ key: "main" }]}
//         renderItem={() => (
//           <View>
//             {/* Main Features Section */}
//             <View>
//               <View style={{ margin: 12 }}>
//                 <CustomText type="h1">{t("homescreen.title1")}</CustomText>
//               </View>
//               <View style={styles.features}>
//                 <TouchableOpacity style={styles.featureCard} onPress={() => {}}>
//                   <Text style={styles.featureText}>
//                     {t("homescreen.help.help1")}
//                   </Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity style={styles.featureCard} onPress={() => {}}>
//                   <Text style={styles.featureText}>
//                     {t("homescreen.help.help2")}
//                   </Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity style={styles.featureCard} onPress={() => {}}>
//                   <Text style={styles.featureText}>
//                     {t("homescreen.help.help3")}
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             </View>

//             {/* Posts Section */}
//             <View>
//               {loading ? (
//                 <LoadingOverlay />
//               ) : (
//                 <FlatList
//                   data={posts}
//                   renderItem={renderPost}
//                   keyExtractor={(item) => `post-${item.id}`}
//                   scrollEnabled={false}
//                 />
//               )}
//             </View>

//             {/* Doctors Section */}
//             <View style={styles.doctors}>
//               <View style={{ margin: 12 }}>
//                 <CustomText type="h1">{t("homescreen.title2")}</CustomText>
//               </View>
//               {loading ? (
//                 <LoadingOverlay />
//               ) : (
//                 <FlatList
//                   data={doctors}
//                   renderItem={renderDoctor}
//                   keyExtractor={(item) => item.id}
//                   horizontal
//                   showsHorizontalScrollIndicator={false}
//                   contentContainerStyle={styles.flatListContent}
//                   scrollEnabled={true}
//                 />
//               )}
//             </View>

//             {/* Pharmacies Section */}
//             <View style={styles.doctors}>
//               <View style={{ margin: 12 }}>
//                 <CustomText type="h1">{t("homescreen.title3")}</CustomText>
//               </View>
//               <FlatList
//                 data={pharmacyData}
//                 renderItem={({ item }) => (
//                   <PharmacieCard
//                     key={item.id}
//                     image={item.image}
//                     name={item.name}
//                     location={item.location}
//                   />
//                 )}
//                 keyExtractor={(item) => item.id.toString()}
//                 horizontal={true}
//                 showsHorizontalScrollIndicator={false}
//                 contentContainerStyle={styles.flatListContent}
//                 scrollEnabled={true}
//               />
//             </View>

//             {/* Recent Activities Section */}
//             <View>
//               <View style={{ margin: 12 }}>
//                 <CustomText type="h1">{t("homescreen.recent")}</CustomText>
//               </View>
//               <View style={styles.activities}>
//                 <View style={styles.activityItem}>
//                   <Text style={styles.activityText}>
//                     Consultation with Dr. John on 25th May
//                   </Text>
//                 </View>
//                 <View style={styles.activityItem}>
//                   <Text style={styles.activityText}>
//                     Consultation with Dr. John on 25th May
//                   </Text>
//                 </View>
//                 <View style={styles.activityItem}>
//                   <Text style={styles.activityText}>
//                     Consultation with Dr. John on 25th May
//                   </Text>
//                 </View>
//                 <View style={styles.activityItem}>
//                   <Text style={styles.activityText}>
//                     Consultation with Dr. John on 25th May
//                   </Text>
//                 </View>
//                 <View style={styles.activityItem}>
//                   <Text style={styles.activityText}>
//                     Consultation with Dr. John on 25th May
//                   </Text>
//                 </View>
//               </View>
//             </View>
//           </View>
//         )}
//         keyExtractor={(item) => item.key}
//       />
//       <StatusBar style="auto" />
//     </View>
//     // </View>
//   );
// };

// export default index;

// const styles = StyleSheet.create({
//   container: {
//     display: "flex",
//     flex: 1,
//     width: "100%",
//     paddingTop: 16,
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 20,
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//   },
//   headerLeft: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-around",
//   },
//   headerRight: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-around",
//   },
//   logo: {
//     width: 100,
//     height: 40,
//     marginLeft: 10,
//   },
//   profileImage: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     marginLeft: 15,
//   },
//   features: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 20,
//   },
//   featureCard: {
//     flex: 1 / 2,
//     margin: 5,
//     padding: 20,
//     backgroundColor: COLORS.primary,
//     borderRadius: 10,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   featureText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   doctors: {
//     flex: 1,
//     padding: 8,
//   },
//   flatListContent: {
//     paddingHorizontal: 8,
//   },
//   activities: {
//     marginBottom: 20,
//     // flexDirection: "row",
//     justifyContent: "space-between",
//     flexWrap: "wrap",
//   },
//   activityItem: {
//     padding: 15,
//     marginBottom: 10,
//     flex: 1,
//     margin: 5,
//     backgroundColor: COLORS.primary,
//     borderRadius: 10,
//     alignItems: "center",
//     justifyContent: "center",
//     flexBasis: "48%",
//   },
//   activityText: {
//     fontSize: 16,
//     color: COLORS.white,
//   },
//   post: {
//     marginBottom: 16,
//     borderBottomWidth: 1,
//     borderColor: "black",
//     padding: 4,
//     paddingBottom: 8,
//   },
//   image: {
//     width: "100%",
//     height: 240,
//     marginBottom: 12,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: "bold",
//   },
//   description: {
//     fontSize: 14,
//     color: "#666",
//   },
//   footerContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     backgroundColor: "#f0f0f0",
//   },
//   iconContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   text: {
//     marginLeft: 4,
//   },
// });


import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
  RefreshControl,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import {
  fetchAllPosts,
  likePost,
  unlikePost,
  clearPostsError,
  removeOptimisticPost,
  toggleOptimisticLike,
} from "@/redux/slice/postsSlice";
import { Post } from "@/constants/types/post";
import { CustomText, AppButton } from "@/components";
import { COLORS } from "@/utils/constants";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { formatDistanceToNow, parseISO } from "date-fns"; // For timestamp formatting

const PostsListScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const { allPosts, isLoading, error } = useSelector(
    (state: RootState) => state.posts
  );
  const authUser = useSelector((state: RootState) => state.auth.user); // Current logged-in user
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchAllPosts());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      Alert.alert(t("common.error"), error);
      dispatch(clearPostsError());
    }
  }, [error, dispatch, t]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchAllPosts());
    setRefreshing(false);
  }, [dispatch]);

  const handleCreatePost = () => {
    // @ts-ignore
    router.push("/posts/create-post"); // Navigate to create post screen
  };

  const handleViewPostDetails = (postId: string) => {
    // @ts-ignore
    router.push({ pathname: "/posts/post-detail", params: { postId } });
  };

  const handleLikeToggle = async (post: Post) => {
    if (!authUser?.id) return;

    const userLiked = post.likes?.some((like) => like.userId === authUser.id);
    // Use the Like type directly instead of Post["likes"][0]
    const like: import("@/constants/types/post").Like | undefined = userLiked
      ? undefined
      : {
          // Create a dummy like for optimistic update
          id: `optimistic-like-${Date.now()}`,
          userId: authUser.id,
          postId: post.id,
          createdAt: new Date().toISOString(),
          user: authUser, // Attach user for display
        };

    dispatch(
      toggleOptimisticLike({
        postId: post.id,
        userId: authUser.id,
        liked: !userLiked,
        like,
      })
    );

    try {
      if (userLiked) {
        await dispatch(unlikePost(post.id)).unwrap();
      } else {
        await dispatch(likePost(post.id)).unwrap();
      }
    } catch (err: any) {
      Alert.alert(t("common.error"), err.message || t("posts.likeFailed"));
      // Revert optimistic update if API fails
      dispatch(
        toggleOptimisticLike({
          postId: post.id,
          userId: authUser.id,
          liked: !userLiked,
          like,
        })
      );
    }
  };

  const renderPostItem = ({ item }: { item: Post }) => {
    const userLiked = item.likes?.some((like) => like.userId === authUser?.id);
    const isMyPost = item.userId === authUser?.id;

    return (
      <TouchableOpacity
        style={styles.postCard}
        onPress={() => handleViewPostDetails(item.id)}
        activeOpacity={0.8}
      >
        <View style={styles.postHeader}>
          {/* User Avatar/Name */}
          <View style={styles.userInfo}>
            <FontAwesome
              name="user-circle"
              size={30}
              color={COLORS.gray}
              style={styles.userAvatar}
            />
            <CustomText type="body3" style={styles.userName}>
              {item.user?.firstname} {item.user?.lastname}{" "}
              {isMyPost && `(${t("posts.myPost")})`}
            </CustomText>
          </View>
          <CustomText type="body5" style={styles.postTime}>
            {formatDistanceToNow(parseISO(item.createdAt), { addSuffix: true })}
          </CustomText>
        </View>

        <CustomText type="h4" style={styles.postTitle}>
          {item.title}
        </CustomText>
        {item.image && (
          <Image source={{ uri: item.image }} style={styles.postImage} />
        )}
        <CustomText
          type="body3"
          // numberOfLines={3}
          style={styles.postDescription}
        >
          {item.description}
        </CustomText>

        <View style={styles.postActions}>
          <TouchableOpacity
            onPress={() => handleLikeToggle(item)}
            style={styles.actionButton}
          >
            <FontAwesome
              name={userLiked ? "heart" : "heart-o"}
              size={20}
              color={userLiked ? COLORS.danger : COLORS.gray}
            />
            <CustomText type="body2" style={styles.actionText}>
              {item.likesCount || 0}
            </CustomText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleViewPostDetails(item.id)}
            style={styles.actionButton}
          >
            <FontAwesome name="comment-o" size={20} color={COLORS.gray} />
            <CustomText type="body2" style={styles.actionText}>
              {item.commentsCount || 0}
            </CustomText>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading && allPosts.length === 0 && !error) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <CustomText type="body1" style={styles.loadingText}>
          {t("common.loadingPosts")}
        </CustomText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <CustomText type="h1" style={styles.header}>
          {t("posts.title")}
        </CustomText>
        {authUser?.role === "DOCTOR" && ( // Only doctors can create posts
          <AppButton
            title={t("posts.createPostButton")}
            onPress={handleCreatePost}
            backgroundColor={COLORS.primary}
            containerStyle={styles.createPostButton}
            titleStyle={styles.createPostButtonTitle}
          />
        )}
      </View>

      {allPosts.length === 0 && !isLoading ? (
        <View style={styles.emptyContainer}>
          <CustomText type="body1" style={styles.emptyText}>
            {t("posts.noPosts")}
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
          data={allPosts}
          keyExtractor={(item) => item.id}
          renderItem={renderPostItem}
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

export default PostsListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 50,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  header: {
    color: COLORS.primary,
  },
  createPostButton: {
    width: 120, // Adjust width
    height: 35, // Adjust height
    borderRadius: 18,
  },
  createPostButtonTitle: {
    fontSize: 14,
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: COLORS.gray,
    textAlign: "center",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  postCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  userAvatar: {
    marginRight: 8,
  },
  userName: {
    color: COLORS.dark,
    fontWeight: "bold",
  },
  postTime: {
    color: COLORS.gray,
    fontSize: 12,
  },
  postTitle: {
    color: COLORS.dark,
    marginBottom: 10,
    fontWeight: "bold",
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
    resizeMode: "cover",
  },
  postDescription: {
    color: COLORS.text,
    marginBottom: 10,
  },
  postActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: 10,
    marginTop: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  actionText: {
    marginLeft: 8,
    color: COLORS.gray,
    fontSize: 16,
  },
});
