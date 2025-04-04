import { useEffect, useRef } from 'react';
import useWindowSize from '../hooks/useWindowSize';
import { updateGlobe } from '../utilities/utilFuncs';

interface D3PanelProps {
  onGlobeClick: (coords: [number, number] | never[], screenPos: [number, number]) => void,
};

export const D3Globe = ({ onGlobeClick }: D3PanelProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { width, height } = useWindowSize();

  useEffect(() => {
    if (!svgRef.current) return;
    updateGlobe(svgRef, width, height, onGlobeClick);
    window.addEventListener('resize', updateGlobe(svgRef, width, height, onGlobeClick));
    return () => window.removeEventListener('resize', updateGlobe(svgRef, width, height, onGlobeClick));
  }, [width, height]);

  return (
    <div >
      <svg ref={svgRef} className="mt-2"></svg>
    </div>
  );
};

export default D3Globe;
