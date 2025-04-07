import { MapViewState } from "deck.gl";
import { DeckMap } from "./DeckMap";
import D3Globe from "./D3Globe";
import { ReactNode, RefObject, useState } from "react";
import { handleGlobeClick } from "../utilities/utilFuncs";
import Panel from "./Panel";

export const BaseLayout = () => {
  const [viewState, setViewState] = useState<MapViewState>({ longitude: 0, latitude: 0, zoom: 2, pitch: 0, bearing: 0 });
  const mapContStyle = "col-span-4 row-span-4 relative flex mt-8 -ml-24 opacity-0 rounded-lg shadow-2xl [border:0px_solid_transparent] bg-clip-padding [background-image:linear-gradient(to_right,#1A1A1A,#1A1A1A),linear-gradient(to_right,#5A67D8,#34C759)] border-custom-blue shadow-custom-blue";
  const nums = ['1', '2', '3', '4', '5'], pips = ['|', '|', '|', '|', '|',];

  const globeClickCallback = (
    coords: [number, number] | never[],
    screenPos: [number, number],
    svgRef: RefObject<SVGSVGElement | null>,
  ) => handleGlobeClick(coords, screenPos, svgRef, setViewState);


  return (
    <>
      <div className="grid grid-cols-12 grid-rows-6 gap-0 h-screen overflow-visible bg-elevation-0 ">

        <div className="w-screen row-span-6 flex justify-center items-center " >
          <D3Globe onGlobeClick={globeClickCallback} />
        </div>

        <div className="grid col-span-2 row-span-2 relative mt-8 -ml-24 gap-4   p-4 bg-base-200 rounded-lg  " >
          <Panel
            items={['rotation', 'fedge']}
            renderItems={(d, i) => (
              <div key={`${d}-${i}`} className=" w-full max-w-xl ">
                <label className="label"><span className="label-text">{d}</span></label>
                <input type="range" min={0} max={100} className="range w-full" />
                <div className="flex justify-between px-2.5 mt-2 text-xs">
                  {pips.map(d => <span>{d}</span>)}
                </div>
                <div className="flex justify-between px-2.5 mt-2 text-xs">
                  {nums.map(d => <span>{d}</span>)}
                </div>
              </div>
            )}
          />
        </div>

        <div className={mapContStyle} id='DeckMap'>
          <DeckMap view_state={viewState} layers={[]} />
        </div>

      </div >
    </>
  );
}

export default BaseLayout

