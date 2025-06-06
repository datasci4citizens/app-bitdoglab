import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export enum ConnectionType {
  CABLE = "cable",
  BLUETOOTH = "bluetooth",
  NONE = "none",
}

interface BluetoothDevice {
  id: string;
  name: string;
  address: string;
}

interface ConnectionContextType {
  isConnected: boolean;
  connectionType: ConnectionType;
  serialPort: any;
  availableDevices: BluetoothDevice[];
  connectionHealth: "healthy" | "checking" | "lost";
  connectCable: () => Promise<void>;
  connectBluetooth: (deviceId: string) => Promise<void>;
  disconnect: () => Promise<void>;
  sendCommand: (command: string) => Promise<void>;
  scanBluetoothDevices: () => Promise<void>;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(
  undefined
);

export const ConnectionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();

  const [isConnected, setIsConnected] = useState(false);
  const [connectionType, setConnectionType] = useState<ConnectionType>(
    ConnectionType.NONE
  );
  const [serialPort, setSerialPort] = useState<any>(null);
  const [reader, setReader] = useState<any>(null);
  const [availableDevices, setAvailableDevices] = useState<BluetoothDevice[]>(
    []
  );

  // Estados do heartbeat
  const [heartbeatInterval, setHeartbeatInterval] =
    useState<NodeJS.Timeout | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [connectionHealth, setConnectionHealth] = useState<
    "healthy" | "checking" | "lost"
  >("healthy");
  const [awaitingPong, setAwaitingPong] = useState(false);

  // Parser de mensagens
  const parseMessage = (data: string) => {
    if (data.startsWith("HB_")) {
      if (data.trim() === "HB_PONG") {
        handleHeartbeatResponse();
      }
    }
    // Outras mensagens são ignoradas por enquanto
  };

  // Sistema de Heartbeat
  const startHeartbeat = () => {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
    }

    setFailedAttempts(0);
    setConnectionHealth("healthy");

    const interval = setInterval(() => {
      sendHeartbeatPing();
    }, 3000);

