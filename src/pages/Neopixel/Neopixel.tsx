import { Button } from "@/components/ui/button";
import { useConnection } from "@/contexts/ConnectionContext";
import { Header } from "@/components/Header";
import ColorPicker from "@/components/ColorPicker";
import LEDMatrix from "@/components/LEDMatrix";
import { useNeopixel } from "@/hooks/useNeopixel";
import SaveModal from "@/components/SaveModal";
import LoadManageModal from "@/components/LoadManageModal";
import { Save, Palette } from "lucide-react";

export default function Neopixel() {
  const { sendCommand } = useConnection();
  
  // Definição da matriz de LEDs
  const LEDsInline = 5; // LEDs por linha
  const LEDSInCol = 5;  // LEDs por coluna
  const totalLEDs = LEDsInline * LEDSInCol;
  
  // Utilizamos o hook personalizado para gerenciar os LEDs
  const {
    // Valores individuais de RGB e seus setters (mantidos para compatibilidade)
    valueR,
    valueG,
    valueB,
    setValueR,
    setValueG,
    setValueB,
    // Estado e manipuladores dos LEDs
    ledColors,
    handleLEDSelected,
    handleClear,
    handleSend,
    // Estados dos modais
    saveModalOpen,
    setSaveModalOpen,
    loadManageModalOpen,
    setLoadManageModalOpen,
    // Manipuladores dos modais
    handleOpenSaveModal,
    handleOpenLoadManage,
    getCurrentData,
    handleLoadConfiguration
  } = useNeopixel(sendCommand, totalLEDs);

  return (
    <div className="flex flex-col bg-background min-h-screen">
      <Header
        title="Neopixel"
        showIdeaButton={true}
        ideaButtonPath="/components/neopixel/info"
      />
      <main className="flex flex-col items-center">
        <h2 className="text-ubuntu mb-4 text-center text-heading">
          Selecione um dos 25 LEDS e regule a cor conforme desejar
        </h2>

        <LEDMatrix
          ledsPerCol={LEDSInCol}
          ledsPerRow={LEDsInline}
          onLEDSelected={handleLEDSelected}
          ledColors={ledColors}
        />

        <ColorPicker
          valueR={valueR}
          valueG={valueG}
          valueB={valueB}
          onChangeR={setValueR}
          onChangeG={setValueG}
          onChangeB={setValueB}
          showLabels={true}
          showValues={true}
        />

        <div className="grid grid-cols-2 gap-3 mt-4">
          <Button variant="whiteSecondary" onClick={handleClear}>
            Limpar
          </Button>
          <Button variant="secondary" onClick={handleSend}>
            Enviar
          </Button>          
          <Button
            onClick={handleOpenLoadManage}
            className="px-4 py-2 flex items-center gap-2"
            variant="whiteSecondary"
          >
            <Palette className="w-4 h-4" />
            Pinturas
          </Button>
          <Button
            onClick={handleOpenSaveModal}
            className="px-4 py-2 flex items-center gap-2"
            variant="whiteSecondary"
          >
            <Save className="w-4 h-4" />
            Salvar
          </Button>
        </div>
      </main>
      
      {/* Modal para salvar configuração */}
      <SaveModal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        storageKey="neopixel-paintings"
        currentData={getCurrentData()}
        title="Salvar Pintura"
      />

      {/* Modal para carregar e gerenciar configurações */}
      <LoadManageModal
        isOpen={loadManageModalOpen}
        onClose={() => setLoadManageModalOpen(false)}
        storageKey="neopixel-paintings"
        onLoad={handleLoadConfiguration}
        title="Pinturas Salvas"
      />
    </div>
  );
}