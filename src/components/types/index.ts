/////////////////////////
// COMPONENT TYPES //
/////////////////////////

import { ReactNode } from "react";

export interface PanelProps {
  items: controlItem[];
  renderItems: (item: controlItem, index: number) => ReactNode;
};

export interface ControlProps { rotation: number };


export type ControlItem = [string, number, number, number, number, string[], (e: React.ChangeEvent<HTMLInputElement>) => void];

export interface D3PanelProps {
  onGlobeClick: (coords: [number, number] | never[],
    screenPos: [number, number],
    svgRef: RefObject<SVGSVGElement | null>,
  ) => void,
  controlsState: ControlProps,
};


