import { useEffect, useRef, useState } from 'react';
import useWindowSize from '../hooks/useWindowSize';
import { useFetchData } from '../hooks/useFetchData';
import { drawGlobe } from '../utilities/globeFuncs';
import { getH3GeoJSON } from '../utilities/utilFuncs';
import { D3PanelProps } from './types';


export const D3Globe = ({ onGlobeClick, controlsState }: D3PanelProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { width, height } = useWindowSize();

  const url = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson';
  const { data, isLoading, error } = useFetchData(url);


  useEffect(() => {
    if (!svgRef.current) return;
    const hexGeoJSON = getH3GeoJSON(data ? data.features : [], controlsState.res);
    data && drawGlobe({ width, height, svgRef, onGlobeClick, controlsState, data, hexGeoJSON })
    console.log('hex', hexGeoJSON, data, controlsState)
  }, [width, height, data, controlsState.land, controlsState.res]);

  return (
    <div >
      <svg ref={svgRef} className="mt-2"></svg>
    </div>
  );
};

export default D3Globe;
