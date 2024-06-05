import { CustomText, DoctorCard, Notificationcard, PharmacieCard } from "@/components";
import { COLORS } from "@/constants/theme";
import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import doctorsData from "../../constants/data/doctorData"
import generateRandomPharmaciesData from "@/constants/data/pharmacieData";

const index = () => {
  const router = useRouter();
  const doctorData = doctorsData();
  const pharmacyData = generateRandomPharmaciesData()
  console.log(pharmacyData)
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => {}}>
            <AntDesign name="bars" size={32} color={COLORS.primary} />
          </TouchableOpacity>
          <Image
            source={{ uri: "https://via.placeholder.com/100x40?text=Logo" }}
            style={styles.logo}
          />
        </View>
        <View style={styles.headerRight}>
          <AntDesign name="bells" size={32} color={COLORS.primary} />
          <TouchableOpacity onPress={() => {}}>
            <Image
              source={{ uri: "https://via.placeholder.com/50" }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Features Section */}
      <View>
        <View style={{ margin: 12 }}>
          <CustomText type="h1">What we can help you with us</CustomText>
        </View>
        <View style={styles.features}>
          <TouchableOpacity style={styles.featureCard} onPress={() => {}}>
            <Text style={styles.featureText}>Book Appointment</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.featureCard} onPress={() => {}}>
            <Text style={styles.featureText}>My Appointments</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.featureCard} onPress={() => {}}>
            <Text style={styles.featureText}>Find Doctors</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Doctors */}
      <View style={styles.doctors}>
        <View style={{ margin: 12 }}>
          <CustomText type="h1">Doctors near you</CustomText>
        </View>
        <FlatList
          data={doctorData}
          renderItem={({ item }) => (
            <DoctorCard
              key={item.id}
              name={item.name}
              location={item.location}
              experience={item.experience}
              speciality={item.speciality}
              language={item.language}
              fee={item.fee}
              image={""}
              rating={0}
            />
          )}
          keyExtractor={(item) => item.name.toString()}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.flatListContent}
        />
      </View>

      {/* Pharmacies */}
      <View style={styles.doctors}>
        <View style={{ margin: 12 }}>
          <CustomText type="h1">Doctors near you</CustomText>
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
          <CustomText type="h1">Recent Activities</CustomText>
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
    flex: 1/2,
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
    flexWrap:"wrap"
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
    flexBasis:"48%"
  },
  activityText: {
    fontSize: 16,
    color:COLORS.white
  },
});
