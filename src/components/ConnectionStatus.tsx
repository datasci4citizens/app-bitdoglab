import { useConnection, ConnectionType } from "../contexts/ConnectionContext";

export const ConnectionStatus = () => {
  const { isConnected, connectionType, connectedDevice } = useConnection();

  return (
    <div
      className="fixed top-2 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full text-xs font-medium z-50 flex items-center gap-1"
      style={{
        backgroundColor: isConnected
          ? "rgba(0, 200, 0, 0.2)"
          : "rgba(200, 0, 0, 0.2)",
        color: isConnected ? "rgb(0, 100, 0)" : "rgb(100, 0, 0)",
      }}
    >
      <div
        className="w-2 h-2 rounded-full"
        style={{
          backgroundColor: isConnected ? "rgb(0, 180, 0)" : "rgb(180, 0, 0)",
        }}
      />
      {isConnected ? (
        <span>
          Conectado{" "}
          {connectionType === ConnectionType.BLUETOOTH
            ? "via Bluetooth"
            : "via Cabo"}
          {connectedDevice?.name &&
          connectedDevice.name !== "Unknown Bluetooth Device" &&
          connectionType === ConnectionType.BLUETOOTH
            ? ` (${connectedDevice.name})`
            : ""}
        </span>
      ) : (
        "Desconectado"
      )}
    </div>
  );
};
