import { Dispatch, RefObject, SetStateAction } from "react";
import * as d3 from 'd3';
import { geoOrthographic, geoPath } from 'd3-geo';
import { FlyToInterpolator, MapViewState } from "deck.gl";
import { ControlProps } from "../components/BaseLayout";
import { GeoJSONFeature } from "maplibre-gl";
import * as h3 from 'h3-js';

export type H3data = {
  name: string,
  hexagons: string[],
};

export const testFunc = (countries) => {
  const boundary = [
    [163.04087210465863, 64.01659592046677],
    [163.34704729720406, 59.53641309763331],
    [170.66738099421357, 57.35909783156441],
    [178.57998532973056, 59.03217199475963],
    [-179.11117538442045, 63.29242332756059],
    [172.86137139869209, 66.19292316051032],
    [163.04087210465863, 64.01659592046677]
  ]; // [lon, lat]

  const coords = boundary.map(([lon, lat]) => [lon, lat]); // Already in [lon, lat]

  let crossesAntimeridian = false;
  for (let i = 0; i < coords.length - 1; i++) {
    const lon1 = coords[i][0];
    const lon2 = coords[i + 1][0];
    const diff = Math.abs(lon1 - lon2);
    // console.log(`Longitude difference [${i} to ${i + 1}]: ${lon1} to ${lon2} = ${diff}`);
    if (diff > 180) {
      crossesAntimeridian = true;
      break;
    }
  }
  // console.log('Crosses antimeridian:', crossesAntimeridian);
  ////
  //

  const normalized = coords.map(([lon, lat]) => [lon > 180 ? lon - 360 : lon, lat]);
  /// split into left and right
  const left = [], right = [];
  for (let i = 0; i < normalized.length; i++) {
    const [lon, lat] = normalized[i];
    if (lon <= 0) left.push([lon, lat]);
    else right.push([lon, lat]);
  }
  ///add intersection points 
  for (let i = 0; i < normalized.length - 1; i++) {
    const [lon1, lat1] = normalized[i];
    const [lon2, lat2] = normalized[i + 1];
    if (Math.abs(lon1 - lon2) > 180) {
      const t = (180 - Math.abs(lon1)) / Math.abs(lon1 - lon2);
      const latCross = lat1 + t * (lat2 - lat1);
      if (lon1 < 0) {
        left.push([-180, latCross]);
        right.push([180, latCross]);
      } else {
        left.push([-180, latCross]);
        right.push([180, latCross]);
      }
    }
  }

  return [left, right]
    .filter(poly => poly.length > 2)
    .map(poly => poly.map(([lon, lat]) => [lat, lon]));
}

export const rotationEvent = d3.dispatch('speedChange');

export const updateRotationSpeed = (newSpeed: number): void => {
  rotationEvent.call('speedChange', {}, newSpeed);
}


/////
const splitAtAntimeridian = (boundary) => {
  // H3 returns [lat, lon], but we need [lon, lat] for internal processing
  const coords = boundary;
  // const coords = boundary.map(([lat, lon]) => [lon, lat]); // Flip to [lon, lat]
  // Check for antimeridian crossing using longitudes (first element in [lon, lat])
  let crossesAntimeridian = false;
  for (let i = 0; i < coords.length - 1; i++) {
    const lon1 = coords[i][0]; // lon is first in [lon, lat]
    const lon2 = coords[i + 1][0];
    const diff = Math.abs(lon1 - lon2);
    // console.log(`Longitude difference [${i} to ${i + 1}]: ${lon1} to ${lon2} = ${diff}`);
    if (diff > 180) {
      crossesAntimeridian = true;
      break;
    } else if (diff > 90) {
      // console.warn(`Unexpectedly large difference (${diff}) for longitudes ${lon1} to ${lon2}. Are we sure these are longitudes?`);
    }
  }

  // Log details for hexagons near the antimeridian
  // const longitudes = coords.map(([lon, lat]) => lon);
  // if (longitudes.some(lon => Math.abs(lon) > 170)) {
  // console.log('Hexagon near antimeridian:', { longitudes, crossesAntimeridian });
  // } else {
  // console.log('No longitudes near antimeridian (±170°):', longitudes);
  // }

  // If no crossing, convert back to [lat, lon] and return
  if (!crossesAntimeridian) {
    return [coords];
    // return [coords.map(([lon, lat]) => [lat, lon])];
  }

  // Normalize longitudes to [-180, 180] for splitting
  const normalized = coords.map(([lon, lat]) => [lon > 180 ? lon - 360 : lon, lat]);

  // Split the polygon by traversing the path
  const left = [], right = [];
  // Use the longitude of the first point to decide the starting polygon
  const firstLon = normalized[0][0]; // lon is first in [lon, lat]
  let currentPoly = firstLon < 0 ? left : right;
  for (let i = 0; i < normalized.length; i++) {
    const [lon1, lat1] = normalized[i];
    const [lon2, lat2] = normalized[(i + 1) % normalized.length];
    // Add the current point to the current polygon
    currentPoly.push([lon1, lat1]);
    // Check if the segment crosses the antimeridian
    if (Math.abs(lon1 - lon2) > 180) {
      // Calculate the intersection point at the antimeridian
      const t = (180 - Math.abs(lon1)) / Math.abs(lon1 - lon2);
      const latCross = lat1 + t * (lat2 - lat1);
      // Add the intersection point to both polygons
      if (lon1 < 0) {
        left.push([-180, latCross]);
        right.push([180, latCross]);
        currentPoly = right; // Switch to the right polygon
      } else {
        right.push([180, latCross]);
        left.push([-180, latCross]);
        currentPoly = left; // Switch to the left polygon
      }
    }
  }
  // Filter out invalid polygons and convert back to [lat, lon]
  return [left, right]
    .filter(poly => poly.length > 2)
  // .map(poly => poly.map(([lon, lat]) => [lat, lon]));
}

