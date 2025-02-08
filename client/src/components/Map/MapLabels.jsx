import React from "react";
import { Marker } from "react-leaflet";
import L from "leaflet";

// Bounding box (adjust for your map)
const bounds = [
  [34.0545, -118.456], // Southwest
  [34.0801, -118.4353], // Northeast
];

// Helper function to check if coordinates are within bounds
const isWithinBounds = (coords, bounds) => {
  const [[minLat, minLng], [maxLat, maxLng]] = bounds;
  return (
    coords.lat >= minLat &&
    coords.lat <= maxLat &&
    coords.lng >= minLng &&
    coords.lng <= maxLng
  );
};

// Function to generate a text marker inside the bounding box
const addTextToMap = (coords, text) => {
  if (!isWithinBounds(coords, bounds)) return null;

  // Create a DivIcon with the text
  const textIcon = L.divIcon({
    className: "custom-text-marker",
    html: `<div style="
      font-size: 20px;
      font-weight: 1000;
      text-align: center;
      -webkit-text-stroke: .5px black; /* Creates a 1px black stroke */
    ">${text}</div>`,
    //      text-shadow: 2px 2px 2px black; /* Adds a black shadow */
    iconSize: [100, 30],
    iconAnchor: [50, 15],
  });

  return <Marker position={coords} icon={textIcon} />;
};

// Component to Render Text Labels on the Map
const TextLabels = ({ mapLabels }) => {
  return (
    <>
      {mapLabels.map(
        ({ coords, text }, index) =>
          addTextToMap(coords, text) && (
            <Marker
              key={index}
              position={coords}
              icon={addTextToMap(coords, text).props.icon}
            />
          )
      )}
    </>
  );
};

export default TextLabels;
