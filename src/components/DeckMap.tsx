import DeckGL, { Layer, MapViewState } from 'deck.gl';
import { Map, FullscreenControl } from 'react-map-gl/maplibre';
import { useEffect, useMemo } from 'react';

export const DeckMap = ({ view_state, layers }:
  { view_state: MapViewState, layers: Layer[] }) => {

  const MAP_KEY = import.meta.env.VITE_MAP_KEY, MAP_STYLE = import.meta.env.VITE_MAP_DARK;
  const memoizedLayers = useMemo(() => [...layers], [layers]);

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
      style={{ width: '100%', height: '100%' }}
    >
      <Map
        style={{ width: '100%', height: '100%' }}
        mapStyle={`https://api.maptiler.com/maps/${MAP_STYLE}/style.json?key=${MAP_KEY}`}
      >
        <FullscreenControl />
      </Map>
    </DeckGL >
  )
}

