import ColorPicker from '@/components/ColorPicker';
import { Header } from "@/components/Header";
import LED from '@/components/LED';
import { Button } from '@/components/ui/button';
import { useConnection } from "@/connection/ConnectionContext";
import { useLedRGB } from '@/hooks/useLedRGB';

/**
 * LEDRgb - Um componente para controlar um único LED RGB
 * 
 * @returns {JSX.Element} - O componente LEDRgb renderizado
 */
export default function LEDRgb() {
  const { sendCommand } = useConnection();
  
  const {
      // Valores individuais de RGB e seus setters (mantidos para compatibilidade)
      valueR,
      valueG,
      valueB,
      setValueR,
      setValueG,
      setValueB,
      // Estado e manipuladores dos LED
      currentColor,
      handleClearL,
      handleSend
    } = useLedRGB(sendCommand);

  return (
    <>
      <Header
        title="Led RGB"
        showIdeaButton={true}
        ideaButtonPath="/components/ledrgb/info"
      />
      <div className="h-screen flex flex-col items-center gap-5 bg-background">
        <h2 className="text-ubuntu font-medium text-md mb-10 text-heading">
          Ajuste a cor do LED com os controles abaixo!
        </h2>
        
        {/* Componente LED único no centro */}
        <div className="mb-4">
          <LED 
            id="single-led" 
            color={currentColor}
            selected={false}
            size='lg'
          />
        </div>
        
        {/* ColorPicker para ajustar os valores RGB */}
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
        
        {/* Botões de ação */}
        <div className='flex flex-row justify-center gap-3 mt-3'>
          <Button variant="whiteSecondary" onClick={handleClearL}>Limpar</Button>
          <Button variant="secondary" onClick={handleSend}>Enviar</Button>
        </div>
      </div>
    </>
  );
}