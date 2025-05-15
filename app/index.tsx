import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, View, StyleSheet, Text, TouchableOpacity, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

const OnboardingScreen = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  
  const pages = [
    {
      title: "Welcome to Your App",
      subtitle: "This is a description of your app",
      image: require("../assets/images/splash.png")
    },
    {
      title: "Feature 1",
      subtitle: "Description of feature 1",
      image: require("../assets/images/splash.png")
    },
    {
      title: "Feature 2",
      subtitle: "Description of feature 2",
      image: require("../assets/images/doctor.jpeg")
    },
  ];
  
  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      router.push({pathname: "/(tabs)"});
    }
  };
  
  return (
    <View style={styles.container}>
      <Image source={pages[currentPage].image} style={styles.image} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{pages[currentPage].title}</Text>
        <Text style={styles.subtitle}>{pages[currentPage].subtitle}</Text>
      </View>
      <View style={styles.dotContainer}>
        {pages.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { backgroundColor: index === currentPage ? '#007BFF' : '#ccc' }
            ]}
          />
        ))}
      </View>
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>
          {currentPage === pages.length - 1 ? "Get Started" : "Next"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white'
  },
  image: {
    width: width * 0.8,
    height: height * 0.4,
    resizeMode: 'contain',
    marginBottom: 30
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 50
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20
  },
  dotContainer: {
    flexDirection: 'row',
    marginBottom: 30
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 5
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default OnboardingScreen;
