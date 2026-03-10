/////////////////////////
// UTILITIES TYPES //
/////////////////////////

import * as d3 from 'd3';
import { RefObject } from "react";
import { ControlProps } from "../../components/types";

export type WidthHeight = {
  width: number,
  height: number,
}

export interface SetupGraphics {
  radius: number,
  svg: d3.Selection<SVGSVGElement | null, unknown, null, undefined>,
};

export interface GlobeContexts {
  svgRef: RefObject<SVGSVGElement | null>,
  onGlobeClick: (coords: [number, number] | never[],
    screenPos: [number, number],
    svgRef: RefObject<SVGSVGElement | null>,
  ) => void,
  controlsState: ControlProps,
};

export interface GlobeState {
  g: SVGGElement | unknown | null | undefined,
  path: d3.GeoPath<any, d3.GeoPermissibleObjects>,
  projection: d3.GeoProjection,
};

export type D3Features = {
  features: d3.Selection<SVGPathElement, unknown, SVGGElement, unknown>
};

