import { MapViewState } from "deck.gl";
import { DeckMap } from "./DeckMap";

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
      <div className="grid grid-cols-12 gap-0 h-screen overflow-hidden ">
        <DeckMap
          view_state={INITIAL_VIEW_STATE}
          layers={[]}
        />
      </div >
    </>
  );
}
export default BaseLayout


