import React from 'react';
import { ColorSlider } from '@/components/ColorSlider';

interface ColorControlsProps {
  r: number;
  g: number;
  b: number;
  onColorChange: (color: 'r' | 'g' | 'b', value: number) => void;
}

const ColorControls: React.FC<ColorControlsProps> = ({ 
  r, g, b, onColorChange 
}) => {
  return (
    <div className="w-full">
      <ColorSlider
              label="R"
              value={r}
              colorClass="bg-gradient-red"
              onValueChange={(value) => onColorChange('r', value)}
              max={255} min={0} step={0}      />
      <ColorSlider
              label="G"
              value={g}
              colorClass="bg-gradient-green"
              onValueChange={(value) => onColorChange('g', value)}
              max={255} min={0} step={0}      />
      <ColorSlider
              label="B"
              value={b}
              colorClass="bg-gradient-blue"
              onValueChange={(value) => onColorChange('b', value)}
              max={255} min={0} step={0}      />
    </div>
  );
};

export default ColorControls;