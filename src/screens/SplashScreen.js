import React from "react";
import { View, Image, StyleSheet, ActivityIndicator } from "react-native";

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require("../../resources/SplashScreen.png")}
        style={styles.image}
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color="#007BFF" style={styles.loader} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  image: {
    width: "80%",
    height: "50%",
  },
  loader: {
    marginTop: 20,
  },
});

export default SplashScreen;
