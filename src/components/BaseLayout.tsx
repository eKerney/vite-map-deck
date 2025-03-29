import { MapViewState } from "deck.gl";
import { DeckMap } from "./DeckMap";
import Panel from "./Panel";
import { useEffect, useState } from "react";
import D3Globe from "./D3Globe";

export const BaseLayout = () => {
  const [viewState, setViewState] = useState<MapViewState>(
    { longitude: -110, latitude: 37.7853, zoom: 2, pitch: 0, bearing: 0, }
  );

  useEffect(() => console.log('globeClickCoords', viewState), [viewState]);

  return (
    <>
      <div className="grid grid-cols-12 grid-rows-6 gap-0 h-screen overflow-visible bg-elevation-0 ">
        <div className="w-screen row-span-6 flex justify-center items-center " >
          <D3Globe onGlobeClick={setViewState} />
        </div>
        {<div className="col-span-5 row-span-2 z-30 fixed h-[1500px] w-96">
          <Panel
            callback={setViewState}
            deckMap=<DeckMap view_state={viewState} layers={[]} />
          />
        </div>}
      </div>
    </>
  );
}
export default BaseLayout

