import DeckGL, { Layer, MapViewState } from 'deck.gl';
import { Map, FullscreenControl } from 'react-map-gl/maplibre';
import { useEffect, useMemo, useState } from 'react';

export const DeckMap = ({ view_state, layers }:
  { view_state: MapViewState, layers: Layer[] }) => {
  const MAP_KEY = import.meta.env.VITE_MAP_KEY, MAP_STYLE = import.meta.env.VITE_MAP_DARK;
  const memoizedLayers = useMemo(() => [...layers], [layers]);
  useEffect(() => console.log('MAP_KEY: ', MAP_KEY), []);

  // const [viewState, setViewState] = useState<MapViewState>({
  //   longitude: view_state.longitude,
  //   latitude: view_state.latitude,
  //   zoom: view_state.zoom,
  //   pitch: view_state.pitch,
  //   bearing: view_state.bearing
  // });

  const getTooltip = (info: any) => {
    if (!info.object) {
      return null;
    }
    return `\
    TEST`;
  };

  return (
    <DeckGL
      initialViewState={view_state}
      controller
      layers={[...memoizedLayers]}
      getTooltip={getTooltip}
    >
      <Map
        style={{ width: '100vw', height: '100vh' }}
        mapStyle={`https://api.maptiler.com/maps/${MAP_STYLE}/style.json?key=${MAP_KEY}`}
      >
        <FullscreenControl />
      </Map>
    </DeckGL >
  )
}

