import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

const Button = ({ title, onPress, style, type = "primary" }) => {
  return (
    <TouchableOpacity
      style={[styles.button, styles[type], style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, styles[`${type}Text`]]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
  },
  primary: {
    backgroundColor: "#007BFF",
  },
  primaryText: {
    color: "#FFF",
  },
  secondary: {
    backgroundColor: "#6C757D",
  },
  secondaryText: {
    color: "#FFF",
  },
  success: {
    backgroundColor: "#28A745",
  },
  successText: {
    color: "#FFF",
  },
  danger: {
    backgroundColor: "#DC3545",
  },
  dangerText: {
    color: "#FFF",
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#007BFF",
  },
  outlineText: {
    color: "#007BFF",
  },
});

export default Button;
