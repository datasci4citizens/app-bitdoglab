import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function LedRGB() {
    const navigate = useNavigate();
    const hasRun = useRef(false);

    const wrapperRefs = useRef<HTMLDivElement>(null);

    const [valueR, setValueR] = useState(0);
    const [valueG, setValueG] = useState(0);
    const [valueB, setValueB] = useState(0);

    const [led, setLed] = useState<HTMLDivElement | null>(null);

    const updateLEDColor = (color: 'r' | 'g' | 'b') => (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(event.target.value);
       
      if (color === 'r') {
      setValueR(value);
      } else if (color === 'g') {
      setValueG(value);
      } else if (color === 'b') {
      setValueB(value);
      }

      // calcula nova cor RGB
      const rgbColor = `rgb(${color === 'r' ? value : valueR}, ${color === 'g' ? value : valueG}, ${color === 'b' ? value : valueB})`;

      const svg = led?.querySelector('svg');
      const rect = svg?.querySelector('rect');
      rect?.setAttribute('fill', rgbColor);
      console.log(rect);
    }

    useEffect(() => {
      if (hasRun.current) return;
      hasRun.current = true;
      fetch("/assets/LED.svg")
        .then(res => res.text())
        .then(svgText => {
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
            const svg = svgDoc.querySelector('svg');
            const rect = svg?.querySelector('#led');

            if (!svg || !rect) return;

            svg.setAttribute('id', '00');
            svg.classList.add('led-svg');

            const ledContainer = document.createElement('div');
            ledContainer.classList.add('led-container');
            ledContainer.appendChild(svg);

            setLed(ledContainer);

            if (wrapperRefs.current) {
              wrapperRefs.current.appendChild(ledContainer);
            }   
      });

      const limparBtn = document.getElementById("limpar");
      const enviarBtn = document.getElementById("enviar");

      limparBtn?.addEventListener("click", () => {
        const led = document.querySelector('svg #led');
        led?.setAttribute('fill', 'rgb(60, 60, 60)');
      });

      enviarBtn?.addEventListener("click", () => {
        const led = document.querySelector('svg #led');
        const cor = led?.getAttribute('fill');

        const json = JSON.stringify({ledRGB: cor}, null, 3);
        const blob = new Blob([json], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'infoLEDs.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });

    }, []);

  return (
    <>
      <div className="absolute top-5 left-5">
        <Button variant="blue" onClick={() => navigate('/components')}>
          Voltar
        </Button>
      </div>
  
      <div className="h-screen flex flex-col items-center justify-center gap-3.5">
        <h1 className="text-ubuntu font-medium text-lg">Led RGB</h1>
        <h2 className="text-ubuntu font-medium text-md mb-5">Ajuste a cor do LED com os controles abaixo!</h2>
        <div id="leds-wrapper" ref={wrapperRefs}></div>
        <div>
          {/* Slider R */}
          <div className="flex items-center gap-3 mt-2">
            <label className="w-6 text-right font-medium font-ubuntu text-md">
              R:
            </label>
            <input
              type="range"
              value={valueR}
              onChange={updateLEDColor("r")}
              min={0}
              max={255}
              className="w-[250px] h-[10px] rounded-lg appearance-none outline-none cursor-pointer bg-gradient-to-r from-black to-rgb-red"
            />
            <span className="w-8 text-left">{valueR}</span>
          </div>

          {/* Slider G */}
          <div className="flex items-center gap-3 mt-2">
            <label className="w-6 text-right font-medium font-ubuntu text-md">
              G:
            </label>
            <input
              type="range"
              value={valueG}
              onChange={updateLEDColor("g")}
              min={0}
              max={255}
              className="w-[250px] h-[10px] rounded-lg appearance-none outline-none cursor-pointer bg-gradient-to-r from-black to-rgb-green"
            />
            <span className="w-8 text-left">{valueG}</span>
          </div>

          {/* Slider B */}
          <div className="flex items-center gap-3 mt-2">
            <label className="w-6 text-right font-medium font-ubuntu text-md">
              B:
            </label>
            <input
              type="range"
              value={valueB}
              onChange={updateLEDColor("b")}
              min={0}
              max={255}
              className="w-[250px] h-[10px] rounded-lg appearance-none outline-none cursor-pointer bg-gradient-to-r from-black to-rgb-blue"
            />
            <span className="w-8 text-left">{valueB}</span>
          </div>
        </div>
        <div className='flex flex-row justify-center gap-3 mt-3'>
            <Button variant="whitePink" id="limpar">Limpar</Button> <Button id="enviar">Enviar</Button>
        </div>
      </div>

    </>
    );
}