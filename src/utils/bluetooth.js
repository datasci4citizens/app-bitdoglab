// The current import is causing issues with Expo Go
// import BluetoothSerial from "react-native-bluetooth-serial";

// Mock implementation for development in Expo Go
const BluetoothMock = {
  requestEnable: async () => true,
  isEnabled: async () => true,
  list: async () => [
    { id: "mock-device-1", name: "Mock Arduino" },
    { id: "mock-device-2", name: "Mock ESP32" },
  ],
  connect: async (id) => true,
  disconnect: async () => true,
  write: async (data) => true,
};

// Use the mock implementation for now
const BluetoothSerial = BluetoothMock;

// Initialize the Bluetooth module
export const initBluetooth = async () => {
  try {
    await BluetoothSerial.requestEnable();
    const isEnabled = await BluetoothSerial.isEnabled();
    return isEnabled;
  } catch (error) {
    console.error("Error initializing Bluetooth:", error);
    return false;
  }
};

// Scan for available devices
export const scanDevices = async () => {
  try {
    const devices = await BluetoothSerial.list();
    return devices;
  } catch (error) {
    console.error("Error scanning for devices:", error);
    return [];
  }
};

// Connect to a specific device
export const connectToDevice = async (deviceId) => {
  try {
    await BluetoothSerial.connect(deviceId);
    return true;
  } catch (error) {
    console.error("Error connecting to device:", error);
    return false;
  }
};

// Disconnect from the current device
export const disconnect = async () => {
  try {
    await BluetoothSerial.disconnect();
    return true;
  } catch (error) {
    console.error("Error disconnecting from device:", error);
    return false;
  }
};

// Generate MicroPython code from LED matrix data
export const generateMicroPythonCode = (ledMatrix) => {
  let code = "from machine import Pin\n";
  code += "import neopixel\n";
  code += "import time\n\n";
  code += "# NeoPixel strip configuration\n";
  code += "pixel_pin = Pin(5, Pin.OUT)  # Pin where NeoPixel is connected\n";
  code += "num_pixels = 25  # Number of NeoPixels (5x5 matrix)\n";
  code += "np = neopixel.NeoPixel(pixel_pin, num_pixels)\n\n";
  code += "# LED matrix configuration\n";
  code += "led_matrix = [\n";

  // Flatten the 2D matrix into a 1D array for the NeoPixel strip
  const flatLedArray = [];
  for (let row = 0; row < ledMatrix.length; row++) {
    for (let col = 0; col < ledMatrix[row].length; col++) {
      const led = ledMatrix[row][col];
      flatLedArray.push(led);
    }
  }

  // Add each LED color to the code
  flatLedArray.forEach((led, index) => {
    const r = led.red || 0;
    const g = led.green || 0;
    const b = led.blue || 0;
    code += `    (${r}, ${g}, ${b}),  # LED ${index}\n`;
  });

  code += "]\n\n";
  code += "# Update all LEDs\n";
  code += "for i, (r, g, b) in enumerate(led_matrix):\n";
  code += "    np[i] = (r, g, b)\n";
  code += "np.write()\n";

  return code;
};

// Send LED configuration to the device
export const sendLEDConfiguration = async (ledMatrix) => {
  try {
    const micropythonCode = generateMicroPythonCode(ledMatrix);
    await BluetoothSerial.write(micropythonCode);
    return true;
  } catch (error) {
    console.error("Error sending LED configuration:", error);
    return false;
  }
};
