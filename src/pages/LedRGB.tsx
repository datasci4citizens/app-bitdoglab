import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

// Interface para o RGB
interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export default function LedRGB() {
  const navigate = useNavigate();
  const [rgb, setRgb] = useState<RgbColor>({ r: 0, g: 0, b: 0 });

  const handleRgbChange = (e: React.ChangeEvent<HTMLInputElement>, color: keyof RgbColor) => {
    const value = Math.min(255, Math.max(0, parseInt(e.target.value) || 0));
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
        {/* Quadrado do LED */}
        <div
          className="w-32 h-32 border-2 border-gray-300 rounded-lg"
          style={{ backgroundColor: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` }}
        ></div>

        {/* Inputs para R, G e B */}
        <div className="flex gap-4">
          <RGBInput
            label="R"
            color="r"
            value={rgb.r}
            onChange={(e) => handleRgbChange(e, "r")}
            className="text-red-500"
          />
          <RGBInput
            label="G"
            color="g"
            value={rgb.g}
            onChange={(e) => handleRgbChange(e, "g")}
            className="text-green-600"
          />
          <RGBInput
            label="B"
            color="b"
            value={rgb.b}
            onChange={(e) => handleRgbChange(e, "b")}
            className="text-blue-500"
          />
        </div>
      </main>
    </div>
  );
}

type RGBInputProps = {
  label: string;
  color: keyof RgbColor;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
};

function RGBInput({ label, color, value, onChange, className }: RGBInputProps) {
  return (
    <div className="flex flex-col items-center">
      <label htmlFor={color} className={`font-bold ${className}`}>
        {label}
      </label>
      <input
        id={color}
        type="number"
        min="0"
        max="255"
        value={value}
        onChange={onChange}
        className="border-2 p-2 rounded-lg w-20 text-center"
      />
    </div>
  );
}