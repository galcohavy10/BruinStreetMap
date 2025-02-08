import React, { useMemo } from "react";
import { TileLayer, Marker, Popup, Polygon, Rectangle } from "react-leaflet";
import { defaultIcon } from "./Markers";

export const bounds = [
  [34.05449944312716, -118.45596313476564], // Southwest
  [34.08009560195322, -118.43527793884279], // Northeast
];

const [[minLat, minLng], [maxLat, maxLng]] = bounds;

const restrictedAreas = [
  // Top area
  [
    [maxLat, -180],
    [maxLat, 180],
    [90, 180],
    [90, -180],
  ],
  // Bottom area
  [
    [-90, -180],
    [-90, 180],
    [minLat, 180],
    [minLat, -180],
  ],
  // Left area
  [
    [minLat, -180],
    [minLat, minLng],
    [maxLat, minLng],
    [maxLat, -180],
  ],
  // Right area
  [
    [minLat, maxLng],
    [minLat, 180],
    [maxLat, 180],
    [maxLat, maxLng],
  ],
];

// Memoizing static elements so they don't re-render
const StaticMapElements = () =>
  useMemo(
    () => (
      <>
        {/* Tile Layer (OpenStreetMap) */}
        {/* <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
 */}

        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png"
          // Find all style options here: https://github.com/CartoDB/basemap-styles
          // light_all,
          // light_nolabels,
          // rastertiles/voyager,
          // rastertiles/voyager_nolabels,
          // rastertiles/voyager_labels_under
          attribution='&copy; <a href="https://carto.com/">Carto</a>'
        />
        {/* Marker */}
        <Marker position={[34.0522, -118.2437]} icon={defaultIcon}>
          <Popup>
            📍 Los Angeles, CA <br /> This is a Leaflet map in React!
          </Popup>
        </Marker>

        {/* Draw the shaded restricted areas */}
        {restrictedAreas.map((area, index) => (
          <Polygon
            key={index}
            positions={area}
            pathOptions={{ color: "none", fillColor: "red", fillOpacity: 0.3 }}
          />
        ))}

        {/* Optional: Draw a rectangle around the allowed area for clarity */}
        <Rectangle
          bounds={bounds}
          pathOptions={{ color: "red", fillColor: "none" }}
        />
      </>
    ),
    []
  );

export default StaticMapElements;
