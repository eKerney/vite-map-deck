import { GeoJSONFeature } from "maplibre-gl";
import * as h3 from 'h3-js';
import { cellToBoundary, u64ToHex, cellToChildren, cellToLonLat } from "a5-js";

const splitAtAntimeridian = (coords: number[][]) => {
  let crossesAntimeridian = false;

  coords.every((d, i) => {
    crossesAntimeridian = Math.abs(d[0] - coords[i + i == coords.length ? 0 : 1][0]) > 180 ? true : false;
    if (crossesAntimeridian) return false;
    return true;
  })

  if (!crossesAntimeridian) return [coords];
  else return []
  // skipping anti meridian polygons
  // TODO: Need to work on proper splitting process

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
    .map(poly => poly.map(([lon, lat]) => [lat, lon]));
}

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
        geometry.coordinates.forEach((polygonCoords) => hexagons = hexagons.concat(h3.polyfill(polygonCoords, res, true)));
      } else hexagons = h3.polyfill(geometry.coordinates, res, true);
      return { name, hexagons: [...new Set(hexagons)] };
    } catch (error) {
      return { name, hexagons: [] };
    }
  });

  return {
    type: 'FeatureCollection',
    features: hexCountries.flatMap(country =>
      country.hexagons.flatMap(hex => {
        const boundaries = splitAtAntimeridian(h3.h3ToGeoBoundary(hex, true).reverse());
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

export const getA5GeoJSON = (geoJSONfeatures: GeoJSONFeature[], res: number) => {
  console.log('centroids', getAllA5centroids(0));
  const a5Countries = geoJSONfeatures.map(country => {
    const geometry = country.geometry;
    const name = country.properties.NAME;
    if (!geometry || !geometry.coordinates) {
      return { name, pentagons: [] };
    }
    let pentagons: string[] = [];

    try {
      if (geometry.type === 'MultiPolygon') {
        geometry.coordinates.forEach((polygonCoords) =>
          pentagons = pentagons.concat(h3.polyfill(polygonCoords, res, true)));
      } else pentagons = h3.polyfill(geometry.coordinates, res, true);
      // console.log('pentagons', pentagons);
      // console.log('coordinates', geometry.coordinates);
      return { name, pentagons: [...new Set(pentagons)] };
    } catch (error) {
      return { name, pentagons: [] };
    }
  });

  return {
    type: 'FeatureCollection',
    features: a5Countries.flatMap(country =>
      country?.pentagons?.flatMap(hex => {
        const boundaries = splitAtAntimeridian(h3.h3ToGeoBoundary(hex, true).reverse());
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

export const getAllA5centroids = (resolution: number) => {
  const cells = [];
  const cellIds = cellToChildren(0n, resolution);

  // Generate boundary for each cell
  for (let cellId of cellIds) {
    const cellIdHex = u64ToHex(cellId);
    // const boundary = cellToBoundary(cellId);
    const centroid = cellToLonLat(cellId);

    cells.push({ cellIdHex, 'centroid': centroid }
    );
  }

  return cells;
}


/**
 * Proposed workflow for A5 polyfill like function from H3 
 *
 * 1. get single/multipolygion geometry from feature 
 * 2. Use turf to create a turf polygon object 
 * 3. Iterate through ALL A5 centroids and find which are INSIDE polygon 
 * 4. Push the CellID if centroid in polygon
 * 5. CellIDs to GeoJSON geometry 
 * 6. Return GeoJSON Geometry 
 *
 * @param centroids: Array of objects containing cellID and point
 * @returns A GeoJSON FeatureCollection containing centroid features
 *
 * @example
 * ```ts
 * const geojson = getA5centroids(0);
 * console.log(geojson.features[0].properties.cellIdHex);
 * // → "200000000000000"
 * ```
 */

