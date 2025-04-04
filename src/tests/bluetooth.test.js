import { generateMicroPythonCode } from "../utils/bluetooth";

describe("Bluetooth Utilities", () => {
  describe("generateMicroPythonCode", () => {
    it("should generate correct MicroPython code for a simple LED configuration", () => {
      // Create a test matrix with one LED lit
      const testMatrix = Array(5)
        .fill()
        .map(() =>
          Array(5).fill({
            red: 0,
            green: 0,
            blue: 0,
            color: "#000000",
          })
        );

      // Set first LED to red
      testMatrix[0][0] = {
        red: 255,
        green: 0,
        blue: 0,
        color: "#FF0000",
      };

      const code = generateMicroPythonCode(testMatrix);

      // Basic validation of the generated code
      expect(code).toContain("from machine import Pin");
      expect(code).toContain("import neopixel");
      expect(code).toContain("pixel_pin = Pin(5, Pin.OUT)");
      expect(code).toContain("num_pixels = 25");

      // Check that our LED is set to the correct color
      expect(code).toContain("(255, 0, 0),  # LED 0");

      // Check that other LEDs are off
      expect(code).toContain("(0, 0, 0),  # LED 1");

      // Check that the code includes the write command
      expect(code).toContain("np.write()");
    });

    it("should handle multiple LED colors correctly", () => {
      // Create a test matrix with multiple LEDs lit with different colors
      const testMatrix = Array(5)
        .fill()
        .map(() =>
          Array(5).fill({
            red: 0,
            green: 0,
            blue: 0,
            color: "#000000",
          })
        );

      // Set first LED to red
      testMatrix[0][0] = {
        red: 255,
        green: 0,
        blue: 0,
        color: "#FF0000",
      };

      // Set second LED to green
      testMatrix[0][1] = {
        red: 0,
        green: 255,
        blue: 0,
        color: "#00FF00",
      };

      // Set third LED to blue
      testMatrix[0][2] = {
        red: 0,
        green: 0,
        blue: 255,
        color: "#0000FF",
      };

      const code = generateMicroPythonCode(testMatrix);

      // Check that each LED has the correct color assigned
      expect(code).toContain("(255, 0, 0),  # LED 0");
      expect(code).toContain("(0, 255, 0),  # LED 1");
      expect(code).toContain("(0, 0, 255),  # LED 2");
    });
  });
});
