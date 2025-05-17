import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function LedRGB() {
  const navigate = useNavigate();
  const [rgb, setRgb] = useState({ r: 0, g: 0, b: 0 });

  // React.ChangeEvent<HTMLInputElement> é nome do tipo de um evento de input
  const handleRgbChange = (e: React.ChangeEvent<HTMLInputElement>, color: keyof typeof rgb) => {
    const value = Math.min(255, Math.max(0, parseInt(e.target.value) || 0)); // Garante que o valor esteja entre 0 e 255
    setRgb({ ...rgb, [color]: value });
  };

  return (
    <div className="flex flex-col" id="led-rgb">
      <header className="flex">
        <Button className="mt-8 mb-8" variant="blue" onClick={() => navigate("/components")}>
          Voltar
        </Button>
      </header>
      <main className="flex flex-col items-center gap-6">
        {/* Quadrado que representa o LED (cor dinâmica) */}
        <div
          className="w-32 h-32 border-2 border-gray-300 rounded-lg"
          style={{ backgroundColor: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` }}
        ></div>

        {/* Inputs para R, G e B */}
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <label htmlFor="r" className="text-red-500 font-bold">R</label>
            <input
              id="r"
              type="number"
              min="0"
              max="255"
              value={rgb.r}
              onChange={(e) => handleRgbChange(e, "r")}
              className="border-2 p-2 rounded-lg w-20 text-center"
            />
          </div>

          <div className="flex flex-col items-center">
            <label htmlFor="g" className="text-green-600 font-bold">G</label>
            <input
              id="g"
              type="number"
              min="0"
              max="255"
              value={rgb.g}
              onChange={(e) => handleRgbChange(e, "g")}
              className="border-2 p-2 rounded-lg w-20 text-center"
            />
          </div>

          <div className="flex flex-col items-center">
            <label htmlFor="b" className="text-blue-500 font-bold">B</label>
            <input
              id="b"
              type="number"
              min="0"
              max="255"
              value={rgb.b}
              onChange={(e) => handleRgbChange(e, "b")}
              className="border-2 p-2 rounded-lg w-20 text-center"
            />
          </div>
        </div>

        {/* Exibe o valor RGB atual */}
        <p className="text-gray-700">
          RGB: {rgb.r}, {rgb.g}, {rgb.b}
        </p>
      </main>
    </div>
  );
}