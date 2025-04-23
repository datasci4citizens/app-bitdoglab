import { useState } from "react";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import { useSerial } from "../contexts/SerialContext";

export default function Connection() {
  const navigate = useNavigate();
  const { connectToDevice, isConnected } = useSerial();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const handleConnect = async () => {
    setIsConnecting(true);
    setConnectionError(null);

    try {
      const success = await connectToDevice();

      if (success) {
        navigate("/components");
      } else {
        setConnectionError(
          "Não foi possível estabelecer conexão com o dispositivo."
        );
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
      setConnectionError("Ocorreu um erro ao tentar conectar ao dispositivo.");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
        gap: "20px",
      }}
    >
      <h1>Conecte-se a placa para começar</h1>

      {connectionError && (
        <div style={{ color: "red", marginBottom: "10px" }}>
          {connectionError}
        </div>
      )}

      <Button onClick={handleConnect} disabled={isConnecting || isConnected}>
        {isConnecting
          ? "Conectando..."
          : isConnected
          ? "Conectado"
          : "Conectar"}
      </Button>

      {isConnected && (
        <Button onClick={() => navigate("/components")}>
          Continuar para Componentes
        </Button>
      )}
    </div>
  );
}