    setHeartbeatInterval(interval);
  };

  const stopHeartbeat = () => {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      setHeartbeatInterval(null);
    }
    setFailedAttempts(0);
    setAwaitingPong(false);
    setConnectionHealth("healthy");
  };

  const sendHeartbeatPing = async () => {
    try {
      setConnectionHealth("checking");
      setAwaitingPong(true);
      await sendCommand("HB_PING");

      // Timeout para verificar se não recebeu resposta
      setTimeout(() => {
        if (awaitingPong) {
          handleHeartbeatTimeout();
        }
      }, 3000);
    } catch (error) {
      console.error("Erro ao enviar heartbeat:", error);
      handleHeartbeatTimeout();
    }
  };

  const handleHeartbeatResponse = () => {
    setAwaitingPong(false);
    setFailedAttempts(0);
    setConnectionHealth("healthy");
  };

  const handleHeartbeatTimeout = () => {
    if (!awaitingPong) return; // Já recebeu resposta

    setAwaitingPong(false);
    const newFailedAttempts = failedAttempts + 1;
    setFailedAttempts(newFailedAttempts);

    if (newFailedAttempts >= 2) {
      // Conexão perdida
      setConnectionHealth("lost");
      stopHeartbeat();
      setIsConnected(false);
      setConnectionType(ConnectionType.NONE);
      navigate("/connection");
    }
  };

  // Função auxiliar para promisificar callbacks do bluetoothSerial
  const promisifyBluetoothCall = <T,>(
    fn: (...args: any[]) => void,
    ...args: any[]
  ): Promise<T> => {
    return new Promise((resolve, reject) => {
      fn(...args, resolve, reject);
    });
  };

  // Função para verificar se o Bluetooth está ativo
  const ensureBluetoothEnabled = async () => {
    try {
      await promisifyBluetoothCall(window.bluetoothSerial.isEnabled);
    } catch (error) {
      try {
        await promisifyBluetoothCall(window.bluetoothSerial.enable);
      } catch (error) {
        throw new Error("Por favor, ative o Bluetooth do dispositivo");
      }
    }
  };

  // Cable connection functions
  const connectCable = async () => {
    try {
      if (!navigator.serial) {
        throw new Error("Web Serial API não é suportada neste navegador");
      }

      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 }); // HC-05 geralmente usa 9600 baud rate por padrão

      setSerialPort(port);
      setConnectionType(ConnectionType.CABLE);
      setIsConnected(true);

      readFromSerial(port);
      startHeartbeat();
    } catch (error) {
      console.error("Erro na conexão Serial:", error);
      setIsConnected(false);
      throw error;
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
        parseMessage(decoder.decode(value));
      }
    } catch (error) {
      console.error("Erro na leitura Serial:", error);
    } finally {
      reader.releaseLock();
    }
  };

  const scanBluetoothDevices = async () => {
    try {
      await ensureBluetoothEnabled();

      const devices = await promisifyBluetoothCall<BluetoothDevice[]>(
        window.bluetoothSerial.list
      );

      console.log("Dispositivos encontrados:", devices);
      setAvailableDevices(devices);
    } catch (error) {
      console.error("Erro na busca Bluetooth:", error);
      throw new Error("Falha ao buscar dispositivos Bluetooth");
    }
  };

  const connectBluetooth = async (deviceId: string) => {
    try {
      if (isConnected) {
        await disconnect();
      }

      await ensureBluetoothEnabled();

      console.log("Conectando ao dispositivo:", deviceId);
      await promisifyBluetoothCall(window.bluetoothSerial.connect, deviceId);

      // Configurar recebimento de dados
      window.bluetoothSerial.subscribe(
        "\n",
        (data: string) => {
          parseMessage(data);
        },
        (error: any) => {
          console.error("Erro ao receber dados:", error);
        }
      );

      console.log("Conexão estabelecida!");
      setConnectionType(ConnectionType.BLUETOOTH);
      setIsConnected(true);
      startHeartbeat();
    } catch (error) {
      console.error("Erro na conexão Bluetooth:", error);
      setIsConnected(false);
      throw new Error("Falha ao conectar ao dispositivo Bluetooth");
    }
  };

  const disconnect = async () => {
    try {
      stopHeartbeat();

      if (connectionType === ConnectionType.CABLE) {
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
        try {
          // Primeiro tenta cancelar a subscrição
          await promisifyBluetoothCall(window.bluetoothSerial.unsubscribe);
        } catch (error) {
          console.warn("Erro ao cancelar subscrição:", error);
        }

        // Então desconecta
        await promisifyBluetoothCall(window.bluetoothSerial.disconnect);
      }

      setIsConnected(false);
      setConnectionType(ConnectionType.NONE);
    } catch (error) {
      console.error("Erro ao desconectar:", error);
      throw new Error("Falha ao desconectar do dispositivo");
    }
  };

  const sendCommand = async (command: string) => {
    if (!isConnected) {
      throw new Error("Não conectado a nenhum dispositivo");
    }

    try {
      if (connectionType === ConnectionType.CABLE) {
        const writer = serialPort.writable.getWriter();
        const encoder = new TextEncoder();

        try {
          await writer.write(encoder.encode(command + "\r\n"));
        } finally {
          writer.releaseLock();
        }
      } else if (connectionType === ConnectionType.BLUETOOTH) {
        await promisifyBluetoothCall(
          window.bluetoothSerial.write,
          command + "\r\n"
        );
      }
    } catch (error) {
      console.error("Erro ao enviar comando:", error);
      throw new Error("Falha ao enviar comando ao dispositivo");
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopHeartbeat();
      if (isConnected) {
        disconnect();
      }
    };
  }, []);

  return (
    <ConnectionContext.Provider
      value={{
        isConnected,
        connectionType,
        serialPort,
        availableDevices,
        connectionHealth,
        connectCable,
        connectBluetooth,
        disconnect,
        sendCommand,
        scanBluetoothDevices,
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
