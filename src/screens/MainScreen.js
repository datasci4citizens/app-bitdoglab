import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
} from "react-native";
import LEDMatrix from "../components/LEDMatrix";
import ColorSlider from "../components/ColorSlider";
import Button from "../components/Button";
import {
  initBluetooth,
  scanDevices,
  connectToDevice,
  sendLEDConfiguration,
  disconnect,
} from "../utils/bluetooth";

// Create initial LED matrix with all LEDs off
const createInitialMatrix = () => {
  const matrix = [];
  for (let i = 0; i < 5; i++) {
    const row = [];
    for (let j = 0; j < 5; j++) {
      row.push({
        red: 0,
        green: 0,
        blue: 0,
        color: "#000000",
      });
    }
    matrix.push(row);
  }
  return matrix;
};

const MainScreen = () => {
  // State variables
  const [ledMatrix, setLedMatrix] = useState(createInitialMatrix());
  const [selectedLED, setSelectedLED] = useState(null);
  const [redValue, setRedValue] = useState(0);
  const [greenValue, setGreenValue] = useState(0);
  const [blueValue, setBlueValue] = useState(0);
  const [isBluetoothEnabled, setIsBluetoothEnabled] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [availableDevices, setAvailableDevices] = useState([]);
  const [showDevicesModal, setShowDevicesModal] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Initialize Bluetooth on component mount
  useEffect(() => {
    const setupBluetooth = async () => {
      const enabled = await initBluetooth();
      setIsBluetoothEnabled(enabled);
    };

    setupBluetooth();

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, []);

  // Handle LED selection
  const handleLEDPress = (id) => {
    setSelectedLED(id);
    const [row, col] = id.split("-").map(Number);
    const led = ledMatrix[row][col];

    // Update sliders with selected LED colors
    setRedValue(led.red);
    setGreenValue(led.green);
    setBlueValue(led.blue);
  };

  // Update color from sliders
  const updateColor = () => {
    if (!selectedLED) return;

    const [row, col] = selectedLED.split("-").map(Number);
    const updatedMatrix = [...ledMatrix];

    // Convert RGB to hex color
    const hexColor = rgbToHex(redValue, greenValue, blueValue);

    updatedMatrix[row][col] = {
      red: redValue,
      green: greenValue,
      blue: blueValue,
      color: hexColor,
    };

    setLedMatrix(updatedMatrix);
  };

  // Convert RGB values to hex color
  const rgbToHex = (r, g, b) => {
    return `#${[r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")}`;
  };

  // Update colors when slider values change
  useEffect(() => {
    updateColor();
  }, [redValue, greenValue, blueValue]);

  // Handle red slider change
  const handleRedChange = (value) => {
    setRedValue(Math.round(value));
  };

  // Handle green slider change
  const handleGreenChange = (value) => {
    setGreenValue(Math.round(value));
  };

  // Handle blue slider change
  const handleBlueChange = (value) => {
    setBlueValue(Math.round(value));
  };

  // Scan for Bluetooth devices
  const handleScanDevices = async () => {
    if (!isBluetoothEnabled) {
      Alert.alert(
        "Bluetooth is not enabled",
        "Please enable Bluetooth to continue."
      );
      return;
    }

    setIsScanning(true);
    const devices = await scanDevices();
    setAvailableDevices(devices);
    setIsScanning(false);
    setShowDevicesModal(true);
  };

  // Connect to selected device
  const handleConnectDevice = async (device) => {
    setShowDevicesModal(false);

    const success = await connectToDevice(device.id);
    if (success) {
      setConnectedDevice(device);
      Alert.alert("Connected", `Connected to ${device.name}`);
    } else {
      Alert.alert(
        "Connection Failed",
        "Failed to connect to the device. Please try again."
      );
    }
  };

  // Send LED configuration to the device
  const handleSendConfiguration = async () => {
    if (!connectedDevice) {
      Alert.alert("Not Connected", "Please connect to a device first.");
      return;
    }

    setIsSending(true);
    const success = await sendLEDConfiguration(ledMatrix);
    setIsSending(false);

    if (success) {
      Alert.alert("Success", "LED configuration sent successfully.");
    } else {
      Alert.alert(
        "Error",
        "Failed to send LED configuration. Please try again."
      );
    }
  };

  // Reset all LEDs to off
  const handleResetMatrix = () => {
    setLedMatrix(createInitialMatrix());
    setSelectedLED(null);
    setRedValue(0);
    setGreenValue(0);
    setBlueValue(0);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>LED Matrix Control</Text>
        {connectedDevice ? (
          <View style={styles.connectedDevice}>
            <Text style={styles.connectedText}>
              Connected to: {connectedDevice.name}
            </Text>
          </View>
        ) : (
          <Button
            title="Connect Device"
            onPress={handleScanDevices}
            type="primary"
          />
        )}
      </View>

      <View style={styles.matrixContainer}>
        <LEDMatrix
          matrix={ledMatrix}
          selectedLED={selectedLED}
          onLEDPress={handleLEDPress}
        />
      </View>

      <View style={styles.controlsContainer}>
        <Text style={styles.sectionTitle}>Color Controls</Text>

        {selectedLED ? (
          <View style={styles.sliderContainer}>
            <Text style={styles.selectedLEDText}>
              Selected LED: {selectedLED}
            </Text>

            <ColorSlider
              color="red"
              value={redValue}
              onChange={handleRedChange}
            />

            <ColorSlider
              color="green"
              value={greenValue}
              onChange={handleGreenChange}
            />

            <ColorSlider
              color="blue"
              value={blueValue}
              onChange={handleBlueChange}
            />

            <View style={styles.colorPreview}>
              <Text style={styles.colorPreviewText}>Color Preview:</Text>
              <View
                style={[
                  styles.colorBox,
                  {
                    backgroundColor: rgbToHex(redValue, greenValue, blueValue),
                  },
                ]}
              />
              <Text style={styles.rgbText}>
                RGB: {redValue}, {greenValue}, {blueValue}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={styles.instructionText}>
            Select an LED from the matrix to customize its color.
          </Text>
        )}
      </View>

      <View style={styles.actionButtons}>
        <Button
          title="Reset All LEDs"
          onPress={handleResetMatrix}
          type="danger"
        />

        <Button
          title={isSending ? "Sending..." : "Save & Send"}
          onPress={handleSendConfiguration}
          type="success"
          disabled={isSending || !connectedDevice}
        />
      </View>

      {/* Devices Modal */}
      <Modal
        visible={showDevicesModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDevicesModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Available Devices</Text>

            {isScanning ? (
              <ActivityIndicator size="large" color="#007BFF" />
            ) : (
              <>
                {availableDevices.length > 0 ? (
                  <FlatList
                    data={availableDevices}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.deviceItem}
                        onPress={() => handleConnectDevice(item)}
                      >
                        <Text style={styles.deviceName}>{item.name}</Text>
                        <Text style={styles.deviceAddress}>{item.id}</Text>
                      </TouchableOpacity>
                    )}
                    style={styles.devicesList}
                  />
                ) : (
                  <Text style={styles.noDevicesText}>
                    No Bluetooth devices found. Please make sure the HC-05
                    module is powered on.
                  </Text>
                )}
              </>
            )}

            <View style={styles.modalButtons}>
              <Button
                title="Scan Again"
                onPress={handleScanDevices}
                type="secondary"
                disabled={isScanning}
              />

              <Button
                title="Cancel"
                onPress={() => setShowDevicesModal(false)}
                type="outline"
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#FFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  connectedDevice: {
    backgroundColor: "#E6F7FF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#91D5FF",
  },
  connectedText: {
    color: "#1890FF",
    fontSize: 12,
  },
  matrixContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  controlsContainer: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 15,
    margin: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  sliderContainer: {
    marginTop: 10,
  },
  selectedLEDText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#555",
  },
  instructionText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    padding: 20,
  },
  colorPreview: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    justifyContent: "space-between",
  },
  colorPreviewText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
  },
  colorBox: {
    width: 40,
    height: 40,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  rgbText: {
    fontSize: 14,
    color: "#666",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 20,
    width: "80%",
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  devicesList: {
    marginVertical: 10,
  },
  deviceItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  deviceName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  deviceAddress: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
  },
  noDevicesText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginVertical: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
});

export default MainScreen;
