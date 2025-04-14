/////////////////////////
// COMPONENT TYPES //
/////////////////////////

import { ReactNode } from "react";

export interface PanelProps {
  items: controlItem[];
  renderItems: (item: controlItem, index: number) => ReactNode;
};

export interface ControlProps { rotation: number };

export const controls: ControlItem[] = [[
  'rotation',
  controlsState.rotation,
  (e: React.ChangeEvent<HTMLInputElement>) => setControlsState({ ...controlsState, rotation: parseFloat(e.target.value) })
]];

export type ControlItem = [string, number, (e: React.ChangeEvent<HTMLInputElement>) => void];

export interface D3PanelProps {
  onGlobeClick: (coords: [number, number] | never[],
    screenPos: [number, number],
    svgRef: RefObject<SVGSVGElement | null>,
  ) => void,
  controlsState: ControlProps,
};


