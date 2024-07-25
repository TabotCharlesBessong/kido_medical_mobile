import {
  CustomText,
  DoctorCard,
  LoadingOverlay,
  Notificationcard,
  PharmacieCard,
} from "@/components";
import { COLORS } from "@/constants/theme";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import doctorsData from "../../constants/data/doctorData";
import generateRandomPharmaciesData from "@/constants/data/pharmacieData";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Doctor, Post } from "@/constants/types";
import { generatePosts } from "@/constants/data/posts";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { baseUrl } from "@/utils/variables";

const index = () => {
  const router = useRouter();
  const doctorData = doctorsData();
  const {t,i18n} = useTranslation()
  const pharmacyData = generateRandomPharmaciesData();
  const [doctors, setDoctors] = useState<Doctor[]>([])
  // console.log(pharmacyData);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);const [errorMessage, setErrorMessage] = useState<string>("");
  // console.log(posts)

  const getData = async () => {
    const token = await AsyncStorage.getItem("userToken");
    const data = await AsyncStorage.getItem("userData");

    // const keys = await AsyncStorage.getAllKeys();
    // const result = await AsyncStorage.multiGet(keys);
    console.log({token,data});
  };

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      const datas = await AsyncStorage.getItem("userData")
      console.log(datas)
      const response = await axios.get(`${baseUrl}/doctor/doctor/all`, {
        headers: { Authorization: `bearer ${token}` },
      });
      // Check the structure of the response data
      const fetchedDoctors = response.data.data.doctors.map((doctor: any) => ({
        ...doctor,
        users: {
          firstname: doctor["users.firstname"],
          lastname: doctor["users.lastname"],
          username: doctor["users.username"],
        },
      }));
      setDoctors(fetchedDoctors);
      setLoading(false);
    } catch (error) {
      setErrorMessage("Failed to fetch doctors.");
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchDoctors();
    // getData()
  }, []);
  // console.log(doctors)
  // console.log(errorMessage)

  const renderDoctor = ({ item }: { item: Doctor }) => (
    <TouchableOpacity
      onPress={() =>
        router.push({ pathname: "/doctor/profile", params: { doctor: JSON.stringify(item) } })
      }
    >
      <DoctorCard
        name={`${item.users.firstname} ${item.users.lastname}`}
        location={item.users.username} // Use actual location field if available
        experience={item.experience}
        speciality={item.specialization}
        language={item.language}
        fee={item.fee}
        image={""} // Add image field if available
        rating={0} // Add rating field if available
      />
    </TouchableOpacity>
  );

  const changeLanguage = () => {
    if(i18n.language === 'en')  i18n.changeLanguage('fr')
    else i18n.changeLanguage('en')
  }

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      const response = await axios.get(`${baseUrl}/posts/post/all`, {
        headers: { Authorization: `bearer ${token}` },
      });
      const fetchedPosts = response.data.data.posts;
      setPosts(fetchedPosts);
      setLoading(false);
    } catch (error) {
      setErrorMessage("Failed to fetch posts.");
      setLoading(false);
    }
  };

  const renderPost = ({ item }: { item: Post }) => (
    <TouchableOpacity onPress={() => router.push(`/posts/${item.id}`)}>
      <View style={styles.post}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.image} />
        ) : (
          <Image
            source={require("../../assets/images/doctor1.jpg")}
            style={styles.image}
          />
        )}
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <View style={styles.footerContainer}>
          <TouchableOpacity style={styles.iconContainer} onPress={() => {}}>
            <FontAwesome name="thumbs-up" size={20} color="blue" />
            <Text style={styles.text}>{item.likes?.length}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconContainer} onPress={() => {}}>
            <FontAwesome name="comment" size={20} color="blue" />
            <Text style={styles.text}>{item.comments?.length}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconContainer} onPress={() => {}}>
            <FontAwesome name="share" size={20} color="blue" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  useEffect(() => {
    getData();
    fetchPosts()
  }, []);
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => changeLanguage}>
            <AntDesign name="bars" size={32} color={COLORS.primary} />
          </TouchableOpacity>
          <Image
            source={{ uri: "https://via.placeholder.com/100x40?text=Logo" }}
            style={styles.logo}
          />
        </View>
        <View style={styles.headerRight}>
          <AntDesign name="bells" size={32} color={COLORS.primary} />
          <TouchableOpacity onPress={() => router.push("auth/register")}>
            <Image
              source={require("../../assets/images/doctor1.jpg")}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Features Section */}
      <View>
        <View style={{ margin: 12 }}>
          <CustomText type="h1">{t("homescreen.title1")}</CustomText>
        </View>
        <View style={styles.features}>
          <TouchableOpacity style={styles.featureCard} onPress={() => {}}>
            <Text style={styles.featureText}>{t("homescreen.help.help1")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.featureCard} onPress={() => {}}>
            <Text style={styles.featureText}>{t("homescreen.help.help2")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.featureCard} onPress={() => {}}>
            <Text style={styles.featureText}>{t("homescreen.help.help3")}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* post */}

      <View style={{ display: "flex", padding: 16 }}>
        {loading ? (
          <LoadingOverlay />
        ) : (
          <FlatList
            data={posts}
            renderItem={renderPost}
            keyExtractor={(item) => item.id}
          />
        )}
      </View>
      {/* Doctors */}
      <View style={styles.doctors}>
        <View style={{ margin: 12 }}>
          <CustomText type="h1">{t("homescreen.title2")}</CustomText>
        </View>
        {loading ? (
          <LoadingOverlay />
        ) : (
          <FlatList
            data={doctors}
            renderItem={renderDoctor}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
          />
        )}
      </View>

      {/* Pharmacies */}
      <View style={styles.doctors}>
        <View style={{ margin: 12 }}>
          <CustomText type="h1">{t("homescreen.title3")}</CustomText>
        </View>
        <FlatList
          data={pharmacyData}
          renderItem={({ item }) => (
            <PharmacieCard
              key={item.id}
              image={item.image}
              name={item.name}
              location={item.location}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.flatListContent}
        />
      </View>
      {/* Recent Activities Section */}
      <View>
        <View style={{ margin: 12 }}>
          <CustomText type="h1">{t("homescreen.recent")}</CustomText>
        </View>
        {/* Add recent activity items here */}
        <View style={styles.activities}>
          <View style={styles.activityItem}>
            <Text style={styles.activityText}>
              Consultation with Dr. John on 25th May
            </Text>
          </View>
          <View style={styles.activityItem}>
            <Text style={styles.activityText}>
              Consultation with Dr. John on 25th May
            </Text>
          </View>
          <View style={styles.activityItem}>
            <Text style={styles.activityText}>
              Consultation with Dr. John on 25th May
            </Text>
          </View>
          <View style={styles.activityItem}>
            <Text style={styles.activityText}>
              Consultation with Dr. John on 25th May
            </Text>
          </View>
          <View style={styles.activityItem}>
            <Text style={styles.activityText}>
              Consultation with Dr. John on 25th May
            </Text>
          </View>
        </View>
      </View>
      <StatusBar style="auto" />
    </ScrollView>
  );
};

export default index;

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1,
    width: "100%",
    paddingTop: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  logo: {
    width: 100,
    height: 40,
    marginLeft: 10,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginLeft: 15,
  },
  features: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  featureCard: {
    flex: 1 / 2,
    margin: 5,
    padding: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  doctors: {
    flex: 1,
    padding: 8,
  },
  flatListContent: {
    paddingHorizontal: 8,
  },
  activities: {
    marginBottom: 20,
    // flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  activityItem: {
    padding: 15,
    marginBottom: 10,
    flex: 1,
    margin: 5,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexBasis: "48%",
  },
  activityText: {
    fontSize: 16,
    color: COLORS.white,
  },
  post: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderColor: "black",
    padding: 4,
    paddingBottom: 8,
  },
  image: {
    width: "100%",
    height: 240,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  description: {
    fontSize: 14,
    color: "#666",
  },
  footerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f0f0f0",
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    marginLeft: 4,
  },
});
