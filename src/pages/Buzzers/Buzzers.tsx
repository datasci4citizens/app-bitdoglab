import { useState, useEffect, useRef } from "react";
import { useConnection } from "@/contexts/ConnectionContext";
import { Header } from "@/components/Header";
import Slider from "@/components/Slider";
import { useBuzzers } from "@/hooks/useBuzzers";
import Piano from "@/components/Piano";
import { playbackBuzzerSequence } from "@/utils/playbackBuzzer";
import SaveManagerModal from "@/components/SaveManagerModal";
import { Play, Square, Music } from "lucide-react";

export default function Buzzers() {
  const { sendCommand } = useConnection();
  const [isRecording, setIsRecording] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'save' | 'load' | 'manage'>('save');
  const [recordingBuffer, setRecordingBuffer] = useState<any>(null);

  const { octave, setOctave, handleNotePress, handleNoteRelease, getRecordingBuffer, buzzersController } = useBuzzers(sendCommand, isRecording);

  // Referência para guardar o valor anterior de isRecording
  const prevRecording = useRef(isRecording);

  useEffect(() => {
    // Quando parar de gravar (mudou de true para false)
    if (prevRecording.current && !isRecording) {
      const buffer = getRecordingBuffer();
      console.log("Buffer gravado:", buffer);
      
      // Salvar o buffer e abrir modal para salvar
      if (buffer && buffer.length > 0) {
        setRecordingBuffer(buffer);
        setModalMode('save');
        setModalOpen(true);
      } else {
        alert('Nenhuma nota foi gravada!');
      }
    }
    prevRecording.current = isRecording;
  }, [isRecording, getRecordingBuffer]);

  const handleRecord = () => {
    setIsRecording((prev) => !prev);
  };

  const handleLoad = () => {
    setModalMode('load');
    setModalOpen(true);
  };

  const handleManage = () => {
    setModalMode('manage');
    setModalOpen(true);
  };

  // Função para executar música carregada
  const handleLoadMusic = (musicData: any) => {
    console.log("Carregando música:", musicData);
    if (buzzersController && musicData) {
      playbackBuzzerSequence(buzzersController, musicData);
    }
  };

  // Método para determinar classes do container principal
  const getContainerClasses = () => {
    return `flex flex-col h-screen transition-all duration-200 ${
      isRecording ? "border-4 border-red-600" : ""
    }`;
  };

  // Método para renderizar o botão de gravar
  const renderRecordButton = () => {
    const buttonClasses = `px-4 py-2 rounded-full font-semibold text-white shadow-lg transition-all duration-200 flex items-center gap-2 ${
      isRecording ? "bg-red-600 animate-pulse" : "bg-primary hover:opacity-90"
    }`;

    return (
      <button onClick={handleRecord} className={buttonClasses}>
        {isRecording ? (
          <>
            <Square className="w-4 h-4" />
            Parar
          </>
        ) : (
          <>
            <div className="w-3 h-3 bg-white rounded-full"></div>
            Gravar
          </>
        )}
      </button>
    );
  };

  // Método para renderizar botões de ação (carregar e gravações)
  const renderActionButtons = () => {
    if (isRecording) return null;

    return (
      <>
        <button
          onClick={handleLoad}
          className="px-4 py-2 rounded-full font-semibold text-white bg-green-600 hover:bg-green-700 shadow-lg transition-all duration-200 flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          Carregar
        </button>

        <button
          onClick={handleManage}
          className="px-4 py-2 rounded-full font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-lg transition-all duration-200 flex items-center gap-2"
        >
          <Music className="w-4 h-4" />
          Gravações
        </button>
      </>
    );
  };

  // Método para renderizar todos os botões de controle
  const renderControlButtons = () => {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {renderRecordButton()}
        {renderActionButtons()}
      </div>
    );
  };

  return (
    <div className={getContainerClasses()}>
      <Header
        title="Toque uma música"
        showIdeaButton={true}
        ideaButtonPath="/components/buzzers/info"
      />
      <div className="flex-1 flex flex-col items-center overflow-y-auto pb-4 bg-background relative">
        <div className="flex flex-col items-center gap-3.5 w-full">
          <h3 className="text-ubuntu text-text font-medium text-lg mb-1">Escolha uma nota e sua oitava</h3>
          <Slider
            variant="pianoTones"
            value={octave}
            onChange={setOctave}
            showValue={false}
          />
        </div>
        <div className="w-full flex-shrink-0 mb-2 flex flex-col items-center gap-3">
          <Piano 
            onKeyPress={handleNotePress} 
            onKeyRelease={handleNoteRelease}
          />
        </div>

        {renderControlButtons()}
      </div>

      <SaveManagerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        storageKey="buzzer-recordings"
        currentData={recordingBuffer}
        onLoad={handleLoadMusic}
        title="Gravações de Música"
      />
    </div>
  );
}