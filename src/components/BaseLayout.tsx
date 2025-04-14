import { MapViewState } from "deck.gl";
import { DeckMap, D3Globe, Controls } from "../components"
import { RefObject, useEffect, useState } from "react";
import { handleGlobeClick, updateRotationSpeed } from "../utilities/globeFuncs";
import { ControlItem, ControlProps } from "./types";

export const BaseLayout = () => {
  const [viewState, setViewState] = useState<MapViewState>({ longitude: 0, latitude: 0, zoom: 2, pitch: 0, bearing: 0 });
  const [controlsState, setControlsState] = useState<ControlProps>({ rotation: .10 });
  const mapContStyle = "col-span-4 row-span-4 relative flex mt-8 -ml-24 opacity-0 rounded-lg shadow-2xl [border:0px_solid_transparent] bg-clip-padding [background-image:linear-gradient(to_right,#1A1A1A,#1A1A1A),linear-gradient(to_right,#5A67D8,#34C759)] border-custom-blue shadow-custom-blue";
  const nums = ['1', '2', '3', '4', '5'], pips = ['|', '|', '|', '|', '|',], rang = ['slow', '', '', '', 'fast',], land = ['land', 'hex'];

  useEffect(() => {
    updateRotationSpeed(controlsState.rotation); // Update speed on change
  }, [controlsState.rotation]); // Watch for changes

  const controls: ControlItem[] = [[
    'rotation', .05, .25, .05, controlsState.rotation, ['slow', '', '', '', 'fast'],
    (e: React.ChangeEvent<HTMLInputElement>) => setControlsState({ ...controlsState, rotation: parseFloat(e.target.value) })],
  [
    'land', 1, 2, 1, 1, ['land', 'hex'],
    (e: React.ChangeEvent<HTMLInputElement>) => setControlsState({ ...controlsState, rotation: parseFloat(e.target.value) })],
  ];

  // useEffect(() => console.log(controlsState), [controlsState])

  const globeClickCallback = (
    coords: [number, number] | never[],
    screenPos: [number, number],
    svgRef: RefObject<SVGSVGElement | null>,
  ) => handleGlobeClick(coords, screenPos, svgRef, setViewState);
  return (
    <>
      <div className="grid grid-cols-12 grid-rows-6 relativ gap-0 h-screen overflow-visible bg-elevation-0   ">

        <div className="w-screen col-span-12 justify-center items-center " >

          <D3Globe onGlobeClick={globeClickCallback} controlsState={controlsState} />
        </div>

        <div className="absolute top-4 right-4 w-80 p-4  z-50">

          <Controls
            items={controls}
            renderItems={(d, i) => (
              <div key={`${d[0]}-${i}`} className="w-full max-w-xl ">
                <label className="label"><span className="label-text ">{d[0]}</span></label>
                <input
                  type="range"
                  min={d[1]}
                  max={d[2]}
                  className="range range-sm range-accent w-full"
                  step={d[3]}
                  onChange={d[6]}
                  value={d[4]}
                />
                <div className="flex justify-between px-2.5 mt-2 text-xs">
                  {d[5].map((e: string | number) => <span>{e}</span>)}
                </div>
              </div>
            )}
          />
        </div>

        <div className={mapContStyle} id='DeckMap'>
          {<DeckMap view_state={viewState} layers={[]} />}
        </div>

      </div >
    </>
  );
}

export default BaseLayout

