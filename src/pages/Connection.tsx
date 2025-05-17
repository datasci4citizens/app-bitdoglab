import { useState } from "react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import { useConnection, ConnectionType } from "../contexts/ConnectionContext";

export default function Connection() {
  const navigate = useNavigate();
  const { isConnected, connect, disconnect, connectedDevice, connectionType } =
    useConnection();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSerialConnection = async () => {
    if (isConnected) {
      try {
        setLoading(true);
        await disconnect();
        setError(null);
      } catch (err) {
        setError("Falha ao desconectar");
      } finally {
        setLoading(false);
      }
    } else {
      try {
        setLoading(true);
        setError(null);
        await connect(ConnectionType.SERIAL);
        navigate("/components");
      } catch (err: any) {
        setError(err.message || "Falha ao conectar via porta serial");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBluetoothConnection = async () => {
    if (isConnected) {
      try {
        setLoading(true);
        await disconnect();
        setError(null);
      } catch (err) {
        setError("Falha ao desconectar");
      } finally {
        setLoading(false);
      }
    } else {
      try {
        setLoading(true);
        setError(null);
        await connect(ConnectionType.BLUETOOTH);
        navigate("/components");
      } catch (err: any) {
        setError(err.message || "Falha ao conectar via bluetooth");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-3.5 px-4">
      <h1 className="text-ubuntu font-medium text-lg text-center mb-2">
        {isConnected
          ? `Você está conectado ${
              connectedDevice?.name ? `à "${connectedDevice.name}"` : "à placa"
            } via ${
              connectionType === ConnectionType.SERIAL ? "cabo" : "bluetooth"
            }`
          : "Antes de começar, conecte-se com a placa escolhendo uma das opções abaixo"}
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded w-full max-w-md">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 mt-2">
        <Button
          onClick={handleSerialConnection}
          disabled={
            loading || (isConnected && connectionType !== ConnectionType.SERIAL)
          }
          variant={
            isConnected && connectionType === ConnectionType.SERIAL
              ? "destructive"
              : "default"
          }
          className="min-w-[180px]"
        >
          {loading && connectionType === ConnectionType.SERIAL
            ? "Processando..."
            : isConnected && connectionType === ConnectionType.SERIAL
            ? "Desconectar Cabo"
            : "Conectar via Cabo"}
        </Button>

        <Button
          onClick={handleBluetoothConnection}
          disabled={
            loading ||
            (isConnected && connectionType !== ConnectionType.BLUETOOTH)
          }
          variant={
            isConnected && connectionType === ConnectionType.BLUETOOTH
              ? "destructive"
              : "default"
          }
          className="min-w-[180px]"
        >
          {loading && connectionType === ConnectionType.BLUETOOTH
            ? "Processando..."
            : isConnected && connectionType === ConnectionType.BLUETOOTH
            ? "Desconectar Bluetooth"
            : "Conectar via Bluetooth"}
        </Button>
      </div>

      {isConnected && (
        <Button
          onClick={() => navigate("/components")}
          className="mt-6 min-w-[200px]"
        >
          Continuar para Componentes
        </Button>
      )}
    </div>
  );
}
