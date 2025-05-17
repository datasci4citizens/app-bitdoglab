import React, { createContext, useState, useContext, useEffect } from "react";
import { BleClient } from "@capacitor-community/bluetooth-le";

// Extend the Navigator type to include the serial property
declare global {
  interface Navigator {
    serial?: {
      requestPort: () => Promise<any>;
    };
  }
}

// Connection types enum
export enum ConnectionType {
  SERIAL = "serial",
  BLUETOOTH = "bluetooth",
}

// Interface for a connected device
export interface ConnectedDevice {
  id: string;
  name: string;
  type: ConnectionType;
}

interface ConnectionContextType {
  isConnected: boolean;
  serialPort: any;
  bluetoothDevice: any;
  connectionType: ConnectionType | null;
  connectedDevice: ConnectedDevice | null;
  connect: (type?: ConnectionType) => Promise<void>;
  disconnect: () => Promise<void>;
  sendCommand: (command: string) => Promise<void>;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(
  undefined
);

export const ConnectionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [serialPort, setSerialPort] = useState<any>(null);
  const [bluetoothDevice, setBluetoothDevice] = useState<any>(null);
  const [reader, setReader] = useState<any>(null);
  const [connectionType, setConnectionType] = useState<ConnectionType | null>(
    null
  );
  const [connectedDevice, setConnectedDevice] =
    useState<ConnectedDevice | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (serialPort || bluetoothDevice) {
        disconnect();
      }
    };
  }, []);

  // Initialize Bluetooth on component mount
  useEffect(() => {
    const initializeBluetooth = async () => {
      try {
        await BleClient.initialize();
        console.log("Bluetooth initialized");
      } catch (error) {
        console.error("Failed to initialize Bluetooth:", error);
      }
    };

    initializeBluetooth();
  }, []);

  const connectSerial = async () => {
    try {
      if (!navigator.serial) {
        throw new Error("Web Serial API not supported in this browser");
      }

      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });

      setSerialPort(port);
      setIsConnected(true);
      setConnectionType(ConnectionType.SERIAL);
      setConnectedDevice({
        id: "serial-connection",
        name: "Serial Device",
        type: ConnectionType.SERIAL,
      });

      // Start reading from the port
      readFromSerial(port);
    } catch (error) {
      console.error("Serial connection error:", error);
      setIsConnected(false);
      throw error;
    }
  };

  const connectBluetooth = async () => {
    try {
      // We already initialized the BLE client in the useEffect

      // Request a BLE device
      const device = await BleClient.requestDevice({
        // You can specify services to filter devices
        // services: ["service_uuid"],
        // You can use namePrefix to filter by device name
        // namePrefix: "YourDevicePrefix",
      });

      console.log("Connecting to device:", device);

      // Connect to the device
      await BleClient.connect(device.deviceId, (deviceId) => {
        console.log(`Device ${deviceId} disconnected`);
        setIsConnected(false);
        setBluetoothDevice(null);
        setConnectionType(null);
        setConnectedDevice(null);
      });

      // Set the device info
      setBluetoothDevice(device);
      setIsConnected(true);
      setConnectionType(ConnectionType.BLUETOOTH);
      setConnectedDevice({
        id: device.deviceId,
        name: device.name || "Unknown Bluetooth Device",
        type: ConnectionType.BLUETOOTH,
      });

      console.log("Successfully connected to Bluetooth device");
    } catch (error) {
      console.error("Bluetooth connection error:", error);
      setIsConnected(false);
      throw error;
    }
  };

  const connect = async (type: ConnectionType = ConnectionType.SERIAL) => {
    if (type === ConnectionType.SERIAL) {
      await connectSerial();
    } else if (type === ConnectionType.BLUETOOTH) {
      await connectBluetooth();
    }
  };

  const readFromSerial = async (port: any) => {
    if (!port) return;

    const reader = port.readable.getReader();
    setReader(reader);
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        console.log("Received:", decoder.decode(value));
      }
    } catch (error) {
      console.error("Read error:", error);
    } finally {
      reader.releaseLock();
    }
  };

  const disconnect = async () => {
    try {
      if (connectionType === ConnectionType.SERIAL) {
        if (reader) {
          await reader.cancel();
          reader.releaseLock();
        }

        if (serialPort) {
          await serialPort.close();
        }

        setSerialPort(null);
        setReader(null);
      } else if (connectionType === ConnectionType.BLUETOOTH) {
        if (bluetoothDevice) {
          await BleClient.disconnect(bluetoothDevice.deviceId);
        }

        setBluetoothDevice(null);
      }

      setIsConnected(false);
      setConnectionType(null);
      setConnectedDevice(null);
    } catch (error) {
      console.error("Disconnection error:", error);
    }
  };

  const sendCommand = async (command: string) => {
    if (connectionType === ConnectionType.SERIAL) {
      if (!serialPort) {
        throw new Error("Not connected to any serial device");
      }

      const writer = serialPort.writable.getWriter();
      const encoder = new TextEncoder();

      try {
        await writer.write(encoder.encode(command + "\r\n"));
      } catch (error) {
        console.error("Write error:", error);
        throw error;
      } finally {
        writer.releaseLock();
      }
    } else if (connectionType === ConnectionType.BLUETOOTH) {
      if (!bluetoothDevice) {
        throw new Error("Not connected to any Bluetooth device");
      }

      // Here you would implement the specific Bluetooth command protocol.
      // This depends on your device's services and characteristics.
      console.log("Sending Bluetooth command:", command);

      // Example implementation - would need to be customized based on your device:
      // const SERVICE_UUID = "your_service_uuid";
      // const CHARACTERISTIC_UUID = "your_characteristic_uuid";
      // const encoder = new TextEncoder();
      // const data = encoder.encode(command + "\r\n");
      // await BleClient.write(
      //   bluetoothDevice.deviceId,
      //   SERVICE_UUID,
      //   CHARACTERISTIC_UUID,
      //   data
      // );

      throw new Error("Bluetooth command sending not implemented yet");
    } else {
      throw new Error("Not connected to any device");
    }
  };

  return (
    <ConnectionContext.Provider
      value={{
        isConnected,
        serialPort,
        bluetoothDevice,
        connectionType,
        connectedDevice,
        connect,
        disconnect,
        sendCommand,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
};

export const useConnection = () => {
  const context = useContext(ConnectionContext);
  if (context === undefined) {
    throw new Error("useConnection must be used within a ConnectionProvider");
  }
  return context;
};
