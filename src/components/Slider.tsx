import React from 'react';

// Define available slider variants
export type SliderVariant = 'red' | 'green' | 'blue' | 'default';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  variant?: SliderVariant;
  min?: number;
  max?: number;
  step?: number;
  width?: string;
  showValue?: boolean;
  customTrackClass?: string;
  customThumbClass?: string;
}

/**
 * CustomSlider - A reusable slider component that supports multiple variants
 * 
 * @param {SliderProps} props - Component properties
 * @returns {JSX.Element} - The rendered slider component
 */
const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  label,
  variant = 'default',
  min = 0,
  max = 255,
  step = 1,
  width = 'w-[250px]',
  showValue = true,
  customThumbClass
}) => {
  // Default label is generated based on variant if not provided
  const getDefaultLabel = () => {
    switch (variant) {
      case 'red': return 'R';
      case 'green': return 'G';
      case 'blue': return 'B';
      default: return '';
    }
  };

  const displayLabel = label ?? getDefaultLabel();

  // Get the appropriate track gradient based on the variant
  const getTrackGradient = () => {
    switch (variant) {
      case 'red': return 'bg-gradient-to-r from-black to-rgb-red';
      case 'green': return 'bg-gradient-to-r from-black to-rgb-green';
      case 'blue': return 'bg-gradient-to-r from-black to-rgb-blue';
      default: return 'bg-gray-30';
    }
  };

  // Handle the change event from the input slider
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(event.target.value);
    onChange(newValue);
  };

  // Generate an accessible label for screen readers
  const getAriaLabel = () => {
    if (label) return `${label} slider`;
    return `${variant} slider`;
  };

  return (
    <div className="flex items-center gap-3 mt-2">
      {displayLabel && (
        <label className="w-6 text-right font-medium font-ubuntu text-md">
          {displayLabel}:
        </label>
      )}
      <input
        type="range"
        value={value}
        onChange={handleChange}
        min={min}
        max={max}
        step={step}
        className={`${width} h-[10px] rounded-lg appearance-none outline-none cursor-pointer ${getTrackGradient()} ${customThumbClass || ''}`}
        aria-label={getAriaLabel()}
      />
      {showValue && (
        <span className="w-8 text-left">{value}</span>
      )}
    </div>
  );
};

export default Slider;