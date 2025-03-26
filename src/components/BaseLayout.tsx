import { MapViewState } from "deck.gl";
import { DeckMap } from "./DeckMap";
import Panel from "./Panel";

export const BaseLayout = () => {

  const INITIAL_VIEW_STATE: MapViewState = {
    longitude: -110,
    latitude: 37.7853,
    zoom: 2,
    pitch: 0,
    bearing: 0,
  };
  return (
    <>
      <div className="grid grid-cols-12 gap-0 h-screen overflow-visible ">
        <DeckMap
          view_state={INITIAL_VIEW_STATE}
          layers={[]}
        />
        <div className="col-span-5 z-30 bg-none ">
          <Panel />
        </div>
      </div >
    </>
  );
}
export default BaseLayout

