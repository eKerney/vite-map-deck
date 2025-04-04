import { MapViewState } from "deck.gl";
import { DeckMap } from "./DeckMap";
import D3Globe from "./D3Globe";
import { useState } from "react";
import { handleGlobeClick } from "../utilities/utilFuncs";

export const BaseLayout = () => {
  const [viewState, setViewState] = useState<MapViewState>({ longitude: 0, latitude: 0, zoom: 2, pitch: 0, bearing: 0 });

  const mapContStyle = "col-span-4 row-span-4 relative flex mt-8 -ml-24 opacity-0 rounded-lg shadow-2xl [border:0px_solid_transparent] bg-clip-padding [background-image:linear-gradient(to_right,#1A1A1A,#1A1A1A),linear-gradient(to_right,#5A67D8,#34C759)] border-custom-blue shadow-custom-blue";

  const globeClickCallback = (
    coords: [number, number] | never[],
    screenPos: [number, number],
  ) => handleGlobeClick(coords, screenPos, setViewState);

  return (
    <>
      <div className="grid grid-cols-12 grid-rows-6 gap-0 h-screen overflow-visible bg-elevation-0 ">

        <div className="w-screen row-span-6 flex justify-center items-center " >
          <D3Globe
            onGlobeClick={globeClickCallback}
          />
        </div>

        <div className={mapContStyle} id='DeckMap'>
          <DeckMap
            view_state={viewState}
            layers={[]}
          />
        </div>
      </div>
    </>
  );
}

export default BaseLayout

