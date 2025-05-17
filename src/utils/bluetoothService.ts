import {
  BleClient,
  numbersToDataView,
} from "@capacitor-community/bluetooth-le";

// These UUIDs should match the ones configured in your Bluetooth device
// Replace them with your actual service and characteristic UUIDs
const NEOPIXEL_SERVICE = "fb005c80-02e7-f387-1cad-8acd2d8df0c8"; // Example UUID, use your own
const NEOPIXEL_CHARACTERISTIC = "fb005c81-02e7-f387-1cad-8acd2d8df0c8"; // Example UUID, use your own

export interface NeopixelLed {
  position: number;
  red: number;
  green: number;
  blue: number;
}

export class BluetoothService {
  /**
   * Send LED data to the device via Bluetooth
   * @param deviceId The ID of the connected Bluetooth device
   * @param leds Array of LED data to send
   */
  public static async sendLedData(
    deviceId: string,
    leds: NeopixelLed[]
  ): Promise<void> {
    try {
      if (!deviceId) {
        throw new Error("No device connected");
      }

      for (const led of leds) {
        // Format: [command, position, red, green, blue]
        // command: 1 = set LED
        const data = numbersToDataView([
          1,
          led.position,
          led.red,
          led.green,
          led.blue,
        ]);

        await BleClient.write(
          deviceId,
          NEOPIXEL_SERVICE,
          NEOPIXEL_CHARACTERISTIC,
          data
        );

        // Small delay to avoid overwhelming the device
        await new Promise((resolve) => setTimeout(resolve, 20));
      }

      console.log(`Sent ${leds.length} LED updates via Bluetooth`);
    } catch (error) {
      console.error("Failed to send LED data via Bluetooth:", error);
      throw error;
    }
  }

  /**
   * Clear all LEDs (set them to black)
   * @param deviceId The ID of the connected Bluetooth device
   * @param ledCount Number of LEDs to clear
   */
  public static async clearAllLeds(
    deviceId: string,
    ledCount: number
  ): Promise<void> {
    try {
      if (!deviceId) {
        throw new Error("No device connected");
      }

      // Format: [command, 0, 0, 0, 0]
      // command: 2 = clear all LEDs
      const data = numbersToDataView([2, 0, 0, 0, 0]);

      await BleClient.write(
        deviceId,
        NEOPIXEL_SERVICE,
        NEOPIXEL_CHARACTERISTIC,
        data
      );

      console.log("Cleared all LEDs via Bluetooth");
    } catch (error) {
      console.error("Failed to clear LEDs via Bluetooth:", error);
      throw error;
    }
  }
}
