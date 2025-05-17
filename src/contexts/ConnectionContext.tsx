import React, { createContext, useState, useContext, useEffect } from "react";
import { BluetoothSerial } from "@awesome-cordova-plugins/bluetooth-serial";

// Extend the Navigator type to include the serial property
declare global {
  interface Navigator {
    serial?: {
      requestPort: () => Promise<any>;
    };
  }
}

interface ConnectionContextType {
  isConnected: boolean;
  serialPort: any;
  connectionType: "cable" | "bluetooth" | null;
  connect: (type: "cable" | "bluetooth") => Promise<void>;
  disconnect: () => Promise<void>;
  sendCommand: (command: string) => Promise<void>;
  bluetoothDevices: Array<{ name: string; address: string }>;
  scanBluetoothDevices: () => Promise<void>;
  connectBluetoothDevice: (address: string) => Promise<void>;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(
  undefined
);

export const ConnectionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [serialPort, setSerialPort] = useState<any>(null);
  const [reader, setReader] = useState<any>(null);
  const [connectionType, setConnectionType] = useState<
    "cable" | "bluetooth" | null
  >(null);
  const [bluetoothDevices, setBluetoothDevices] = useState<
    Array<{ name: string; address: string }>
  >([]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isConnected) {
        disconnect();
      }
    };
  }, []);

  const connect = async (type: "cable" | "bluetooth") => {
    if (type === "cable") {
      await connectViaCable();
    } else {
      await scanBluetoothDevices();
      // A conexão Bluetooth específica será feita depois que o usuário escolher um dispositivo
    }
    setConnectionType(type);
  };

  const connectViaCable = async () => {
    try {
      if (!navigator.serial) {
        throw new Error("Web Serial API not supported in this browser");
      }

      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });

      setSerialPort(port);
      setIsConnected(true);

      // Start reading from the serial port
      readFromSerialCable(port);
    } catch (error) {
      console.error("Cable connection error:", error);
      setIsConnected(false);
      throw error;
    }
  };

  const scanBluetoothDevices = async () => {
    try {
      // Verifica se o Bluetooth está habilitado
      await BluetoothSerial.isEnabled();

      // Lista os dispositivos pareados
      const devices = await BluetoothSerial.list();
      setBluetoothDevices(devices);

      return devices;
    } catch (error) {
      console.error("Error scanning Bluetooth devices:", error);

      // Se o Bluetooth não estiver habilitado, tenta habilitá-lo
      if (error === "Bluetooth is not enabled") {
        try {
          await BluetoothSerial.enable();
          return scanBluetoothDevices();
        } catch (enableError) {
          console.error("Error enabling Bluetooth:", enableError);
          throw enableError;
        }
      }

      throw error;
    }
  };

  const connectBluetoothDevice = async (address: string) => {
    try {
      await BluetoothSerial.connect(address);
      setIsConnected(true);
      setConnectionType("bluetooth");

      // Inicia a leitura dos dados do dispositivo Bluetooth
      readFromBluetoothSerial();
    } catch (error) {
      console.error("Error connecting to Bluetooth device:", error);
      setIsConnected(false);
      throw error;
    }
  };

  const readFromSerialCable = async (port: any) => {
    if (!port) return;

    const reader = port.readable.getReader();
    setReader(reader);
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        console.log("Received from cable:", decoder.decode(value));
      }
    } catch (error) {
      console.error("Read error from cable:", error);
    } finally {
      reader.releaseLock();
    }
  };

  const readFromBluetoothSerial = async () => {
    // Subscreve para receber dados do dispositivo Bluetooth
    BluetoothSerial.subscribe("\n").subscribe(
      (data) => {
        console.log("Received from Bluetooth:", data);
      },
      (error) => {
        console.error("Error reading from Bluetooth:", error);
      }
    );
  };

  const disconnect = async () => {
    try {
      if (connectionType === "cable") {
        if (reader) {
          await reader.cancel();
          reader.releaseLock();
        }

        if (serialPort) {
          await serialPort.close();
        }
      } else if (connectionType === "bluetooth") {
        await BluetoothSerial.disconnect();
      }

      setSerialPort(null);
      setReader(null);
      setIsConnected(false);
      setConnectionType(null);
    } catch (error) {
      console.error("Disconnection error:", error);
    }
  };

  const sendCommand = async (command: string) => {
    if (!isConnected) {
      throw new Error("Not connected to any device");
    }

    try {
      if (connectionType === "cable") {
        const writer = serialPort.writable.getWriter();
        const encoder = new TextEncoder();

        try {
          await writer.write(encoder.encode(command + "\r\n"));
        } finally {
          writer.releaseLock();
        }
      } else if (connectionType === "bluetooth") {
        await BluetoothSerial.write(command + "\r\n");
      }
    } catch (error) {
      console.error("Write error:", error);
      throw error;
    }
  };

  return (
    <ConnectionContext.Provider
      value={{
        isConnected,
        serialPort,
        connectionType,
        connect,
        disconnect,
        sendCommand,
        bluetoothDevices,
        scanBluetoothDevices,
        connectBluetoothDevice,
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
