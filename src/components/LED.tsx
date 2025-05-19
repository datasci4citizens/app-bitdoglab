import React, { useEffect, useRef } from 'react';

export interface LedProps {
  id: string;
  onClick?: (led: HTMLDivElement) => void;
  color?: string;
  selected?: boolean;
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
  selected = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  
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
      containerRef.current.style.border = "4px solid #e31a8b";
      containerRef.current.style.borderRadius = "11px";
    } else {
      containerRef.current.style.border = "none";
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
      className="w-[50px] h-[50px] flex items-center justify-center led-container cursor-pointer"
      onClick={handleClick}
      data-led-id={id}
    />
  );
};

export default LED;