//

export const getH3GeoJSON = (geoJSONfeatures: GeoJSONFeature[], res: number) => {
  const hexCountries = geoJSONfeatures.map(country => {
    const geometry = country.geometry;
    const name = country.properties.NAME;
    if (!geometry || !geometry.coordinates) {
      return { name, hexagons: [] };
    }

    let hexagons: string[] = [];
    try {
      if (geometry.type === 'MultiPolygon') {
        geometry.coordinates.forEach((polygonCoords, index) => {
          const polyHexagons = h3.polyfill(polygonCoords, res, true);
          hexagons = hexagons.concat(polyHexagons);
        });
      } else {
        hexagons = h3.polyfill(geometry.coordinates, res, true);
      }
      hexagons = [...new Set(hexagons)];
      return { name, hexagons };
    } catch (error) {
      return { name, hexagons: [] };
    }
  });

  return {
    type: 'FeatureCollection',
    features: hexCountries.flatMap(country =>
      country.hexagons.flatMap(hex => {
        const boundaries = splitAtAntimeridian(h3.h3ToGeoBoundary(hex, true), country.name);
        return boundaries.map(boundary => ({
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [boundary]
          },
          properties: { country: country.name }
        }));
      })
    )
  };

}

export const updateGlobe = (
  svgRef: RefObject<SVGSVGElement | null>,
  width: number,
  height: number,
  onGlobeClick: (coords: [number, number] | never[],
    screenPos: [number, number],
    svgRef: RefObject<SVGSVGElement | null>,
  ) => void,
  controlsState: ControlProps,
) => {
  const radius = Math.min(width, height) / 3;
  const svg = d3.select(svgRef.current)
    .attr('width', width)
    .attr('height', height);

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
    .attr('r', radius)
    .attr('fill', '#71717A')
  // d3.json('https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_land.geojson')
  const countriesUrl = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson';

  d3.json(countriesUrl)
    .then((geojson: any) => {
      // const land = g.selectAll('path')
      //   .data(geojson.features)
      //   .enter()
      //   .append('path')
      //   .attr('d', path)
      //   .attr('fill', '#1A1A1A')
      //   .attr('stroke', 'white')
      //   .attr('stroke-width', '.1px');
      // console.log('TEST: ', testFunc());
      // Clear previous content
      svg.selectAll('path').remove();
      const hexGeoJSON = getH3GeoJSON(geojson.features, 2);
      console.log(hexGeoJSON);

      const land = g.selectAll('.hexagon')
        .data(hexGeoJSON.features)
        .enter()
        .append('path')
        .attr('class', 'hexagon')
        .attr('d', path)
        .style('stroke', '#000')
        .style('stroke-width', 1)
        .style('fill', 'none')
      // .style('fill-opacity', '0.0001')

      /// WORKING IT   
      land
        .on('mouseover', function(event, d) {
          d3.select(this).style('fill-opacity', 0.8);
          svg.append('text')
            .attr('class', 'tooltip')
            .attr('x', event.offsetX + 10) // Position near mouse
            .attr('y', event.offsetY - 10)
            // .attr('fill', '#fff') // Ensure visibility
            .attr('font-size', '12px')
            .attr('pointer-events', 'none') // Prevent interference with mouse events
            .text(d.properties.country || 'Unknown');
        })
        .on('mousemove', function(event) {
          svg.select('.tooltip')
            .attr('x', event.offsetX + 10)
            .attr('y', event.offsetY - 10);
        })
        .on('mouseout', function() {
          d3.select(this).style('fill-opacity', 1.0);
          svg.select('.tooltip').remove();
        });
      //////

      // Rotation state
      let lambda = 0, phi = 0, timer: d3.Timer | null = null;
      const updateRotation = (newSpeed: number) => {
        if (timer) timer.stop();
        timer = d3.timer(() => {
          lambda += newSpeed;
          projection.rotate([lambda, phi]);
          land.attr('d', path);
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
      // .style("stroke-dasharray", "10,10") // Optional dashed effect
      .attr("filter", "drop-shadow(0px 0px 4px rgba(255,255,255,0.5))")
      .attr("fill", "none")
      .style('opacity', 0.3);

    const totalLength = path.node().getTotalLength();
    path
      .attr("stroke-dasharray", totalLength)
      .attr("stroke-dashoffset", totalLength) // Start hidden
      .transition()
      .duration(1600)
      .delay(i * 100) // optional: slight delay for stagger
      .ease(d3.easeQuadOut)
      .attr("stroke-dashoffset", 0) // Reveal
  });

};

