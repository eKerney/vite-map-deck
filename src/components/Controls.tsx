import { PanelProps } from "./types";

export const Controls = ({ items, renderItems }: PanelProps) => {
  // const panelStyle = "w-full bg-elevation-0 opacity-100 rounded-lg shadow-2xl [border:100px_solid_transparent] bg-clip-padding [background-image:linear-gradient(to_right,#1A1A1A,#1A1A1A),linear-gradient(to_right,#5A67D8,#34C759)] border-custom-blue shadow-custom-blue/40";

  return (
    <div id="Panel" className="bg-transparent opacity-70 ">
      {items.map((d, i) => (<div className="z-50 w-fit" key={`${d[0]}-${i}`}>{renderItems(d, i)}</div>))}
    </div >
  )
}

export default Controls;
