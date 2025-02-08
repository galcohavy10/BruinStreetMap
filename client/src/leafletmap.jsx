import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  Polygon,
  Rectangle,
  useMap,
  CircleMarker,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker issue in React-Leaflet
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";

const userIcon = L.divIcon({
  className: "custom-user-icon",
  html: `<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
           <circle cx="10" cy="10" r="8" fill="blue" stroke="white" stroke-width="3"/>
         </svg>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const defaultIcon = L.icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const bounds = [
  [34.05449944312716, -118.45596313476564], // Southwest
  [34.08009560195322, -118.43527793884279], // Northeast
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

function MouseTracker({ coordsRef }) {
  useMapEvents({
    mousemove: (e) => {
      coordsRef.current = e.latlng; // Store in ref (no re-renders)
    },
  });
  return null;
}

function UserLocation({ setUserPosition }) {
  const map = useMap();

  useEffect(() => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by your browser");
      return;
    }

    // Get user's location
    navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserPosition([latitude, longitude]);
      },
      (error) => {
        console.error("Error getting location:", error);
      },
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
  }, [map, setUserPosition]);

  return null;
}

const LeafletMap = () => {
  const coordsRef = useRef(null); // Store coordinates without triggering re-renders
  const [userPosition, setUserPosition] = useState(null);

  // Only update UI every 100ms (prevents excessive renders)
  const [throttleCoords, setThrottleCoords] = useState(null);
  useEffect(() => {
    const interval = setInterval(() => {
      setThrottleCoords(coordsRef.current);
    }, 100); // Adjust interval as needed (100ms is smooth enough)
    return () => clearInterval(interval);
  }, []);

  // Memoizing static elements so they don't re-render
  const staticMapElements = useMemo(
    () => (
      <>
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
      </>
    ),
    []
  );

  console.log("Re-render"); // Now only logs on state changes

  return (
    <>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "500px", width: "100%" }}
        maxBounds={bounds}
        maxBoundsViscosity={0.5}
        minZoom={14}
      >
        <MouseTracker coordsRef={coordsRef} />

        <UserLocation setUserPosition={setUserPosition} />

        {/* Show user's location if available */}
        {userPosition && <Marker position={userPosition} icon={userIcon} />}

        {/* Draw a circle marker for smooth animation */}
        {userPosition && (
          <CircleMarker
            center={userPosition}
            radius={10}
            fillColor="blue"
            color="white"
            fillOpacity={0.6}
          />
        )}

        {staticMapElements}
      </MapContainer>

      {/* Display coordinates */}
      <div>
        <b>latitude</b>: {throttleCoords?.lat?.toFixed(4) || "N/A"} <br />
        <b>longitude</b>: {throttleCoords?.lng?.toFixed(4) || "N/A"}
      </div>
    </>
  );
};

export default LeafletMap;
