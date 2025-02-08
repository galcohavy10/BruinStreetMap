import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  Polygon,
  Rectangle,
} from "react-leaflet";
import "leaflet/dist/leaflet.css"; // Import Leaflet CSS
import L from "leaflet"; // Import Leaflet

// Fix default marker issue in React-Leaflet
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const bounds = [
  [34.05449944312716, -118.45596313476564], // southwest
  [34.08009560195322, -118.43527793884279], //north east
];

const [[minLat, minLng], [maxLat, maxLng]] = bounds;

const center = [
  (bounds[0][0] + bounds[1][0]) / 2,
  (bounds[0][1] + bounds[1][1]) / 2,
];

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

function MyComponent() {
  const map = useMapEvents({
    click: () => {
      map.locate();
    },
    locationfound: (location) => {
      console.log("location found:", location);
    },
  });
  return null;
}

function AlsoMyComponent({ setCoords }) {
  const map = useMapEvents({
    mousemove: (e) => {
      setCoords(e.latlng);
    },
  });
  return null;
}

const LeafletMap = () => {
  const [map, setMap] = useState(null);
  const [coords, setCoords] = useState({});

  console.log("rerender");

  return (
    <>
      <MapContainer
        center={center} // Los Angeles, CA
        zoom={13}
        style={{ height: "500px", width: "100%" }}
        whenCreated={setMap}
        maxBounds={bounds} // Restricts panning
        maxBoundsViscosity={0.5} // snaps back into bounds
        minZoom={14} // Prevents zooming out too much
        // maxZoom={18} // Prevents zooming in too much
      >
        <MyComponent />
        <AlsoMyComponent setCoords={setCoords} />
        {/* Tile Layer (OpenStreetMap) */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
      </MapContainer>
      {coords.lat && (
        <div>
          <b>latitude</b>: {coords.lat?.toFixed(4)} <br />
          <b>longitude</b>: {coords.lng?.toFixed(4)}
        </div>
      )}
    </>
  );
};

export default LeafletMap;
