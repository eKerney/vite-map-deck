import { Dispatch, RefObject, SetStateAction } from "react";
import * as d3 from 'd3';
import { geoOrthographic, geoPath } from 'd3-geo';
import { FlyToInterpolator, MapViewState } from "deck.gl";

export const updateGlobe = (
  svgRef: RefObject<SVGSVGElement | null>,
  width: number,
  height: number,
  onGlobeClick: (coords: [number, number] | never[],
    screenPos: [number, number],
    svgRef: RefObject<SVGSVGElement | null>,
  ) => void,
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
        if (coords) onGlobeClick(coords, [x, y], svgRef);
      });
      // Apply drag and zoom to SVG
      svg.call(drag).call(zoom);
      // Initial zoom reset
      svg.call(zoom.transform, d3.zoomIdentity.translate(0, 0).scale(radius - 10));
    })
    .catch(error => console.error('Error loading GeoJSON:', error));
};

export const handleGlobeClick = (
  coords: [number, number] | never[],
  screenPos: [number, number],
  svgRef: RefObject<SVGSVGElement | null>,
  setViewState: Dispatch<SetStateAction<MapViewState>>,
) => {

  // logic occurs inside of setViewState to ensure viewState is current 
  const mapPanel = d3.select("#DeckMap")
  const fLeft = 140, fTop = 0, fWidth = 540, fHeight = 500;
  // testing drawLines here

  setViewState(prev => {
    if (!prev.latitude) {
      const [startX, startY] = screenPos;
      mapPanel
        .style('position', 'absolute')
        .style('transform', 'scale(0.1)')
        .style('filter', 'blur(4px)')
        .style('left', `${startX - 160}px`)
        .style('top', `${startY - 240}px`)
        .style('width', `${fWidth}px`)
        .style('height', `${fHeight}px`)
        .style('opacity', 0.1)
        .transition()
        .duration(1400)
        .ease(d3.easePoly)
        .style('transform', 'scale(1.0)')
        .style('filter', 'blur(0px)')
        .style('left', `${fLeft}px`)
        .style('top', `${fTop}px`)
        .style('width', `${fWidth}px`)
        .style('height', `${fHeight}px`)
        .style('opacity', 0.9);
      drawLines(screenPos, { w: fWidth, h: fHeight, l: fLeft, t: fTop }, svgRef);
    } else {
      mapPanel
        .style('position', 'absolute')
        .style('transform', 'scale(0.9)')
        .style('filter', 'blur(4px)')
        .style('left', `${fLeft}px`)
        .style('top', `${fTop}px`)
        .style('width', `${fWidth}px`)
        .style('height', `${fHeight}px`)
        .style('opacity', 0.7)
        .transition()
        .duration(2000)
        .ease(d3.easeCircleOut)
        .style('transform', 'scale(1.0)')
        .style('filter', 'blur(0px)') // Start blurred
        .style('left', `${fLeft}px`)
        .style('top', `${fTop}px`)
        .style('width', `${fWidth}px`)
        .style('height', `${fHeight}px`)
        .style('opacity', 0.9);
      drawLines(screenPos, { w: fWidth, h: fHeight, l: fLeft, t: fTop }, svgRef);
    }
    return ({
      ...prev,
      latitude: coords[1],
      longitude: coords[0],
      zoom: 8,
      transitionDuration: 2000,
      transitionInterpolator: new FlyToInterpolator(),
    })
  });
};

export const drawLines = (
  screenPos: [number, number],
  dim: { w: number, h: number, l: number, t: number },
  svgRef: RefObject<SVGSVGElement | null>,
) => {

  const svg = d3.select(svgRef.current)
  svg.selectAll(".connecting-line").remove();

  // Convert Globe lat/lon to screen x/y
  const [globeX, globeY] = screenPos;
  const cor = 100;
  const deckCorners = [
    [dim.l - cor, dim.t + cor / 4], // Top-left
    [dim.l + dim.w - cor, dim.t + cor / 4], // Top-right
    [dim.l - cor, dim.t + dim.h + cor / 4], // Bottom-left
    [dim.l + dim.w - cor, dim.t + dim.h - cor / 4] // Bottom-right
  ];

  console.log(deckCorners)

  deckCorners.forEach(([deckX, deckY]) => {
    svg.append("path")
      // .attr("class", "connecting-line") // Unique class for easy removall
      // .attr("d", `M${globeX},${globeY} Q${(globeX + deckX - 100) / 2},${(globeY + deckY - 100) / 2 - 50} ${deckX},${deckY}`)
      // .attr("stroke", "rgba(255, 255, 255, 0.3)") // Faint white
      // .attr("stroke-width", 2)
      // .attr("fill", "none")
      // .style("stroke-dasharray", "5,5") // Optional dashed effect
      // .transition()
      // .duration(2000)
      // .ease(d3.easeQuadOut)
      // .attr("stroke-opacity", 1);
      .attr("class", "connecting-line") // Unique class for removal
      .attr("d", `M${globeX},${globeY} Q${(globeX + deckX) / 2},${(globeY + deckY) / 2 - 50} ${deckX},${deckY}`)
      .attr("stroke", "rgba(255, 255, 255, 0.3)") // Faint white
      .attr("stroke-width", 2)
      .attr("fill", "none")
      .style("stroke-dasharray", "10")  // Total length of dashes
      .style("stroke-dashoffset", "1") // Start with full offset (invisible)
      .transition()
      .duration(1200)
      .ease(d3.easeQuadOut)
      .style("stroke-dashoffset", "0"); // Reveal line smoothly
  });

};

