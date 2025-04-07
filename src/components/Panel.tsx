import { Dispatch, ReactNode, SetStateAction } from "react";

type PanelProps = {
  items: string[];
  renderItems: (item: string, index: number) => ReactNode;
  callback?: Dispatch<SetStateAction<any>>,
};

export const Panel = ({ items, renderItems, callback }: PanelProps) => {
  const panelStyle = "w-full bg-elevation-0 opacity-100 rounded-lg shadow-2xl [border:100px_solid_transparent] bg-clip-padding [background-image:linear-gradient(to_right,#1A1A1A,#1A1A1A),linear-gradient(to_right,#5A67D8,#34C759)] border-custom-blue shadow-custom-blue/40";

  return (
    <div id="Panel" >
      <div className={""}>
        {items.map((d, i) => (<div className="z-50 w-full" key={i}>{renderItems(d, i)}</div>))}
      </div>
    </div >
  )
}

export default Panel;
