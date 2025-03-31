import { RefObject } from "react";
import * as d3 from 'd3';
import { geoOrthographic, geoPath } from 'd3-geo';

export const updateGlobe = (
  svgRef: RefObject<SVGSVGElement | null>,
  width: number,
  height: number,
  onGlobeClick: (coords: [number, number] | never[]) => void,
) => {

  const radius = Math.min(width, height) / 3;
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
          console.log('DRAG!')
          const sensitivity = 0.25;
          lambda += event.dx * sensitivity;
          phi -= event.dy * sensitivity;
          projection.rotate([lambda, phi]);
          land.attr('d', path);
          g.select('circle').attr('d', path);
        });

      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([radius - 20, radius * 3]) // Min/max zoom levels
        .on('zoom', (event) => {
          projection.scale(event.transform.k);
          land.attr('d', path);
          g.select('circle').attr('r', event.transform.k);
        });

      svg.on('click', (event) => {
        const [x, y] = d3.pointer(event, svg.node());
        const coords = 'invert' in projection ? projection.invert!([x - width / 2, y - height / 2]) : [];
        // console.log(x, y);
        console.log(coords);
        if (coords) onGlobeClick(coords)
      });
      // Apply drag and zoom to SVG
      svg.call(drag).call(zoom);
      // Initial zoom reset
      svg.call(zoom.transform, d3.zoomIdentity.translate(0, 0).scale(radius - 10));

    })
    .catch(error => console.error('Error loading GeoJSON:', error));
};


