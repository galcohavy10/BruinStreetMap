import React from "react";
import { Marker } from "react-leaflet";
import L from "leaflet";

// Bounding box for UCLA campus area
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
const createMapLabel = (coords, text) => {
  if (!isWithinBounds(coords, bounds)) return null;

  // Create a DivIcon with the text and styled appearance
  const textIcon = L.divIcon({
    className: "map-label",
    html: `
      <div class="map-label-content">
        <div class="map-label-text">${text}</div>
      </div>
    `,
    iconSize: [120, 40],
    iconAnchor: [60, 20],
  });

  return <Marker position={coords} icon={textIcon} />;
};

// Component to Render Campus Building Labels on the Map
const TextLabels = ({ mapLabels }) => {
  return (
    <>
      <style jsx global>{`
        .map-label {
          pointer-events: none;
        }
        
        .map-label-content {
          background: rgba(58, 97, 134, 0.85);
          color: white;
          padding: 5px 10px;
          border-radius: 6px;
          font-weight: 500;
          font-size: 14px;
          text-align: center;
          white-space: nowrap;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(2px);
          transform: translateY(-5px);
          position: relative;
        }
        
        .map-label-content:after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid rgba(58, 97, 134, 0.85);
        }
      `}</style>
    
      {mapLabels.map(
        ({ coords, text }, index) =>
          createMapLabel(coords, text) && (
            <Marker
              key={index}
              position={coords}
              icon={createMapLabel(coords, text).props.icon}
            />
          )
      )}
    </>
  );
};

export default TextLabels;