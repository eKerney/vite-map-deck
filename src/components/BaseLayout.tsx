import { FlyToInterpolator, MapViewState } from "deck.gl";
import { DeckMap } from "./DeckMap";
import { useState, useEffect, useCallback } from "react";
import D3Globe from "./D3Globe";
import * as d3 from 'd3';

export const BaseLayout = () => {
  console.log('BaseLayout')
  const createInitialView = (): MapViewState => ({ longitude: 0, latitude: 0, zoom: 2, pitch: 0, bearing: 0 });

  const [viewState, setViewState] = useState<MapViewState>(createInitialView);

  useEffect(() => console.log('viewState', viewState), [viewState]);
  const mapContStyle = "col-span-4 row-span-4 relative flex mt-8 -ml-24 opacity-80 rounded-lg shadow-2xl [border:0px_solid_transparent] bg-clip-padding [background-image:linear-gradient(to_right,#1A1A1A,#1A1A1A),linear-gradient(to_right,#5A67D8,#34C759)] border-custom-blue shadow-custom-blue";


  // d3.select("#DeckMap")
  //   .style('opacity', 0)
  //   .style('transform', 'scale(0.95)')
  //   .transition()
  //   .duration(1000)
  //   .ease(d3.easeCubicInOut)
  //   .style('opacity', 1)
  //   .style('transform', 'scale(1)');
  // };
  const handleGlobeClick = useCallback((coords: [number, number]) => {
    setViewState(prev => ({
      ...prev,
      latitude: coords[1],
      longitude: coords[0],
      zoom: 5,
      transitionDuration: 3000,
      transitionInterpolator: new FlyToInterpolator(),
    }));

    d3.select("#DeckMap")
      .style('opacity', 0)
      .style('transform', 'scale(0.95)')
      .transition()
      .duration(10000)
      .ease(d3.easeCubicInOut)
      .style('opacity', 1)
      .style('transform', 'scale(1)');
  }, []);
  // const onReset = useCallback(() => setViewState(createInitialView), []);

  const handleViewStateChange = useCallback(({ viewState }: { viewState: any }) => {
    setViewState(prev => ({
      ...prev,
      ...viewState,
    }));
  }, []);

  return (
    <>
      <div className="grid grid-cols-12 grid-rows-6 gap-0 h-screen overflow-visible bg-elevation-0 ">

        <div className="w-screen row-span-6 flex justify-center items-center " >
          <D3Globe onGlobeClick={handleGlobeClick} />
        </div>

        {
          viewState.latitude &&
          <div className={mapContStyle} id='DeckMap'>
            <DeckMap
              view_state={viewState}
              layers={[]}
            />
          </div>
        }
      </div>
    </>
  );
}

export default BaseLayout

