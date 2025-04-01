import { useEffect, useRef } from 'react';
import useWindowSize from '../hooks/useWindowSize';
import { updateGlobe } from '../utilities/utilFuncs';
import { MapViewState } from 'deck.gl';

interface D3PanelProps {
  onGlobeClick: (coords: [number, number] | never[], screenPos: [number, number], viewState: MapViewState) => void,
  viewState: MapViewState,
};

export const D3Globe = ({ onGlobeClick, viewState }: D3PanelProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { width, height } = useWindowSize();

  useEffect(() => {
    if (!svgRef.current) return;
    updateGlobe(svgRef, width, height, onGlobeClick, viewState);
    window.addEventListener('resize', updateGlobe(svgRef, width, height, onGlobeClick, viewState));
    return () => window.removeEventListener('resize', updateGlobe(svgRef, width, height, onGlobeClick, viewState));
  }, [width, height]);

  return (
    <div >
      <svg ref={svgRef} className="mt-2"></svg>
    </div>
  );
};

export default D3Globe;
