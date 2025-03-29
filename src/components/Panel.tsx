import { Dispatch, ReactNode, SetStateAction } from "react";

export const Panel = ({ callback, deckMap }: {
  callback: Dispatch<SetStateAction<any>>,
  deckMap: ReactNode
}) => {

  return (
    <div id="Panel" className="grid grid-rows-6 justify-left bg-none">
      <div className="grid  mt-6 mb-6 bg-elevation-0 opacity-80 rounded-lg shadow-2xl [border:100px_solid_transparent] bg-clip-padding 
          [background-image:linear-gradient(to_right,#1A1A1A,#1A1A1A),linear-gradient(to_right,#5A67D8,#34C759)] 
          border-custom-blue shadow-custom-blue/40  ">
        {/* deckMap */}
      </div>
      {/* <div className="row-span-6 z-30 ml-10 mb-6 p-6 bg-elevation-0 opacity-95 rounded-lg shadow-2xl [border:2px_solid_transparent] bg-clip-padding 
          [background-image:linear-gradient(to_right,#1A1A1A,#1A1A1A),linear-gradient(to_right,#5A67D8,#34C759)] 
          border-custom-blue shadow-custom-blue/40">
      </div> */}
    </div>
  )
}

export default Panel;
