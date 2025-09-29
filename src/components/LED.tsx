import React, { useEffect, useRef } from 'react';

export interface LedProps {
  id: string;
  onClick?: (led: HTMLDivElement) => void;
  color?: string;
  selected?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'responsive';
}

/**
 * LED Component - Renders an individual LED with SVG
 * 
 * @param {LedProps} props - Component properties
 * @returns {JSX.Element} - The rendered LED component
 */
const LED: React.FC<LedProps> = ({
  id,
  onClick,
  color = 'rgb(0, 0, 0)',
  selected = false,
  size = 'mg'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Definir classes de tamanho baseado na prop
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8 sm:w-10 sm:h-10';
      case 'md':
        return 'w-10 h-10 sm:w-12 sm:h-12';
      case 'lg':
        return 'w-12 h-12 sm:w-14 sm:h-14';
      case 'responsive':
      default:
        return 'w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14';
    }
  };
  
  // Load and render SVG
  useEffect(() => {
    fetch("/assets/LED.svg")
      .then((res) => res.text())
      .then((svgText) => {
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
        const svg = svgDoc.querySelector("svg");
        const rect = svg?.querySelector("#led");

        if (!svg || !rect || !containerRef.current) return;
        
        svg.setAttribute("id", id);
        svg.classList.add("led-svg");

        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        svg.setAttribute("viewBox", "0 0 50 50"); // Ajuste conforme seu SVG
        svg.style.display = "block";
        
        // Set initial color
        rect.setAttribute("fill", color);
        rect.setAttribute("text", color === 'rgb(0, 0, 0)' ? "off" : "on");
                
        // Clear container first
        if (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }
        
        // Add svg to the container
        containerRef.current.appendChild(svg);
        svgRef.current = svg;
      });
  }, [id]);
  
  // Update border when selected state changes
  useEffect(() => {
    if (!containerRef.current) return;
    
    if (selected) {
      containerRef.current.classList.remove("border-neutral-palette-30", "border-2");
      containerRef.current.classList.add("border-secondary", "border-4", "rounded-xl");
    } else {
      containerRef.current.classList.remove("border-secondary", "border-4");
      containerRef.current.classList.add("border-neutral-palette-30", "border-2");
    }
  }, [selected]);
  
  // Update color when prop changes
  useEffect(() => {
    if (!svgRef.current) return;
    
    const rect = svgRef.current.querySelector("#led");
    if (rect) {
      rect.setAttribute("fill", color);
      rect.setAttribute("text", color === 'rgb(0, 0, 0)' ? "off" : "on");
    }
  }, [color]);

  const handleClick = () => {
    if (onClick && containerRef.current) {
      onClick(containerRef.current);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`
        ${getSizeClasses()}
        flex items-center justify-center 
        led-container cursor-pointer 
        border border-neutral-palette-30 rounded-lg
        hover:border-secondary transition-colors duration-200
        touch-manipulation
      `}
      onClick={handleClick}
      data-led-id={id}
    />
  );
};

export default LED;