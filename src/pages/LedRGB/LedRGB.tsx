import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import ColorPicker from "@/components/ColorPicker";
import idea from "@/assets/imgs/lampada.png";
import LED, {type LedRef} from '@/components/LED';

export default function LedRGB() {
  const navigate = useNavigate();

  const [valueR, setValueR] = useState(0);
  const [valueG, setValueG] = useState(0);
  const [valueB, setValueB] = useState(0);

  // Create a ref to hold the LED component instance
  const ledRef = useRef<LedRef>(null);

  // const ledColor = `rgb(${valueR}, ${valueG}, ${valueB})`;
  // Function to update LED color using the LED component's method
  const updateLedColor = () => {
    if (ledRef.current) {
      const newColor = `rgb(${valueR}, ${valueG}, ${valueB})`;
      ledRef.current.changeColor(newColor);
    }
  };
  
  // Update LED color whenever RGB values change
  useEffect(() => {
    updateLedColor();
  }, [valueR, valueG, valueB]);

  // Handle the Clear button click
  const handleClear = () => {
    setValueR(0);
    setValueG(0);
    setValueB(0);
  };

  // Handle the Send button click
  const handleSend = async () => {
    try {
      if (ledRef.current) {
        const currentColor = ledRef.current.getColor();
        console.log("Sending LED color:", currentColor);
        // Add your API call or other functionality here
      }
    } catch (error) {
      console.error("Erro ao configurar LEDs:", error);
    }
  };

  return (
    <>
      <div className="absolute top-5 left-5">
        <Button variant="blue" onClick={() => navigate('/components')}>
          Voltar
        </Button>
      </div>
      <img
        src={idea}
        alt="Como funciona?"
        className="absolute top-5 right-5 w-1/8 mb-4"
        onClick={() => navigate("/components/neopixel/info")}
      />
      <div className="h-screen flex flex-col items-center justify-center gap-3.5">
        <h1 className="text-ubuntu font-medium text-lg">Led RGB</h1>
        <h2 className="text-ubuntu font-medium text-md mb-5">Ajuste a cor do LED com os controles abaixo!</h2>

        {/* LED Component */}
        <LED
          ref={ledRef}
          key={`led-0`}
          id={"0"}
          color="rgb(0, 0, 0)"
          selected={false}
        />

        {/* Color Picker Component */}
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

        <div className="flex flex-row justify-center gap-3 mt-4">
          <Button variant="whitePink" onClick={handleClear}>
            Limpar
          </Button>
          <Button onClick={handleSend}>Enviar</Button>
        </div>
      </div>

    </>
    );
}