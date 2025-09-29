import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { useNavigate } from "react-router-dom";
import { useConnection } from "../contexts/ConnectionContext";

type ConnectionType = "cable" | "bluetooth";

interface ConnectionState {
  loading: boolean;
  error: string | null;
  selectedConnectionType: ConnectionType;
  scanning: boolean;
  selectedDevice: string | null;
}

const INITIAL_STATE: ConnectionState = {
  loading: false,
  error: null,
  selectedConnectionType: "cable",
  scanning: false,
  selectedDevice: null,
};

const MESSAGES = {
  connected: "Você está conectado à placa",
  disconnected: "Antes de começar, primeiro conecte-se com a placa",
  selectDevice: "Selecione um dispositivo Bluetooth",
  scanningHint: "Isso pode levar alguns segundos...",
  noDevices: "Nenhum dispositivo encontrado",
  availableDevices: "Dispositivos disponíveis:",
  connectionMethod: "Escolha o método de conexão:",
  continue: "Continuar para Componentes",
  errors: {
    scanFailed: "Falha ao buscar dispositivos Bluetooth",
    disconnectFailed: "Falha ao desconectar",
    connectFailed: "Falha ao conectar",
  },
  buttons: {
    processing: "Processando...",
    disconnect: "Desconectar",
    scanning: "Buscando...",
    scan: "Buscar dispositivos",
    connectCable: "Conectar via cabo",
    connectBluetooth: "Conectar via Bluetooth",
  },
  connectionTypes: {
    cable: "Conexão via cabo",
    bluetooth: "Conexão Bluetooth",
  },
} as const;

