import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";

interface SerialContextType {
  serialPort: SerialPort | null;
  isConnected: boolean;
  connectToDevice: () => Promise<boolean>;
  sendCommand: (command: string) => Promise<void>;
  readFromDevice: (callback: (data: string) => void) => Promise<void>;
  disconnectDevice: () => Promise<void>;
  lastResponse: string;
}

const SerialContext = createContext<SerialContextType | undefined>(undefined);

export const SerialProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [serialPort, setSerialPort] = useState<SerialPort | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [reader, setReader] = useState<ReadableStreamDefaultReader | null>(
    null
  );
  const [lastResponse, setLastResponse] = useState<string>("");

  // Limpar conexão quando o componente for desmontado
  useEffect(() => {
    return () => {
      disconnectDevice();
    };
  }, []);

  const connectToDevice = async (): Promise<boolean> => {
    try {
      // Verificar se já existe uma conexão
      if (serialPort && isConnected) {
        console.log("Conexão já estabelecida");
        return true;
      }

      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });

      setSerialPort(port);
      setIsConnected(true);
      console.log("Conectado ao dispositivo!");

      // Iniciar leitura automática
      readFromDevice((data) => {
        console.log("Resposta recebida:", data);
        setLastResponse(data);
      });

      return true;
    } catch (error) {
      console.error("Erro ao conectar:", error);
      setIsConnected(false);
      return false;
    }
  };

  const sendCommand = async (command: string): Promise<void> => {
    if (!serialPort || !isConnected) {
      console.error("Não há conexão com o dispositivo");
      return;
    }

    const writer = serialPort.writable.getWriter();
    const encoder = new TextEncoder();

    try {
      await writer.write(encoder.encode(command + "\r\n"));
      console.log(`Comando enviado: ${command}`);
    } catch (error) {
      console.error("Erro ao enviar comando:", error);
    } finally {
      writer.releaseLock();
    }
  };

  const readFromDevice = async (
    callback: (data: string) => void
  ): Promise<void> => {
    if (!serialPort || !isConnected) {
      console.error("Não há conexão com o dispositivo");
      return;
    }

    try {
      // Liberar o leitor anterior, se existir
      if (reader) {
        await reader.cancel();
        reader.releaseLock();
      }

      const newReader = serialPort.readable.getReader();
      setReader(newReader);
      const decoder = new TextDecoder();

      // Iniciar um loop de leitura em segundo plano
      const readLoop = async () => {
        try {
          while (true) {
            const { value, done } = await newReader.read();
            if (done) break;

            const decodedValue = decoder.decode(value);
            callback(decodedValue);
          }
        } catch (error) {
          console.error("Erro na leitura:", error);
        }
      };

      // Executar o loop de leitura sem aguardar (em segundo plano)
      readLoop();
    } catch (error) {
      console.error("Erro ao configurar a leitura:", error);
    }
  };

  const disconnectDevice = async (): Promise<void> => {
    if (reader) {
      try {
        await reader.cancel();
        reader.releaseLock();
        setReader(null);
      } catch (error) {
        console.error("Erro ao liberar o leitor:", error);
      }
    }

    if (serialPort && isConnected) {
      try {
        await serialPort.close();
        console.log("Desconectado do dispositivo");
      } catch (error) {
        console.error("Erro ao desconectar:", error);
      } finally {
        setSerialPort(null);
        setIsConnected(false);
      }
    }
  };

  return (
    <SerialContext.Provider
      value={{
        serialPort,
        isConnected,
        connectToDevice,
        sendCommand,
        readFromDevice,
        disconnectDevice,
        lastResponse,
      }}
    >
      {children}
    </SerialContext.Provider>
  );
};

// Hook personalizado para usar o contexto
export const useSerial = (): SerialContextType => {
  const context = useContext(SerialContext);
  if (context === undefined) {
    throw new Error("useSerial deve ser usado dentro de um SerialProvider");
  }
  return context;
};
