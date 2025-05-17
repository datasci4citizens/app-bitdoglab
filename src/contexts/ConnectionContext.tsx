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

      // Request a BLE device - incluindo filtro para facilitar encontrar o HC-05
      const device = await BleClient.requestDevice({
        // O HC-05 geralmente tem "HC-05" no nome
        namePrefix: "HC-05",
        // Podemos também especificar o UUID do serviço SPP, mas em alguns casos
        // o HC-05 não anuncia corretamente seus serviços
        services: ["00001101-0000-1000-8000-00805F9B34FB"],
      });

      console.log("Conectando ao dispositivo HC-05:", device);

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
        name: device.name || "Dispositivo HC-05",
        type: ConnectionType.BLUETOOTH,
      });

      console.log("Conectado com sucesso ao dispositivo HC-05");
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
        throw new Error("Não conectado a nenhum dispositivo Bluetooth");
      }

      // Implementação específica para HC-05 usando o serviço SPP
      console.log("Enviando comando Bluetooth:", command);

      try {
        const HC05_SERVICE_UUID = "00001101-0000-1000-8000-00805F9B34FB";
        const HC05_CHARACTERISTIC_UUID = "00001102-0000-1000-8000-00805F9B34FB";
        const encoder = new TextEncoder();
        const data = encoder.encode(command + "\r\n");
        const dataView = new DataView(data.buffer);

        // Tenta enviar usando o serviço SPP padrão
        await BleClient.write(
          bluetoothDevice.deviceId,
          HC05_SERVICE_UUID,
          HC05_CHARACTERISTIC_UUID,
          dataView
        );
      } catch (error) {
        console.error("Erro ao enviar comando via Bluetooth:", error);

        // Se o serviço padrão falhar, tenta descobrir os serviços disponíveis
        try {
          const services = await BleClient.getServices(
            bluetoothDevice.deviceId
          );
          if (services && services.length > 0) {
            const service = services[0];
            if (
              service &&
              service.characteristics &&
              service.characteristics.length > 0
            ) {
              const characteristic = service.characteristics.find(
                (c) => c.properties.write
              );
              if (characteristic) {
                const encoder = new TextEncoder();
                const data = encoder.encode(command + "\r\n");
                const dataView = new DataView(data.buffer);

                await BleClient.write(
                  bluetoothDevice.deviceId,
                  service.uuid,
                  characteristic.uuid,
                  dataView
                );
                return; // Comando enviado com sucesso
              }
            }
          }
          throw new Error(
            "Não foi possível encontrar uma característica para escrever"
          );
        } catch (secondError) {
          console.error("Falha na tentativa alternativa:", secondError);
          throw new Error("Falha ao enviar comando via Bluetooth: " + error);
        }
      }
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
