import { RefObject, useEffect, useRef } from 'react';
import useWindowSize from '../hooks/useWindowSize';
import { updateGlobe } from '../utilities/utilFuncs';
import { ControlProps } from './BaseLayout';
import { useFetchData } from '../hooks/useFetchData';

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

  const url = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson';
  const d3Data = useFetchData(url);
  useEffect(() => console.log('d3', d3Data), [d3Data]);

  useEffect(() => {
    if (!svgRef.current) return;
    updateGlobe(svgRef, width, height, onGlobeClick, controlsState);
  }, [width, height]);

  return (
    <div >
      <svg ref={svgRef} className="mt-2"></svg>
    </div>
  );
};

export default D3Globe;
