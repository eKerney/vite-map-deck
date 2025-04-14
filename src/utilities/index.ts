import { RefObject } from "react";

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

interface PanelProps {
  items: controlItem[];
  renderItems: (item: controlItem, index: number) => ReactNode;
};


export interface ControlProps { rotation: number };

export const controls: controlItem[] = [[
  'rotation',
  controlsState.rotation,
  (e: React.ChangeEvent<HTMLInputElement>) => setControlsState({ ...controlsState, rotation: parseFloat(e.target.value) })
]];

export type controlItem = [string, number, (e: React.ChangeEvent<HTMLInputElement>) => void];

export interface D3PanelProps {
  onGlobeClick: (coords: [number, number] | never[],
    screenPos: [number, number],
    svgRef: RefObject<SVGSVGElement | null>,
  ) => void,
  controlsState: ControlProps,
};

export interface FetchState<T> {
  data: T | null,
  isLoading: boolean,
  error: string | null,
};

export interface WindowSize {
  width: number;
  height: number;
}
