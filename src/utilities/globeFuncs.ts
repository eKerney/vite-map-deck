import { Dispatch, RefObject, SetStateAction } from "react";
import * as d3 from 'd3';
import { geoOrthographic, geoPath } from 'd3-geo';
import { FlyToInterpolator, MapViewState } from "deck.gl";
import { getH3GeoJSON } from "./utilFuncs";
import { D3Features, GlobeContexts, GlobeState, SetupGraphics, WidthHeight } from "./types";


export const handleGlobeClick = (
  coords: [number, number] | never[],
  screenPos: [number, number],
  svgRef: RefObject<SVGSVGElement | null>,
  setViewState: Dispatch<SetStateAction<MapViewState>>,
) => {

  // logic occurs inside of setViewState to ensure viewState is current 
  const mapPanel = d3.select("#DeckMap")
  const fLeft = 140, fTop = 0, fWidth = 540, fHeight = 500;

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
        .style('opacity', 0.5);
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
      zoom: 7,
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

  const [globeX, globeY] = screenPos;
  const cor = 96;
  const deckCorners = [
    [dim.l - cor + 4, dim.t + cor / 3], // Top-left
    [dim.l + dim.w - cor, dim.t + cor / 3], // Top-right
    [dim.l - cor + 4, dim.t + dim.h + cor / 4], // Bottom-left
    [dim.l + dim.w - cor, dim.t + dim.h - cor / 2] // Bottom-right
  ];

  deckCorners.forEach(([deckX, deckY], i) => {
    const path = svg.append("path")
      .attr("class", "connecting-line")
      .attr("d", `M${globeX},${globeY} Q${(globeX + deckX) / 2},${(globeY + deckY) / 2 - 50} ${deckX},${deckY}`)
      .attr("stroke", "rgba(255, 255, 255, 0.4)")
      .attr("stroke-width", 2)
      .attr("filter", "drop-shadow(0px 0px 4px rgba(255,255,255,0.5))")
      .attr("fill", "none")
      .style('opacity', 0.3);

    const totalLength = path.node().getTotalLength();
    path
      .attr("stroke-dasharray", totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(1600)
      .delay(i * 100)
      .ease(d3.easeQuadOut)
      .attr("stroke-dashoffset", 0) // Reveal
  });
};

export const drawGlobe = ({ width, height, svgRef, onGlobeClick, controlsState, data = { features: [] }, hexGeoJSON = { features: [] } }:
  WidthHeight & GlobeContexts & any) => {
  const radius = Math.min(width, height) / 2.4;
  const svg = d3.select(svgRef.current)
    .attr('width', width)
    .attr('height', height);
  svg.selectAll('*').remove();

  const { g, path, projection } = globeSetup({ width, height, radius, svg });

  const features = g.selectAll('.land')
    .data(controlsState.land === 2 ? hexGeoJSON.features : data.features)
    .enter()
    .append('path')
    .attr('class', 'land')
    .attr('d', path)
    .attr('fill', '#1A1A1A')
    .attr('fill-opacity', '0.8')
    .attr('stroke', 'white')
    .attr('stroke-width', '.1px');

  const graticules = g.append('path')
    .datum(d3.geoGraticule10())
    .attr("d", path)
    .attr("stroke", "rgba(255, 255, 255, 0.08)")
    .attr('stroke-width', '0.3px')
    .attr('fill', 'none')

  dataInteractions(features, svg);
  globeInteractions({ width, height, svgRef, onGlobeClick, controlsState, radius, svg, g, projection, path, features, graticules })

};

export const rotationEvent = d3.dispatch('speedChange');

export const updateRotationSpeed = (newSpeed: number): void => {
  rotationEvent.call('speedChange', {}, newSpeed);
}

export const globeInteractions = ({ width, height, svgRef, onGlobeClick, controlsState, radius, svg, g, projection, path, features, graticules }:
  WidthHeight & GlobeContexts & SetupGraphics & GlobeState & D3Features) => {
  // features.data([]).exit().remove(); // Clear data and remove unbound elements
  features.on('click', null); // Remove click listeners

  // Rotation state
  let lambda = 0, phi = 0, timer: d3.Timer | null = null;
  const updateRotation = (newSpeed: number) => {
    if (timer) timer.stop();
    timer = d3.timer(() => {
      lambda += newSpeed;
      projection.rotate([lambda, phi]);
      features.attr('d', path);
      graticules.attr('d', path);
      g.select('circle').attr('d', path);
    });
  };
  rotationEvent.on('speedChange', (newSpeed: number) => updateRotation(newSpeed));
  updateRotation(controlsState.rotation); //init rotation

  // Drag Zoom
  const drag = d3.drag<SVGSVGElement, unknown>()
    .on('drag', (event) => {
      const sensitivity = 0.25;
      lambda += event.dx * sensitivity;
      phi -= event.dy * sensitivity;
      projection.rotate([lambda, phi]);
      features.attr('d', path);
      g.select('circle').attr('d', path);
    });
  const zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([radius - 20, radius * 3]) // Min/max zoom levels
    .on('zoom', (event) => {
      projection.scale(event.transform.k);
      features.attr('d', path);
      g.select('circle').attr('r', event.transform.k);
    });
  // Capture Click for map interaction
  svg.on('click', (event) => {
    const [x, y] = d3.pointer(event, svg.node());
    const coords = 'invert' in projection ? projection.invert!([x - width / 2, y - height / 2]) : [];
    if (coords) onGlobeClick(coords, [x, y], svgRef);
  });

  // Apply drag and zoom to SVG
  svg.call(drag).call(zoom);
  // Initial zoom reset
  svg.call(zoom.transform, d3.zoomIdentity.translate(0, 0).scale(radius - 10));
}

export const dataInteractions = (
  features: d3.Selection<SVGPathElement, unknown, SVGGElement, unknown>,
  svg: d3.Selection<SVGSVGElement | null, unknown, null, undefined>,
) => {
  features.on('click', null); // Remove click listeners

  features
    .on('mouseover', function(event, d) {
      console.log(d)
      d3.select(this)
        .style('fill-opacity', 0.5)
        .attr('fill', '#fff') // Ensure visibility
      svg.append('text')
        .attr('class', 'tooltip')
        .attr('x', event.offsetX + 10) // Position near mouse
        .attr('y', event.offsetY - 10)
        .attr('fill', '#fff') // Ensure visibility
        .attr('font-size', '16px')
        .attr('pointer-events', 'none') // Prevent interference with mouse events
        .text(d.properties.country || d.properties.NAME);
    })
    .on('mousemove', function(event) {
      svg.select('.tooltip')
        .attr('x', event.offsetX + 10)
        .attr('y', event.offsetY - 10);
    })
    .on('mouseout', function() {
      d3.select(this)
        .style('fill-opacity', 1.0)
        .attr('fill', '#1A1A1A');
      svg.select('.tooltip').remove();
    });
}

export const globeSetup = ({ width, height, radius, svg }: WidthHeight & SetupGraphics): GlobeState => {
  // Clear previous content
  svg.selectAll('*').remove();
  // Center the globe
  const g = svg.append('g').attr('transform', `translate(${width / 2}, ${height / 2})`);

  // Orthographic projection
  const projection = geoOrthographic()
    .scale(radius)
    .translate([0, 0])
    .rotate([0, 0]); // Initial rotation [longitude, latitude]
  const path = geoPath().projection(projection);

  // Globe background (ocean)
  g.append('circle')
    .datum({ type: "Sphere" })
    .attr('r', radius)
    .attr('fill', '#333338')
    // .attr('fill', '#71717A')
    .attr('fill-opacity', '0.3')
  globeGradient({ width, height, radius, svg: g });

  return { g, path, projection };
}

export const globeGradient = ({ width, height, radius, svg }: WidthHeight & SetupGraphics) => {
  var gradient = svg.append("defs").append("radialGradient")
    .attr("id", "gradient")
    .attr("cx", "75%")
    .attr("cy", "25%");

  gradient.append("stop")
    .attr("offset", "5%")
    .attr("stop-color", "#fffff0");

  gradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#333338");

  var fill = svg.append("circle")
    // .attr("cx", width / 2)
    // .attr("cy", height / 2)
    .attr("r", radius / 1.028)
    .style("fill", "url(#gradient)")
    .attr('fill-opacity', '0.16')
    .attr('stroke', 'none')
}