export default function Connection() {
  const navigate = useNavigate();
  const {
    isConnected,
    connectCable,
    connectBluetooth,
    disconnect,
    scanBluetoothDevices,
    availableDevices,
  } = useConnection();

  const [state, setState] = useState<ConnectionState>(INITIAL_STATE);

  const updateState = useCallback((updates: Partial<ConnectionState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  const handleScan = useCallback(async () => {
    try {
      updateState({ scanning: true, error: null });
      await scanBluetoothDevices();
    } catch (err: any) {
      updateState({ error: err.message || MESSAGES.errors.scanFailed });
    } finally {
      updateState({ scanning: false });
    }
  }, [scanBluetoothDevices, updateState]);

  const handleDisconnect = useCallback(async () => {
    try {
      updateState({ loading: true });
      await disconnect();
      clearError();
    } catch (err: any) {
      updateState({ error: err.message || MESSAGES.errors.disconnectFailed });
    } finally {
      updateState({ loading: false });
    }
  }, [disconnect, clearError, updateState]);

  const handleConnect = useCallback(async () => {
    try {
      updateState({ loading: true, error: null });

      if (state.selectedConnectionType === "cable") {
        await connectCable();
      } else {
        if (!state.selectedDevice) {
          updateState({ error: MESSAGES.selectDevice, loading: false });
          return;
        }
        await connectBluetooth(state.selectedDevice);
      }

      navigate("/components");
    } catch (err: any) {
      updateState({ error: err.message || MESSAGES.errors.connectFailed });
    } finally {
      updateState({ loading: false });
    }
  }, [state.selectedConnectionType, state.selectedDevice, connectCable, connectBluetooth, navigate, updateState]);

  const handleConnection = useCallback(() => {
    return isConnected ? handleDisconnect() : handleConnect();
  }, [isConnected, handleDisconnect, handleConnect]);

  const handleConnectionTypeChange = useCallback((type: ConnectionType) => {
    updateState({ selectedConnectionType: type, selectedDevice: null });
  }, [updateState]);

  const handleDeviceSelect = useCallback((deviceAddress: string) => {
    updateState({ selectedDevice: deviceAddress });
  }, [updateState]);

  const isConnectDisabled = useCallback(() => {
    return state.loading || (state.selectedConnectionType === "bluetooth" && !state.selectedDevice && !isConnected);
  }, [state.loading, state.selectedConnectionType, state.selectedDevice, isConnected]);

  const getConnectButtonText = useCallback(() => {
    if (state.loading) return MESSAGES.buttons.processing;
    if (isConnected) return MESSAGES.buttons.disconnect;
    return state.selectedConnectionType === "cable" 
      ? MESSAGES.buttons.connectCable 
      : MESSAGES.buttons.connectBluetooth;
  }, [state.loading, state.selectedConnectionType, isConnected]);

  const renderConnectionTypeSelector = () => (
    <div className="mb-4 my-2">
      <h2 className="text-ubuntu font-medium mb-2">{MESSAGES.connectionMethod}</h2>
      <div className="flex gap-4">
        <label className="flex items-center">
          <input
            type="radio"
            name="connectionType"
            checked={state.selectedConnectionType === "cable"}
            onChange={() => handleConnectionTypeChange("cable")}
            className="mr-2"
          />
          {MESSAGES.connectionTypes.cable}
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="connectionType"
            checked={state.selectedConnectionType === "bluetooth"}
            onChange={() => handleConnectionTypeChange("bluetooth")}
            className="mr-2"
          />
          {MESSAGES.connectionTypes.bluetooth}
        </label>
      </div>
    </div>
  );

  const renderBluetoothDeviceList = () => (
    <div className="mt-2 border rounded-md p-2 max-h-32 overflow-y-auto">
      <h3 className="text-sm font-semibold mb-1">{MESSAGES.availableDevices}</h3>
      {availableDevices.length === 0 ? (
        <p className="text-sm text-gray-500">{MESSAGES.noDevices}</p>
      ) : (
        <ul className="space-y-1">
          {availableDevices.map((device) => (
            <li key={device.address} className="flex items-center">
              <label className="flex items-center text-sm">
                <input
                  type="radio"
                  name="bluetoothDevice"
                  value={device.address}
                  checked={state.selectedDevice === device.address}
                  onChange={() => handleDeviceSelect(device.address)}
                  className="mr-2"
                />
                {device.name || device.id}
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const renderBluetoothSection = () => (
    <div className="mb-4 gap-2">
      <p className="text-ubuntu text-text justify-center font-medium text-md mb-1 mx-2">Antes de você clicar em buscar dispositivo, você deve ter pareado o bluetooth com o celular, só assim a opção aparecera aqui</p>
      <div className="flex items-center justify-center gap-2 mb-2">
        <Button
          onClick={handleScan}
          disabled={state.scanning}
          variant="outline"
          className="text-sm my-2"
        >
          {state.scanning ? MESSAGES.buttons.scanning : MESSAGES.buttons.scan}
        </Button>
        {state.scanning && (
          <span className="text-ubuntu text-sm text-gray-500 my-2">
            {MESSAGES.scanningHint}
          </span>
        )}
      </div>
      {renderBluetoothDeviceList()}
    </div>
  );

  const renderErrorMessage = () => state.error && (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      {state.error}
    </div>
  );

  const renderConnectionForm = () => !isConnected && (
    <div className="w-full max-w-md">
      {renderConnectionTypeSelector()}
      {state.selectedConnectionType === "bluetooth" && renderBluetoothSection()}
    </div>
  );

  const renderContinueButton = () => isConnected && (
    <Button onClick={() => navigate("/components")} className="mt-2">
      {MESSAGES.continue}
    </Button>
  );

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header title="" showIdeaButton={false} />
      <div className="h-screen flex flex-col items-center justify-center gap-3.5 p-4">
        <h1 className="text-ubuntu px-8 font-medium text-lg text-center my-2">
          {isConnected ? MESSAGES.connected : MESSAGES.disconnected}
        </h1>

        {renderErrorMessage()}
        {renderConnectionForm()}

        <Button
          onClick={handleConnection}
          disabled={isConnectDisabled()}
          variant={isConnected ? "destructive" : "default"}
        >
          {getConnectButtonText()}
        </Button>

        {renderContinueButton()}
      </div>
    </div>
  );
}