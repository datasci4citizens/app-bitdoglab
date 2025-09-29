import { Header } from "@/components/Header";
import { useConnection } from "@/contexts/ConnectionContext";
import { useEffect } from "react";

export default function Snake() {
  const { sendCommand } = useConnection();

  // useEffect para controlar o início e o fim do jogo
  useEffect(() => {
    // Função a ser executada quando o componente é montado (entra na tela)
    const startGame = async () => {
      console.log("Iniciando o jogo Snake...");
      await sendCommand("snake_start()");
    };

    startGame();

    // Função de limpeza a ser executada quando o componente é desmontado (sai da tela)
    return () => {
      console.log("Parando o jogo Snake...");
      sendCommand("snake_stop()");
    };
  }, [sendCommand]); // A dependência garante que a função sendCommand esteja disponível

  return (
    <div className="flex flex-col bg-background min-h-screen">
      <Header title="Snake" showIdeaButton={false} />
      <main className="h-screen flex flex-col items-center justify-center gap-3.5">
        <h2 className="text-ubuntu font-bold text-md mb-5 text-heading">
          Jogo da cobrinha em andamento
        </h2>
        <h2 className="text-ubuntu font-bold text-md mb-5 text-heading">
          Mexa-se com o joystick
        </h2>
        <h2 className="text-ubuntu font-bold text-md mb-5 text-heading">
          Pressione o joystick para reiniciar
        </h2>
      </main>
    </div>
  );
}