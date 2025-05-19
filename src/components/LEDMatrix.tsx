import React, { useState } from 'react';
import LED from './LED';

interface LEDMatrixProps {
  ledsPerCol: number;
  ledsPerRow: number;
  onLEDSelected: (index: number) => void;
  ledColors: string[];
}

/**
 * LEDMatrix - Renders a grid of LEDs with row and column labels
 * 
 * @param {LEDMatrixProps} props - Component properties
 * @returns {JSX.Element} - The rendered LED matrix component
 */
const LEDMatrix: React.FC<LEDMatrixProps> = ({
  ledsPerCol,
  ledsPerRow,
  onLEDSelected,
  ledColors
}) => {
  const [selectedLEDIndex, setSelectedLEDIndex] = useState<number | null>(null);
  
  // Calculate number of  total leds
  const numLEDs = Math.ceil(ledsPerCol * ledsPerRow);
  
  // Create an array of row indices (from high to low, for reverse order display)
  const rowIndices = Array.from({ length: ledsPerCol }, (_, i) => ledsPerCol - i - 1);
  
  // Create an array of column indices
  const colIndices = Array.from({ length: ledsPerRow }, (_, i) => i);
  
  const handleLEDClick = (index: number) => {
    setSelectedLEDIndex(index);
    onLEDSelected(index);
  };
  
  return (
    <div className="flex flex-col items-center">
      {/* LED Matrix Grid */}
      <div
        className="grid gap-2"
        style={{
          display: 'grid',
          gridTemplateColumns: `auto repeat(${ledsPerRow}, 1fr)`,
          gap: '10px',
          alignItems: 'center',
        }}
      >
        {/* Render each row */}
        {rowIndices.map(rowIndex => (
          <React.Fragment key={`row-${rowIndex}`}>
            {/* Row label */}
            <div className="text-ubuntu font-medium text-md mt-3">
              {rowIndex}
            </div>
            
            {/* LEDs in this row */}
            {colIndices.map(colIndex => {
              const ledIndex = rowIndex * ledsPerRow + colIndex;
              // Only render if we haven't exceeded total LEDs
              return ledIndex < numLEDs ? (
                <LED
                  key={`led-${ledIndex}`}
                  id={ledIndex.toString()}
                  color={ledColors[ledIndex]}
                  selected={selectedLEDIndex === ledIndex}
                  onClick={() => handleLEDClick(ledIndex)}
                />
              ) : null;
            })}
          </React.Fragment>
        ))}
      </div>
      
      {/* Column labels */}
      <div className="flex flex-row justify-center gap-10 mt-2">
        {/* Empty space for row labels column */}
        <div className="" />
        
        {/* Column numbers */}
        {colIndices.map(colIndex => (
          <h5 key={`col-${colIndex}`} className="mr-4">
            {colIndex}
          </h5>
        ))}
      </div>
    </div>
  );
};

export default LEDMatrix;