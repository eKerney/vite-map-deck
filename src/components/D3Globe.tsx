// src/components/D3Panel.tsx
import { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { geoOrthographic, geoPath } from 'd3-geo';
import { MapViewState } from 'deck.gl';
import useWindowSize from '../hooks/useWindowSize';

export const D3Globe = ({ onGlobeClick }: { onGlobeClick: Dispatch<SetStateAction<MapViewState>> }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { width, height } = useWindowSize();

  useEffect(() => {
    if (!svgRef.current) return;
    // Dimensions
    const updateGlobe = () => {
      // const width = window.innerWidth;
      // const height = window.innerHeight;
      const radius = Math.min(width, height) / 3;
      // Set up SVG
      const svg = d3.select(svgRef.current)
        .attr('width', width)
        .attr('height', height);
      // Clear previous content
      svg.selectAll('*').remove();
      // Center the globe
      const g = svg.append('g')
        .attr('transform', `translate(${width / 2}, ${height / 2})`);
      // Orthographic projection
      const projection = geoOrthographic()
        .scale(radius)
        .translate([0, 0])
        .rotate([0, 0]); // Initial rotation [longitude, latitude]
      const path = geoPath().projection(projection);
      // Globe background (ocean)
      g.append('circle')
        .attr('r', radius)
        .attr('fill', '#71717A')
      d3.json('https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_land.geojson')
        .then((world: any) => {
          // Draw landmasses
          const land = g.selectAll('path')
            .data(world.features)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('fill', '#1A1A1A')
            .attr('stroke', 'white');
          // Rotation state
          let lambda = 0; // Longitude
          let phi = 0;   // Latitude
          d3.timer(() => {
            lambda += 0.1; // Spin speed
            projection.rotate([lambda, phi]);
            land.attr('d', path);
            g.select('circle').attr('d', path);
          });

          const drag = d3.drag<SVGSVGElement, unknown>()
            .on('drag', (event) => {
              const sensitivity = 0.25;
              lambda += event.dx * sensitivity;
              phi -= event.dy * sensitivity;
              projection.rotate([lambda, phi]);
              land.attr('d', path);
              g.select('circle').attr('d', path);
            });
          // Zoom behavior
          const zoom = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([radius - 20, radius * 3]) // Min/max zoom levels
            .on('zoom', (event) => {
              projection.scale(event.transform.k);
              land.attr('d', path);
              g.select('circle').attr('r', event.transform.k);
            });
          // Click handler
          svg.on('click', (event) => {
            const [x, y] = d3.pointer(event, svg.node());
            const coords = 'invert' in projection ? projection.invert!([x - width / 2, y - height / 2]) : [];
            if (coords) {
              onGlobeClick((prevCoords) => { return { ...prevCoords, latitude: coords[1], longitude: coords[0], zoom: 9 } });
            }
          });
          // Apply drag and zoom to SVG
          svg.call(drag).call(zoom);
          // Initial zoom reset
          svg.call(zoom.transform, d3.zoomIdentity.translate(0, 0).scale(radius - 10));

        })
        .catch(error => console.error('Error loading GeoJSON:', error));
    };

    updateGlobe();
    window.addEventListener('resize', updateGlobe);
    return () => window.removeEventListener('resize', updateGlobe);

  }, [width, height]);

  return (
    <div >
      <svg ref={svgRef} className="mt-2"></svg>
    </div>
  );
};

export default D3Globe;
