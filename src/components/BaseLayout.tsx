import { FlyToInterpolator, MapViewState } from "deck.gl";
import { DeckMap } from "./DeckMap";
import { useState, useEffect, useCallback } from "react";
import D3Globe from "./D3Globe";
import * as d3 from 'd3';

export const BaseLayout = () => {
  const createInitialView = (): MapViewState => ({ longitude: 0, latitude: 0, zoom: 2, pitch: 0, bearing: 0 });
  const [viewState, setViewState] = useState<MapViewState>(createInitialView);

  useEffect(() => console.log('viewState', viewState), [viewState]);
  const mapContStyle = "col-span-4 row-span-4 relative flex mt-8 -ml-24 opacity-0 rounded-lg shadow-2xl [border:0px_solid_transparent] bg-clip-padding [background-image:linear-gradient(to_right,#1A1A1A,#1A1A1A),linear-gradient(to_right,#5A67D8,#34C759)] border-custom-blue shadow-custom-blue";

  // const handleGlobeClick = useCallback((coords: [number, number]) => {
  //   setViewState(prev => ({
  //     ...prev,
  //     latitude: coords[1],
  //     longitude: coords[0],
  //     zoom: 10,
  //     transitionDuration: 4000,
  //     transitionInterpolator: new FlyToInterpolator(),
  //   }));
  //
  //   const mapPanel = d3.select("#DeckMap")
  //     .style('opacity', 0)
  //     .style('transform', 'scale(0.95)')
  //     .transition()
  //     .duration(3000)
  //     .ease(d3.easeCubicInOut)
  //     .style('opacity', 1)
  //     .style('transform', 'scale(1)');
  // }, []);

  const handleGlobeClick = useCallback((
    coords: [number, number] | never[],
    screenPos: [number, number],
    viewState: MapViewState
  ) => {
    setViewState(prev => ({
      ...prev,
      latitude: coords[1],
      longitude: coords[0],
      zoom: 8,
      transitionDuration: 3000,
      transitionInterpolator: new FlyToInterpolator(),
    }));

    const mapPanel = d3.select("#DeckMap")
    const finalLeft = 140, finalTop = 0, finalWidth = 600, finalHeight = 540;

    if (viewState.latitude == 0) {
      console.log(viewState)
      const [startX, startY] = screenPos;
      mapPanel
        .style('position', 'absolute')
        .style('left', `${startX + 80}px`)
        .style('top', `${startY - 20}px`)
        .style('width', '20px')
        .style('height', '20px')
        .style('opacity', .1)
        .transition()
        .duration(1000)
        .ease(d3.easeCubicInOut)
        .style('left', `${finalLeft}px`)
        .style('top', `${finalTop}px`)
        .style('width', `${finalWidth}px`)
        .style('height', `${finalHeight}px`)
        .style('opacity', 1)
      // .on('end', () => {
      //   mapPanel.style('position', null); // Reset to grid layout
      // });
    } else {
      mapPanel
        .style('position', null)
        .style('left', null)
        .style('top', null)
        .style('width', null)
        .style('height', null)
        .style('opacity', 1);
    }
  }, []);


  return (
    <>
      <div className="grid grid-cols-12 grid-rows-6 gap-0 h-screen overflow-visible bg-elevation-0 ">

        <div className="w-screen row-span-6 flex justify-center items-center " >
          <D3Globe
            onGlobeClick={handleGlobeClick}
            viewState={viewState}
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

