import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";

const LED = ({ id, selected, color, onPress }) => {
  return (
    <TouchableOpacity
      testID={`led-${id}`}
      style={[
        styles.led,
        selected && styles.selected,
        { backgroundColor: color || "#333" },
      ]}
      onPress={() => onPress(id)}
      activeOpacity={0.7}
    />
  );
};

const styles = StyleSheet.create({
  led: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 8,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  selected: {
    borderWidth: 2,
    borderColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
});

export default LED;
