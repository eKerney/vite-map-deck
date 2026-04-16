import DeckGL, { Layer, MapViewState } from 'deck.gl';
import { Map, FullscreenControl } from 'react-map-gl/maplibre';
import { memo } from 'react';

export const DeckMap = memo(({ view_state }:
  {
    view_state: MapViewState,
    layers: Layer[],
  }) => {

  const MAP_KEY = import.meta.env.VITE_MAP_KEY, MAP_STYLE = import.meta.env.VITE_MAP_DARK;
  // const memoizedLayers = useMemo(() => [...layers], [layers]);

  // const getTooltip = (info: any) => {
  //   if (!info.object) {
  //     return null;
  //   }
  //   return `\
  //   TEST`;
  // };

  return (
    <DeckGL
      initialViewState={view_state}
      controller
      layers={[]}
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
)

export default DeckMap;
