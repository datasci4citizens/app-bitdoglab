# LED Control Mobile Application

A React Native mobile application that communicates via Bluetooth with an embedded device using an HC-05 module to control a 5x5 LED matrix.

## Features

- **LED Matrix Control**: Interactive 5x5 LED matrix where users can select individual LEDs.
- **RGB Configuration**: Set RGB values for each LED using sliders.
- **Real-time Preview**: See color changes in real-time as sliders are adjusted.
- **Bluetooth Communication**: Connect to HC-05 modules to send LED configuration data.
- **MicroPython Integration**: Automatically generates MicroPython code for the embedded device.

## Project Structure

```
led-control-app/
├── src/
│   ├── components/
│   │   ├── Button.js         # Reusable button component
│   │   ├── ColorSlider.js    # RGB slider component
│   │   ├── LED.js            # Individual LED component
│   │   └── LEDMatrix.js      # 5x5 LED matrix component
│   ├── screens/
│   │   ├── MainScreen.js     # Main app screen with LED matrix and controls
│   │   ├── SplashScreen.js   # Initial loading screen
│   │   └── WelcomeScreen.js  # Welcome/intro screen
│   ├── utils/
│   │   └── bluetooth.js      # Bluetooth communication utilities
│   ├── tests/
│   │   ├── LED.test.js       # Tests for LED component
│   │   └── bluetooth.test.js # Tests for Bluetooth utilities
│   └── App.js                # Main application component
├── resources/                # Images and design resources
├── index.js                  # Entry point
└── package.json              # Dependencies and scripts
```

## Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Connect your mobile device (Android only) via USB
4. Enable USB debugging on your device
5. Run the app:
   ```
   npm run android
   ```

## How to Use

1. Launch the app and click "Get Started" on the welcome screen
2. Tap "Connect Device" to scan for available Bluetooth devices
3. Select your HC-05 module from the list of devices
4. Select an LED from the 5x5 matrix
5. Adjust the RGB sliders to set the color
6. Repeat for other LEDs as needed
7. Tap "Save & Send" to transmit the configuration to the embedded device

## Hardware Requirements

- Android mobile device with Bluetooth
- HC-05 Bluetooth module
- Microcontroller with MicroPython support
- NeoPixel LEDs or similar RGB LEDs

## MicroPython Code Generation

The app automatically generates MicroPython code for controlling the LED matrix. The generated code is transmitted to the embedded device via Bluetooth.

Example of generated code:

```python
from machine import Pin
import neopixel
import time

# NeoPixel strip configuration
pixel_pin = Pin(5, Pin.OUT)  # Pin where NeoPixel is connected
num_pixels = 25  # Number of NeoPixels (5x5 matrix)
np = neopixel.NeoPixel(pixel_pin, num_pixels)

# LED matrix configuration
led_matrix = [
    (255, 0, 0),  # LED 0
    (0, 255, 0),  # LED 1
    # ... more LEDs
]

# Update all LEDs
for i, (r, g, b) in enumerate(led_matrix):
    np[i] = (r, g, b)
np.write()
```

## Testing

Run unit tests with:

```
npm test
```

## Development

This project was developed using:

- React Native
- Expo
- react-native-bluetooth-serial for Bluetooth communication
- Jest for testing

## License

MIT

# Log

04/01/2025 - App running

- Fixed all erros and app running

03/30/2025 - First implementation

- The art seams to not work propelly as I only give the full screen image
- App open in the Expo Go app
- App beak once we press a LED button
