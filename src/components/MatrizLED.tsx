import React from 'react';
import LEDComponent from './LedComponent.tsx';
import { type LEDState } from './typesNeopixel.ts';

interface LEDCompositeProps {
  leds: LEDState[];
  onLEDClick: (id: string) => void;
  ledsPerRow: number;
}

const LEDComposite: React.FC<LEDCompositeProps> = ({ 
  leds, 
  onLEDClick, 
  ledsPerRow 
}) => {
  const totalRows = Math.ceil(leds.length / ledsPerRow);

  const renderGridCells = () => {
    return Array.from({ length: totalRows }).map((_, rowIndex) => {
      const rowNumber = totalRows - rowIndex - 1;
      const rowLeds = leds.slice(rowIndex * ledsPerRow, (rowIndex + 1) * ledsPerRow);

      return (
        <React.Fragment key={`row-${rowIndex}`}>
          {/* Rótulo da linha */}
          <div className="text-ubuntu font-medium text-md flex items-center justify-end pr-2">
            {rowNumber}
          </div>
          
          {/* LEDs da linha */}
          {rowLeds.map((led) => (
            <LEDComponent 
              key={led.id} 
              led={led} 
              onClick={onLEDClick}
            />
          ))}
          
          {/* Células vazias para linhas incompletas */}
          {rowLeds.length < ledsPerRow && 
            Array.from({ length: ledsPerRow - rowLeds.length }).map((_, i) => (
              <div key={`empty-${rowIndex}-${i}`} className="w-[50px] h-[50px]" />
            ))
          }
        </React.Fragment>
      );
    });
  };

  return (
    <div 
      className="grid gap-[10px] items-center"
      style={{
        gridTemplateColumns: `auto repeat(${ledsPerRow}, 50px)`,
        gridTemplateRows: `repeat(${totalRows}, 50px)`
      }}
    >
      {renderGridCells()}
    </div>
  );
};

export default LEDComposite;