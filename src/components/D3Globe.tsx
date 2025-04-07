import { RefObject, useEffect, useRef } from 'react';
import useWindowSize from '../hooks/useWindowSize';
import { updateGlobe } from '../utilities/utilFuncs';
import { ControlProps } from './BaseLayout';

interface D3PanelProps {
  onGlobeClick: (coords: [number, number] | never[],
    screenPos: [number, number],
    svgRef: RefObject<SVGSVGElement | null>,
  ) => void,
  controlsState: ControlProps,
};

export const D3Globe = ({ onGlobeClick, controlsState }: D3PanelProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { width, height } = useWindowSize();

  useEffect(() => {
    if (!svgRef.current) return;
    updateGlobe(svgRef, width, height, onGlobeClick, controlsState);
    window.addEventListener('resize', updateGlobe(svgRef, width, height, onGlobeClick, controlsState));
    return () => window.removeEventListener('resize', updateGlobe(svgRef, width, height, onGlobeClick, controlsState));
  }, [width, height]);

  return (
    <div >
      <svg ref={svgRef} className="mt-2"></svg>
    </div>
  );
};

export default D3Globe;
