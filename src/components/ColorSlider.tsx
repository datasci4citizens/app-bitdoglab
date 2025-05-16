import { Slider } from "./ui/slider";
import { cn } from '@/lib/utils';

interface ColorSliderProps {
  label: string;
  value: number;
  colorClass: string;
  max: number;
  min: number;
  step: number;
  onValueChange: (value: number) => void;
}

export const ColorSlider = ({ 
  label, 
  value, 
  colorClass, 
  max = 255,
  min = 0, 
  step = 1, 
  onValueChange 
}: ColorSliderProps) => {
  const handleValueChange = (values: number[]) => {
    // Garante que sempre teremos um valor válido
    const newValue = values[0] ?? value; // Fallback para o valor atual se undefined
    onValueChange(newValue);
  };

  return (
    <div className="mb-4">
      <label className="font-medium font-ubuntu text-md flex flex-col">
        {label}:
        <div className="flex items-center gap-3">
          <Slider
            value={[value]}
            onValueChange={handleValueChange}
            max={max}
            min={min}
            step={step}
            className={colorClass}
          />
          <span className="w-10 text-right">{value}</span>
        </div>
      </label>
    </div>
  );
};