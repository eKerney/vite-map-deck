import { Dispatch, SetStateAction } from "react";
import D3Globe from "./D3Globe";
import { MapViewState } from "deck.gl";

export const Panel = ({ onGlobeClick }: { onGlobeClick: Dispatch<SetStateAction<MapViewState>> }) => {

  return (
    <div id="Panel" className="h-full grid grid-rows-12 justify-left bg-none">
      <div className="row-span-6 z-30 ml-10 mt-6 mb-6 p-6 bg-elevation-0 opacity-95 rounded-lg shadow-2xl [border:2px_solid_transparent] bg-clip-padding 
          [background-image:linear-gradient(to_right,#1A1A1A,#1A1A1A),linear-gradient(to_right,#5A67D8,#34C759)] 
          border-custom-blue shadow-custom-blue/40  ">

        <D3Globe onGlobeClick={onGlobeClick} />

      </div>
      {/* <div className="row-span-6 z-30 ml-10 mb-6 p-6 bg-elevation-0 opacity-95 rounded-lg shadow-2xl [border:2px_solid_transparent] bg-clip-padding 
          [background-image:linear-gradient(to_right,#1A1A1A,#1A1A1A),linear-gradient(to_right,#5A67D8,#34C759)] 
          border-custom-blue shadow-custom-blue/40">
      </div> */}
    </div>
  )
}

export default Panel;
