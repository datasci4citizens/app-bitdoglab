import React from 'react';
import { ReactComponent as LEDSvg } from '/assets/LED.svg';
import { type LEDState } from './typesNeopixel';

interface LEDProps {
  led: LEDState;
  onClick: (id: string) => void;
}

const LEDComponent: React.FC<LEDProps> = ({ led, onClick }) => {
  const fillColor = `rgb(${led.r}, ${led.g}, ${led.b})`;
  
  return (
    <div 
      className={`w-[50px] h-[50px] flex items-center justify-center ${
        led.isSelected ? 'border-4 border-[#e31a8b] rounded-xl' : ''
      }`}
      onClick={() => onClick(led.id)}
    >
      <LEDSvg 
        className="led-svg" 
        id={led.id}
        style={{ 
          fill: fillColor,
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  );
};

export default LEDComponent;