import { cellToBoundary, u64ToHex, cellToChildren } from "a5-js";

export const A5Test = () => {
  // Generate all cells at the specified resolution
  const resolution = 2;
  const cells = [];
  const cellIds = cellToChildren(0n, resolution);

  // Generate boundary for each cell
  for (let cellId of cellIds) {
    const cellIdHex = u64ToHex(cellId);
    const boundary = cellToBoundary(cellId);

    cells.push({
      type: "Feature",
      geometry: { type: "Polygon", coordinates: [boundary] },
      properties: { cellIdHex }
    });
  }

  // Create GeoJSON FeatureCollection
  const geojson = { type: "FeatureCollection", features: cells };
  console.log(geojson)

  return (<></>)

}
