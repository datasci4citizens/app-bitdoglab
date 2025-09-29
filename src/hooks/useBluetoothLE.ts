import { useState, useEffect, useCallback, useRef } from 'react';
import { BleClient, textToDataView, type BleDevice } from '@capacitor-community/bluetooth-le';

// UUIDs que estão no firmware da placa
const PICO_SERVICE_UUID = "71153466-1910-4388-A310-000B17D061AB";
const COMMAND_CHAR_UUID = "834E4EDC-2012-42AB-B3D7-001B17D061AB";

export function useBluetoothLE() {
  // Estados reativos do hook
  const [devices, setDevices] = useState<BleDevice[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<BleDevice | undefined>();
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mtu, setMtu] = useState<number>(23); // MTU padrão, será atualizado após conexão

  // useRef para manter referências que não precisam causar re-render
  const deviceObjectRef = useRef<BleDevice | undefined>(undefined);
  const scanTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Função de callback para desconexão
  const onDisconnect = useCallback((deviceId: string) => {
    console.log(`device ${deviceId} disconnected`);
    setIsConnected(false);
    setConnectedDevice(undefined);
    setMtu(23); // Reset MTU para valor padrão
    deviceObjectRef.current = undefined;
  }, []);

  // Função de scan
  const scan = useCallback(async () => {
    if (isScanning) {
      console.log('Scan já está em andamento');
      return;
    }

    try {
      setError(null);
      setIsScanning(true);
      setDevices([]); // Limpa a lista anterior

      await BleClient.initialize({ androidNeverForLocation: true });
      console.log('Requesting BLE scan...');

      await BleClient.requestLEScan(
        {
            // Filtra por BitDogLab
            namePrefix: 'BitDogLab'
        },
        (result) => {
          console.log('Received new scan result: ', result.device.name);
          
          // Adiciona o dispositivo à lista, evitando duplicatas
          setDevices(prevDevices => {
            const exists = prevDevices.find(d => d.deviceId === result.device.deviceId);
            if (exists) return prevDevices;
            return [...prevDevices, result.device];
          });
        }
      );

      // Para o scan após 5 segundos
      scanTimeoutRef.current = setTimeout(async () => {
        try {
          await BleClient.stopLEScan();
          console.log('Stopped scanning');
          setIsScanning(false);
        } catch (error) {
          console.error('Erro ao parar o scan:', error);
          setIsScanning(false);
        }
      }, 5000);

    } catch (error) {
      console.error('Erro no scan:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido no scan');
      setIsScanning(false);
    }
  }, [isScanning]);

  // Função de conexão
  const connect = useCallback(async (device: BleDevice): Promise<boolean> => {
    try {
      setError(null);
      
      await BleClient.connect(device.deviceId, (deviceId) => onDisconnect(deviceId));
      console.log('connected to device', device.name);
      
      // Obtém o MTU real da conexão
      try {
        const deviceMtu = await BleClient.getMtu(device.deviceId);
        setMtu(deviceMtu);
        console.log(`📡 MTU obtido: ${deviceMtu} bytes`);
      } catch (mtuError) {
        console.warn('Não foi possível obter MTU, usando padrão:', mtuError);
        setMtu(23); // Fallback para MTU padrão
      }
      
      setConnectedDevice(device);
      setIsConnected(true);
      deviceObjectRef.current = device;
      
      return true;
    } catch (error) {
      console.error('Erro na conexão:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido na conexão');
      setIsConnected(false);
      setConnectedDevice(undefined);
      deviceObjectRef.current = undefined;
      return false;
    }
  }, [onDisconnect]);

  // Função de desconexão manual
  const disconnect = useCallback(async (): Promise<boolean> => {
    if (!deviceObjectRef.current) {
      console.log('Nenhum dispositivo conectado para desconectar');
      return false;
    }

    try {
      await BleClient.disconnect(deviceObjectRef.current.deviceId);
      console.log('Dispositivo desconectado');
      return true;
    } catch (error) {
      console.error('Erro ao desconectar:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido na desconexão');
      return false;
    }
  }, []);

  // Função de envio de dados OTIMIZADA com MTU real
  const writeData = useCallback(async (data: string): Promise<boolean> => {
    if (!deviceObjectRef.current || !isConnected) {
      const errorMsg = "Nenhum dispositivo conectado para enviar dados.";
      console.error(errorMsg);
      setError(errorMsg);
      return false;
    }

    // Calcula o tamanho do chunk baseado no MTU real
    // Reserva alguns bytes para overhead do protocolo BLE
    const PROTOCOL_OVERHEAD = 3; // ATT header overhead
    const CHUNK_SIZE = Math.max(mtu - PROTOCOL_OVERHEAD, 20); // Mínimo de 20 para compatibilidade
    const END_OF_TRANSMISSION_SIGNAL = "_EOT_";

    try {
      setError(null);
      console.log(`📤 Enviando comando (${data.length} bytes) usando chunks de ${CHUNK_SIZE} bytes (MTU: ${mtu})`);

      // Se o comando for pequeno o suficiente, envia de uma vez
      if (data.length <= CHUNK_SIZE) {
        console.log('📦 Comando pequeno - enviando em pacote único');
        
        const dataToSend = textToDataView(data);
        await BleClient.write(
          deviceObjectRef.current.deviceId,
          PICO_SERVICE_UUID,
          COMMAND_CHAR_UUID,
          dataToSend
        );

        // Sinal de fim (sempre necessário para o firmware)
        await new Promise(resolve => setTimeout(resolve, 10)); // Pequeno delay
        const finalSignal = textToDataView(END_OF_TRANSMISSION_SIGNAL);
        await BleClient.write(
          deviceObjectRef.current.deviceId,
          PICO_SERVICE_UUID,
          COMMAND_CHAR_UUID,
          finalSignal
        );

        console.log('✅ Comando enviado com sucesso em pacote único.');
        return true;
      }

      // Para comandos maiores, quebra em chunks otimizados
      console.log('📦 Comando grande - enviando em múltiplos chunks');
      const totalChunks = Math.ceil(data.length / CHUNK_SIZE);
      
      for (let i = 0; i < data.length; i += CHUNK_SIZE) {
        const chunkIndex = Math.floor(i / CHUNK_SIZE) + 1;
        const chunk = data.substring(i, i + CHUNK_SIZE);
        const dataToSend = textToDataView(chunk);

        console.log(`📤 Enviando chunk ${chunkIndex}/${totalChunks} (${chunk.length} bytes)`);

        await BleClient.write(
          deviceObjectRef.current.deviceId,
          PICO_SERVICE_UUID,
          COMMAND_CHAR_UUID,
          dataToSend
        );
        
        // Delay menor devido ao MTU maior
        await new Promise(resolve => setTimeout(resolve, 2));
      }

      // Após enviar todos os pedaços, envia o sinal de fim
      console.log('📤 Enviando sinal de fim de transmissão');
      const finalSignal = textToDataView(END_OF_TRANSMISSION_SIGNAL);
      await BleClient.write(
        deviceObjectRef.current.deviceId,
        PICO_SERVICE_UUID,
        COMMAND_CHAR_UUID,
        finalSignal
      );

      console.log('✅ Comando enviado com sucesso em múltiplos chunks.');
      return true;
    } catch (error) {
      console.error('❌ Falha ao enviar comando', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido no envio');
      return false;
    }
  }, [isConnected, mtu]);

  // 🧹 Cleanup quando o componente é desmontado
  useEffect(() => {
    return () => {
      // Para o scan se estiver rodando
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
      
      // Para o scan BLE se estiver ativo
      if (isScanning) {
        BleClient.stopLEScan().catch(console.error);
      }
      
      // Desconecta se estiver conectado
      if (deviceObjectRef.current && isConnected) {
        BleClient.disconnect(deviceObjectRef.current.deviceId).catch(console.error);
      }
    };
  }, [isScanning, isConnected]);

  // 🎯 Retorna o estado e as funções para o componente
  return {
    // Estados
    devices,
    isConnected,
    connectedDevice,
    isScanning,
    error,
    mtu, // Exposição do MTU para debug/info
    
    // Funções
    scan,
    connect,
    disconnect,
    writeData,
    
    // Função utilitária para limpar erros
    clearError: useCallback(() => setError(null), [])
  };
}