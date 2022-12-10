import { useEffect } from "react";
import { Map } from "react-map-gl";
import { AmbientLight, PointLight, LightingEffect } from "@deck.gl/core";
import { ColumnLayer } from "deck.gl";
import { csv, scaleQuantile } from "d3";
import DeckGL from "@deck.gl/react";
import locations from "../public/data/locations.json";

// Source data CSV
const DATA_URL =
  "https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/3d-heatmap/heatmap-data.csv"; // eslint-disable-line

const STYLE_URL = "mapbox://styles/niko-dellic/clbia19zk000014s8rguwix36";

const data = csv(DATA_URL).then((data) => {
  const points = data.map((d) => [Number(d.lng), Number(d.lat)]);
  return points;
});

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0,
});

const pointLight1 = new PointLight({
  color: [255, 255, 255],
  intensity: 0.8,
  position: [22.160414, 41.659566, 80000],
});

const pointLight2 = new PointLight({
  color: [255, 255, 255],
  intensity: 0.8,
  position: [20.160414, 43.659566, 8000],
});

const lightingEffect = new LightingEffect({
  ambientLight,
  pointLight1,
  pointLight2,
});

const material = {
  ambient: 0.64,
  diffuse: 0.6,
  shininess: 32,
  specularColor: [51, 51, 51],
};

const INITIAL_VIEW_STATE = {
  // center on pristina, kosovo
  longitude: 21.162914,
  latitude: 42.659766,
  zoom: 15.5,
  minZoom: 5,
  pitch: 40.5,
  bearing: 45,
};

function getTooltip({ object }) {
  if (!object) {
    return null;
  }
  console.log(object.properties.visitors);

  return `Visitors: ${object.properties.visitors}`;
}

function colorScale(data, item) {
  const scale = scaleQuantile()
    .domain(data.map((d) => d.properties.visitors))
    .range([
      [1, 152, 189],
      [73, 227, 206],
      [216, 254, 181],
      [254, 237, 177],
      [254, 173, 84],
      [209, 55, 78],
    ]);

  console.log(scale(item));
  return scale(item);
}

function map_range(value, low1, high1, low2, high2) {
  const remapValue = low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);

  return [remapValue, remapValue, remapValue];
}

const visitorData = locations.features.map((d) => d.properties.visitors);

const visitorBounds = [Math.min(...visitorData), Math.max(...visitorData)];

export default function DeckMap({
  radius = 1000,
  upperPercentile = 100,
  coverage = 1,
}) {
  // use effect to add event listener to prevent context menu
  useEffect(() => {
    document.addEventListener("contextmenu", (e) => e.preventDefault());
  }, []);

  const layers = [
    new ColumnLayer({
      id: "column-layer",
      data: locations.features,
      diskResolution: 12,
      radius: 20,
      extruded: true,
      getPosition: (d) => d.geometry.coordinates,
      // getFillColor: (d) =>
      //   map_range(
      //     d.properties.visitors,
      //     visitorBounds[0],
      //     visitorBounds[1],
      //     0,
      //     255
      //   ),
      getFillColor: (d) =>
        colorScale(locations.features, d.properties.visitors),
      getElevation: (d) => d.properties.visitors,
      elevationScale: 0.05,
      opacity: 0.4,
      material,
      pickable: true,
      autoHighlight: true,
      highlightColor: [255, 255, 255, 155],
      transitions: {
        elevationScale: 3000,
      },
    }),
  ];

  return (
    <DeckGL
      layers={layers}
      effects={[lightingEffect]}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      getTooltip={getTooltip}
    >
      <Map
        reuseMaps
        mapStyle={STYLE_URL}
        preventStyleDiffing={true}
        mapboxAccessToken={
          "pk.eyJ1Ijoibmlrby1kZWxsaWMiLCJhIjoiY2w5c3p5bGx1MDh2eTNvcnVhdG0wYWxkMCJ9.4uQZqVYvQ51iZ64yG8oong"
        }
      />
    </DeckGL>
  );
}
