import { MapViewState } from "deck.gl";
import { DeckMap } from "./DeckMap";
import Panel from "./Panel";
import { useEffect, useState } from "react";

export const BaseLayout = () => {
  // const [globeClickCoords, setGlobeClickCoords] = useState<number[]>([0, 0])
  const [viewState, setViewState] = useState<MapViewState>(
    { longitude: -110, latitude: 37.7853, zoom: 2, pitch: 0, bearing: 0, }
  );

  useEffect(() => console.log('globeClickCoords', viewState), [viewState]);

  return (
    <>
      <div className="grid grid-cols-12 gap-0 h-screen overflow-visible ">
        <DeckMap
          view_state={viewState}
          layers={[]}
        />
        <div className="col-span-5 z-30 bg-none ">
          <Panel onGlobeClick={setViewState} />
        </div>
      </div >
    </>
  );
}
export default BaseLayout

