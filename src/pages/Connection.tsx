import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import { useConnection } from "../contexts/ConnectionContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { PermissionsUtil } from "../utils/permissionsUtil";
import bluetooth from "../assets/imgs/bluetooth.png";

export default function Connection() {
  const navigate = useNavigate();
  const {
    isConnected,
    connect,
    disconnect,
    connectionType,
    bluetoothDevices,
    scanBluetoothDevices,
    connectBluetoothDevice,
  } = useConnection();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeviceList, setShowDeviceList] = useState(false);
  const [scanningDevices, setScanningDevices] = useState(false);

  const [bluetoothAvailable, setBluetoothAvailable] = useState<boolean | null>(
    null
  );

  // Verificar disponibilidade do Bluetooth quando a página carregar
  useEffect(() => {
    const checkBluetoothAvailability = async () => {
      try {
        const isAvailable = await PermissionsUtil.isBluetoothAvailable();
        setBluetoothAvailable(isAvailable);
      } catch (error) {
        console.error("Erro ao verificar disponibilidade do Bluetooth:", error);
        setBluetoothAvailable(false);
      }
    };

    checkBluetoothAvailability();
  }, []);

  const handleConnectionChoice = async (type: "cable" | "bluetooth") => {
    try {
      setLoading(true);
      setError(null);

      if (type === "cable") {
        await connect("cable");
        setShowDialog(false);
        navigate("/components");
      } else {
        // Verificar permissões antes de tentar conectar via Bluetooth
        const permissionsGranted =
          await PermissionsUtil.checkAllBluetoothPermissions();
        if (!permissionsGranted) {
          throw new Error(
            "Não foi possível obter as permissões necessárias para usar o Bluetooth."
          );
        }

        // Verifica se o Bluetooth está ativado
        const bluetoothEnabled = await PermissionsUtil.checkBluetoothEnabled();
        if (!bluetoothEnabled) {
          throw new Error("Por favor, ative o Bluetooth para continuar.");
        }

        await connect("bluetooth");
        setShowDeviceList(true);
        setScanningDevices(true);
        await scanBluetoothDevices();
        setScanningDevices(false);
      }
    } catch (err: any) {
      setError(
        err.message ||
          `Falha ao conectar via ${type === "cable" ? "cabo" : "bluetooth"}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConnectToDevice = async (address: string) => {
    try {
      setLoading(true);
      setError(null);
      await connectBluetoothDevice(address);
      setShowDialog(false);
      setShowDeviceList(false);
      navigate("/components");
    } catch (err: any) {
      setError(err.message || "Falha ao conectar ao dispositivo Bluetooth");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      await disconnect();
      setError(null);
    } catch (err: any) {
      setError(err.message || "Falha ao desconectar");
    } finally {
      setLoading(false);
    }
  };

  const openConnectionDialog = () => {
    setShowDialog(true);
    setShowDeviceList(false);
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-3.5">
      <h1 className="text-ubuntu px-8 font-medium text-lg text-center">
        {isConnected
          ? `Você está conectado à placa via ${
              connectionType === "cable" ? "cabo" : "bluetooth"
            }`
          : "Antes de começar, primeiro conecte-se com a placa"}
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {!isConnected ? (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button onClick={openConnectionDialog}>Conectar</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-center mb-4">
                Escolha o método de conexão
              </DialogTitle>
            </DialogHeader>

            {!showDeviceList ? (
              <div className="grid grid-cols-2 gap-4">
                <Card
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleConnectionChoice("cable")}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-center text-lg">Cabo</CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <svg
                      width="64"
                      height="64"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 11V21M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3M12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <CardDescription className="text-center">
                      Conexão via cabo USB
                    </CardDescription>
                  </CardFooter>
                </Card>

                <Card
                  className={`cursor-pointer hover:bg-gray-50 ${
                    bluetoothAvailable === false ? "opacity-50" : ""
                  }`}
                  onClick={() =>
                    bluetoothAvailable
                      ? handleConnectionChoice("bluetooth")
                      : setError("Bluetooth não disponível neste dispositivo")
                  }
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-center text-lg">
                      Bluetooth
                    </CardTitle>
                    {bluetoothAvailable === false && (
                      <span className="text-xs text-red-500 text-center">
                        Não disponível
                      </span>
                    )}
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <img
                      src={bluetooth}
                      alt="Bluetooth"
                      className="w-16 h-16"
                    />
                  </CardContent>
                  <CardFooter className="pt-2">
                    <CardDescription className="text-center">
                      Conexão sem fio via Bluetooth
                    </CardDescription>
                  </CardFooter>
                </Card>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <h2 className="text-lg font-medium text-center">
                  Dispositivos Bluetooth
                </h2>
                {scanningDevices ? (
                  <div className="flex justify-center items-center p-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    <span className="ml-2">Buscando dispositivos...</span>
                  </div>
                ) : (
                  <>
                    {bluetoothDevices.length === 0 ? (
                      <div className="text-center p-4">
                        <p>Nenhum dispositivo Bluetooth encontrado.</p>
                        <Button
                          onClick={() => scanBluetoothDevices()}
                          className="mt-4"
                        >
                          Buscar novamente
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 max-h-60 overflow-auto">
                        {bluetoothDevices.map((device) => (
                          <Card
                            key={device.address}
                            className="cursor-pointer hover:bg-gray-50"
                            onClick={() =>
                              handleConnectToDevice(device.address)
                            }
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center">
                                <img
                                  src={bluetooth}
                                  alt="Bluetooth"
                                  className="w-6 h-6 mr-2"
                                />
                                <div>
                                  <p className="font-medium">
                                    {device.name || "Dispositivo desconhecido"}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {device.address}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                    <Button
                      onClick={() => setShowDeviceList(false)}
                      variant="outline"
                      className="mt-2"
                    >
                      Voltar
                    </Button>
                  </>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      ) : (
        <>
          <Button
            onClick={handleDisconnect}
            disabled={loading}
            variant="destructive"
          >
            {loading ? "Processando..." : "Desconectar"}
          </Button>

          <Button onClick={() => navigate("/components")} className="mt-2">
            Continuar para Componentes
          </Button>
        </>
      )}
    </div>
  );
}
