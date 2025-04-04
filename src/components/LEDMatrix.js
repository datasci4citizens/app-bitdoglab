import React from "react";
import { View, StyleSheet } from "react-native";
import LED from "./LED";

const LEDMatrix = ({ matrix, selectedLED, onLEDPress }) => {
  const renderRow = (row, rowIndex) => {
    return (
      <View key={`row-${rowIndex}`} style={styles.row}>
        {row.map((led, colIndex) => {
          const id = `${rowIndex}-${colIndex}`;
          return (
            <LED
              key={id}
              id={id}
              selected={selectedLED === id}
              color={led.color}
              onPress={onLEDPress}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {matrix.map((row, index) => renderRow(row, index))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#222",
    borderRadius: 10,
    margin: 10,
  },
  row: {
    flexDirection: "row",
  },
});

export default LEDMatrix;
