import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function RGBInfo() {
  const navigate = useNavigate();
  const hasRun = useRef(false);

  const wrapperRefs = useRef<HTMLDivElement>(null);

  const [valueR, setValueR] = useState(0);
  const [valueG, setValueG] = useState(0);
  const [valueB, setValueB] = useState(0);

  const [leds, setLeds] = useState<HTMLDivElement[]>([]);

  const updateLEDColor =
  (color: "r" | "g" | "b") =>
  (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);

    // Atualiza diretamente o valor do estado
    if (color === "r") setValueR(value);
    if (color === "g") setValueG(value);
    if (color === "b") setValueB(value);

    if (leds.length === 4) {
      const [ledR, ledG, ledB, ledRGB] = leds.map((div) =>
        div.querySelector("svg #led")
      );

      // Atualiza as cores diretamente ao mudar o valor do slider
      if (color === "r") ledR?.setAttribute("fill", `rgb(${value},0,0)`);
      if (color === "g") ledG?.setAttribute("fill", `rgb(0,${value},0)`);
      if (color === "b") ledB?.setAttribute("fill", `rgb(0,0,${value})`);

      const r = color === "r" ? value : valueR;
      const g = color === "g" ? value : valueG;
      const b = color === "b" ? value : valueB;

      // Atualiza a cor final (mistura RGB)
      ledRGB?.setAttribute("fill", `rgb(${r},${g},${b})`);
    }
  };

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    fetch("/assets/LED.svg")
      .then((res) => res.text())
      .then((svgText) => {
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
        const baseSvg = svgDoc.querySelector("svg");
        const baseRect = baseSvg?.querySelector("#led");

        if (!baseSvg || !baseRect) return;

        const createLed = (color: string, isFinal: boolean = false) => {
          const cloneSvg = baseSvg.cloneNode(true) as SVGSVGElement;
          cloneSvg.classList.add("led-svg");
        
          const container = document.createElement("div");
          container.classList.add("led-container");
          container.appendChild(cloneSvg);
        
          const rect = cloneSvg.querySelector("#led");
          rect?.setAttribute("fill", color);
        
          // Adiciona borda preta no LED final
          if (isFinal && rect) {
            rect.setAttribute("stroke", "gray");
            rect.setAttribute("stroke-width", "1");
            rect.setAttribute("rx", "12");
            rect.setAttribute("ry", "12");  
          }
        
          return container;
        };
        

        const ledR = createLed("rgb(0,0,0)");
        const ledG = createLed("rgb(0,0,0)");
        const ledB = createLed("rgb(0,0,0)");
        const ledRGB = createLed("rgb(0,0,0)", true);

        const allLeds = [ledR, ledG, ledB, ledRGB];
        setLeds(allLeds);

        if (wrapperRefs.current) {
          wrapperRefs.current.innerHTML = "";
          const separator = (text: string) => {
            const span = document.createElement("span");
            span.textContent = text;
            span.className = "text-2xl font-bold text-black self-center";
            return span;
          };

          wrapperRefs.current.appendChild(ledR);
          wrapperRefs.current.appendChild(separator("+"));
          wrapperRefs.current.appendChild(ledG);
          wrapperRefs.current.appendChild(separator("+"));
          wrapperRefs.current.appendChild(ledB);
          wrapperRefs.current.appendChild(separator("="));
          wrapperRefs.current.appendChild(ledRGB);
        }
      });
  }, [valueR, valueG, valueB]);

  return (
    <>
      <div className="absolute top-5 left-5">
        <Button variant="blue" onClick={() => navigate("/components/neopixel/info")}>
          Voltar
        </Button>
      </div>

      <div className="h-screen flex flex-col items-center justify-center gap-3.5">
        <h1 className="text-ubuntu font-bold text-lg">Como a cor é formada?</h1>
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

        <div
          className="flex flex-row gap-4 mt-6 items-center"
          id="leds-wrapper"
          ref={wrapperRefs}
        ></div>
        <h3 className="text-ubuntu font-regular text-sm mt-10 mb-10">Todas as cores podem ser vistas como uma "mistura" de vermelho, verde e azul!</h3>
        <Button onClick={()=>navigate(-2)}>Teste você mesmo!</Button>
      </div>
    </>
  );
}
