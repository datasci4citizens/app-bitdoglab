import React from 'react';
import Slider from './Slider';

interface ColorPickerProps {
  valueR: number;
  valueG: number;
  valueB: number;
  onChangeR: (value: number) => void;
  onChangeG: (value: number) => void;
  onChangeB: (value: number) => void;
  className?: string;
  showLabels?: boolean;
  showValues?: boolean;
  width?: string;
  min?: number;
  max?: number;
}

/**
 * ColorPicker - A component that combines three RGB sliders for color selection
 * 
 * @param {ColorPickerProps} props - Component properties
 * @returns {JSX.Element} - The rendered color picker component
 */
const ColorPicker: React.FC<ColorPickerProps> = ({
  valueR,
  valueG,
  valueB,
  onChangeR,
  onChangeG,
  onChangeB,
  className = '',
  showLabels = true,
  showValues = true,
  width,
  min = 0,
  max = 255
}) => {
  return (
    <div className={className}>
      <Slider 
        variant="red" 
        value={valueR} 
        onChange={onChangeR}
        label={showLabels ? 'R' : undefined}
        showValue={showValues}
        width={width}
        min={min}
        max={max}
      />
      <Slider 
        variant="green" 
        value={valueG} 
        onChange={onChangeG}
        label={showLabels ? 'G' : undefined}
        showValue={showValues}
        width={width}
        min={min}
        max={max}
      />
      <Slider 
        variant="blue" 
        value={valueB} 
        onChange={onChangeB}
        label={showLabels ? 'B' : undefined}
        showValue={showValues}
        width={width}
        min={min}
        max={max}
      />
    </div>
  );
};

export default ColorPicker;