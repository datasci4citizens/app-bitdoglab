import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";

const ColorSlider = ({ color, value, onChange }) => {
  const getSliderColor = () => {
    switch (color) {
      case "red":
        return ["#FFDDDD", "#FF0000"];
      case "green":
        return ["#DDFFDD", "#00FF00"];
      case "blue":
        return ["#DDDDFF", "#0000FF"];
      default:
        return ["#DDD", "#999"];
    }
  };

  const [minColor, maxColor] = getSliderColor();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {color.toUpperCase()}: {value}
      </Text>
      <Slider
        value={value}
        onValueChange={onChange}
        minimumValue={0}
        maximumValue={255}
        step={1}
        minimumTrackTintColor={maxColor}
        maximumTrackTintColor={minColor}
        thumbTintColor={maxColor}
        style={styles.slider}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    width: "100%",
  },
  label: {
    marginBottom: 5,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  slider: {
    height: 40,
  },
});

export default ColorSlider;
