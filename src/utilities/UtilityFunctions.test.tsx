import { describe, expect, it, test } from "vitest";
import { a5PolygonToCell, getAllA5centroids } from "./utilFuncs";
import h3SinglePolyMorocco from '../data/H3moroccoHexFeature.json';
import { Polygon } from "./types";

// describe('test getWindDirection', function() {
//   test('wind degrees 100: result should be E', () => {
//     const input = 100, expected = 'E';
//     expect(getWindDirection(input)).toStrictEqual(expected)
//   })
//   test('wind degrees 0: result should be N', () => {
//     const input = 0, expected = 'N';
//     expect(getWindDirection(input)).toStrictEqual(expected)
//   })
//   test('wind degrees 281.25: result should be WSW', () => {
//     const input = 281.25, expected = 'WNW';
//     expect(getWindDirection(input)).toStrictEqual(expected)
//   })
//
// })

describe('test getAllA5centroids', function() {
  it('returns valid cellIdHex, centroid at Res0 ', async () => {
    const input = 0
    const result = getAllA5centroids(input);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          cellIdHex: '200000000000000',
          centroid: [-93, 90]
        })
      ])
    )
  });

  it('returns valid cellIdHex, centroid at Res1', async () => {
    const input = 1
    const result = getAllA5centroids(input);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          cellIdHex: "500000000000000",
          centroid: [-236.99999999999997, 69.09240188013534]
        })
      ])
    )
  })
});

describe('test a5PolygonToCell', function() {
  it('return the correct cellIdHex array Res0', async () => {
    const centroids = { cellIdHex: '5380000000000000', centroid: [-10.838189842367342, 33.3067237705403] }
    const result = a5PolygonToCell([centroids], h3SinglePolyMorocco.geometry as Polygon);

    expect(result).toEqual(
      expect.arrayContaining(['5380000000000000'])
    )
  });
});
