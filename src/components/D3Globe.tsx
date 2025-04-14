import { useEffect, useRef } from 'react';
import useWindowSize from '../hooks/useWindowSize';
import { useFetchData } from '../hooks/useFetchData';
import { drawGlobe } from '../utilities/globeFuncs';


export const D3Globe = ({ onGlobeClick, controlsState }: D3PanelProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { width, height } = useWindowSize();

  const url = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson';
  const { data, isLoading, error } = useFetchData(url);
  // useEffect(() => console.log('D3Globe', data, isLoading, error), [data]);

  useEffect(() => {
    if (!svgRef.current) return;
    data && drawGlobe({ width, height, svgRef, onGlobeClick, controlsState, data })
  }, [width, height, data]);

  return (
    <div >
      <svg ref={svgRef} className="mt-2"></svg>
    </div>
  );
};

export default D3Globe;
