import React from "react";
import { View, Text, Image, StyleSheet, ScrollView } from "react-native";
import Button from "../components/Button";

const WelcomeScreen = ({ onContinue }) => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image
          source={require("../../resources/Tela de boas vindas.png")}
          style={styles.image}
          resizeMode="contain"
        />

        <Text style={styles.title}>Welcome to LED Control</Text>

        <Text style={styles.description}>
          This app allows you to control a 5x5 LED matrix via Bluetooth. You can
          select individual LEDs and set their colors using RGB sliders.
        </Text>

        <View style={styles.featureContainer}>
          <Text style={styles.featureTitle}>Main Features:</Text>
          <Text style={styles.featureItem}>• Interactive 5x5 LED matrix</Text>
          <Text style={styles.featureItem}>• RGB color configuration</Text>
          <Text style={styles.featureItem}>• Bluetooth communication</Text>
          <Text style={styles.featureItem}>• Real-time color preview</Text>
        </View>

        <Image
          source={require("../../resources/PixelArt.png")}
          style={styles.previewImage}
          resizeMode="contain"
        />
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button title="Get Started" onPress={onContinue} type="primary" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollContent: {
    padding: 20,
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 20,
    color: "#333",
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,
  },
  featureContainer: {
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 20,
    marginVertical: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  featureItem: {
    fontSize: 16,
    color: "#555",
    marginVertical: 5,
    lineHeight: 24,
  },
  previewImage: {
    width: "80%",
    height: 200,
    marginTop: 10,
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: "#FFF",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});

export default WelcomeScreen;
