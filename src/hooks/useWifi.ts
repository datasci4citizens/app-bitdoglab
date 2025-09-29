// src/hooks/useWifi.ts
import { useState, useCallback } from "react";
import { TcpSocket } from "capacitor-tcp-socket";

interface Device {
  ip: string;
  port: number;
}

export function useWifi() {
  const [clientId, setClientId] = useState<number | null>(null);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const log = useCallback((msg: string) => {
    console.log(msg);
    setLogs((prev) => [...prev, msg]);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  // Conectar TCP direto com IP predefinido
  const connect = useCallback(async (device: Device) => {
    setIsConnecting(true);
    setError(null);
    
    try {
      log(`Tentando conectar em: ${device.ip}:${device.port}`);
      
      const result = await TcpSocket.connect({
        ipAddress: device.ip,
        port: device.port,
      });
      
      setClientId(result.client);
      setConnectedDevice(device);
      log(`Conectado com sucesso: ${device.ip}:${device.port}`);
      
      return true;
    } catch (error: any) {
      const errorMsg = `Falha ao conectar TCP: ${error.message || error}`;
      log(errorMsg);
      setError(errorMsg);
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [log]);

  // Enviar comando (terminado em \n)
  const send = useCallback(async (cmd: string): Promise<boolean> => {
    if (!clientId) {
      const errorMsg = "Não há conexão TCP ativa";
      log(errorMsg);
      setError(errorMsg);
      return false;
    }
    
    try {
      await TcpSocket.send({ client: clientId, data: cmd + "\n" });
      log(`Comando enviado: ${cmd}`);
      return true;
    } catch (error: any) {
      const errorMsg = `Falha ao enviar comando: ${error.message || error}`;
      log(errorMsg);
      setError(errorMsg);
      return false;
    }
  }, [clientId, log]);

  const read = useCallback(async (): Promise<string> => {
    if (!clientId) {
      log("Tentativa de leitura sem conexão ativa");
      return "";
    }
    
    try {
      const result = await TcpSocket.read({
        client: clientId,
        expectLen: 1024,
        timeout: 2,
      });
      log(`Dados recebidos TCP: ${result.result}`);
      return result.result ?? "";
    } catch (error: any) {
      log(`Falha ao ler resposta: ${error.message || error}`);
      return "";
    }
  }, [clientId, log]);

  const disconnect = useCallback(async (): Promise<boolean> => {
    if (!clientId) {
      log("Nenhuma conexão ativa para desconectar");
      return true;
    }
    
    try {
      await TcpSocket.disconnect({ client: clientId });
      setClientId(null);
      setConnectedDevice(null);
      log("Desconectado com sucesso");
      return true;
    } catch (error: any) {
      const errorMsg = `Falha ao desconectar: ${error.message || error}`;
      log(errorMsg);
      setError(errorMsg);
      // Mesmo com erro, limpa o estado
      setClientId(null);
      setConnectedDevice(null);
      return false;
    }
  }, [clientId, log]);

  // Função para enviar comando e aguardar resposta (para compatibilidade)
  const sendAndRead = useCallback(async (cmd: string): Promise<string> => {
    const sendSuccess = await send(cmd);
    if (!sendSuccess) return "";
    
    // Aguarda um pouco antes de ler a resposta
    await new Promise(resolve => setTimeout(resolve, 100));
    return await read();
  }, [send, read]);

  // Função de ping para testar conectividade
  const ping = useCallback(async (): Promise<boolean> => {
    const response = await sendAndRead("print('pong')");
    return response.includes('pong') || response.includes('OK');
  }, [sendAndRead]);

  return {
    // Estados
    isConnected: !!clientId,
    isConnecting,
    connectedDevice,
    logs,
    error,
    
    // Ações
    connect,
    send,
    read,
    sendAndRead,
    disconnect,
    ping,
    clearLogs,
    clearError,
  };
}