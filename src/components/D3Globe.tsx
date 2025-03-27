// src/components/D3Panel.tsx
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { geoOrthographic, geoPath } from 'd3-geo';

const D3Globe: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Dimensions
    const width = 400;
    const height = 400;
    const radius = Math.min(width, height) / 2;

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
      .attr('fill', '#71717A') // custom-blue for ocean

    // Load world GeoJSON data
    // Load world data
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

        // Basic rotation animation
        // let lambda = 0;
        // d3.timer(() => {
        //   lambda += 0.1; // Rotate speed
        //   projection.rotate([lambda, 0]);
        //   g.selectAll('path').attr('d', path);
        // });

        // Drag behavior
        const drag = d3.drag<SVGSVGElement, unknown>()
          .on('drag', (event) => {
            const [lambda, phi] = projection.rotate();
            const sensitivity = 0.25;
            projection.rotate([
              lambda + event.dx * sensitivity,
              phi - event.dy * sensitivity,
            ]);
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

        // Apply drag and zoom to SVG
        svg.call(drag).call(zoom);

        // Initial zoom reset
        svg.call(zoom.transform, d3.zoomIdentity.translate(0, 0).scale(radius - 10));

      })
      .catch(error => console.error('Error loading GeoJSON:', error));
  }, []);

  return (
    <div className="w-fit ml-16 flex justify-center items-center">
      <svg ref={svgRef} className="mt-2"></svg>
    </div>
  );
};

export default D3Globe;
