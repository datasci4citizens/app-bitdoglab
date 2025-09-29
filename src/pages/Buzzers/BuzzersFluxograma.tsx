import React, { useState } from "react";
import { Header } from "@/components/Header";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import FlowDiagram from "@/components/FlowDiagram";
import type { FlowStep } from "@/components/FlowDiagram";
import pressedPiaonKey from "@/assets/imgs/pressedpianokey.png";
import music from "@/assets/imgs/music.png";
import touch from "@/assets/imgs/touch.png";
import SemSom from "@/assets/imgs/SemSom.png";
import stop from "@/assets/imgs/stop_recording.png";
import unpressedPiaonKey from "@/assets/imgs/unpressedpianokey.png";
import DropdownSelector from "@/components/DropdownSelector";

export default function BuzzersTocarFluxograma(): React.ReactElement {
  const navigate = useNavigate();

  const components = [
    { id: "1", label: "Opção 1: Gravar e Tocar" },
    { id: "2", label: "Opção 2: Upload de arquivo" }
  ];

  const [selectedComponent, setSelectedComponent] = useState("1");

  // Definindo os passos do fluxograma com tipagem
  const flowSteps: FlowStep[] = [
    {
      icon: <Button variant="primary">Gravar</Button>,
      text: "Clicar em gravar (opcional)",
    },
    {
      icon: <img src={touch} alt="imagem touch"/>,
      text: "Usuário escolhe uma oitava",
    },
    {
      icon: <img src={pressedPiaonKey} className="w-16"/>,
      text: "Pressiona uma tecla do piano",
    },
    {
      icon: <img src={music} className="w-16"/>,
      text: "Placa começa a tocar a nota",
    },
    {
      icon: <img src={unpressedPiaonKey} className="w-16"/>,
      text: "Solta a tecla do piano",
    },
    {
      icon: <img src={SemSom} className="w-16"/>,
      text: "Placa para de tocar a nota",
    },
    {
      icon: <img src={stop} className="w-16"/>,
      text: "Para a gravação e o app salva um arquivo no celular",
    },
  ];

  const flowSteps2: FlowStep[] = [
    {
      icon: <Button variant="primary">Gravações</Button>,
      text: "Fazer upload de arquivo no aplicativo",
    },
    {
      icon: <img src={music} className="w-16"/>,
      text: "Placa reproduz a sequência gravada",
    },
  ];

  const handleCardSelection = (cardId: string) => {
    if (cardId == '0'){
      navigate("/components/buzzers/info0");
    }
    if (cardId == '1'){
      navigate("/components/buzzers/info1");
    }
    if (cardId == '2'){
      navigate("/components/buzzers/info2");
    }
    if (cardId == '3'){
      navigate("/components/buzzers/info3");
    }
    if (cardId == '4'){
      navigate("/components/buzzers/info4");
    }
    if (cardId == '5'){
      navigate("/components/buzzers/info5");
    }
    if (cardId == '6'){
      navigate("/components/buzzers/info6");
    }
  }

  const handleCardSelection2 = (cardId: string) => {
    if (cardId == '0'){
      navigate("/components/buzzers/info7");
    }
    if (cardId == '1'){
      navigate("/components/buzzers/info8");
    }
  }

  const renderDynamicContent = () => {
    if (selectedComponent === "1") {
      return (
        <FlowDiagram
          steps={flowSteps}
          onCardSelected={handleCardSelection}
        />
      );
    }
    if (selectedComponent === "2") {
      return (
        <FlowDiagram
          steps={flowSteps2}
          onCardSelected={handleCardSelection2}
        />
      );
    }
  }

  return (
    <>
      <Header title="" showIdeaButton={false} />
      <div className="h-screen flex flex-col items-center gap-3.5">
        <h2 className="text-ubuntu font-medium text-lg mb-1">Como Funciona?</h2>
        <DropdownSelector
          options={components}
          placeholder="Selecione uma opção"
          onSelect={setSelectedComponent}
          value={selectedComponent}
        />
        {/* Conteúdo Dinâmico */}
        {renderDynamicContent()}
      </div>
    </>
  );
}
