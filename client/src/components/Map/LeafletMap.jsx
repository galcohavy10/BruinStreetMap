import React, { useState, useRef, useEffect } from "react";
import { MapContainer, Marker, CircleMarker, Polygon } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { userIcon } from "./Markers";
import MouseTracker from "./MouseTracker";
import UserLocation from "./UserLocation";
import CoordinatesDisplay from "../UI/CoordinatesDisplay";
import TextLabels from "./MapLabels"; // Import text label component
import StaticMapElements, { bounds } from "./StaticMapElements";
import TextSettingsPanel from "../UI/TextSettingsPanel";
import AddText from "./AddText";

// TODO: Allow users to change position of the labels, and add an X button to the text settings panel.

const center = [
  (bounds[0][0] + bounds[1][0]) / 2,
  (bounds[0][1] + bounds[1][1]) / 2,
];

const mapLabels = [
  { coords: { lat: 34.065, lng: -118.445 }, text: "Point A" },
  { coords: { lat: 34.072, lng: -118.44 }, text: "Point B" },
]; // intended to be used for labeling buildings

const LeafletMap = () => {
  const coordsRef = useRef(null); // Store coordinates without triggering re-renders
  const [userPosition, setUserPosition] = useState(null);
  const [markers, setMarkers] = useState([]); // Stores all text markers
  const [selectedMarker, setSelectedMarker] = useState(null); // Marker currently being edited
  const [drawingBoundary, setDrawingBoundary] = useState([]); //Mark the coordinates of the label boundary polygon

  // Only update UI every 100ms (prevents excessive renders)
  const [throttleCoords, setThrottleCoords] = useState(null);
  useEffect(() => {
    const interval = setInterval(() => {
      setThrottleCoords(coordsRef.current);
    }, 100); // Adjust interval as needed (100ms is smooth enough)
    return () => clearInterval(interval);
  }, []);

  // *** NEW: Fetch notes from backend on mount ***
  useEffect(() => {
    const apiBaseUrl = process.env.REACT_APP_API_URL || "";
    fetch(`${apiBaseUrl}/notes`, { method: "GET" })
      .then((response) => response.json())
      .then((data) => {
        // Transform each note to match expected structure
        const transformedMarkers = data.map((note) => ({
          id: note.id,
          coords: { lat: note.lat, lng: note.lng },
          text: note.text,
          color: note.color,
          fontSize: note.font_size,
        }));
        setMarkers(transformedMarkers);
      })
      .catch((error) => console.error("Error fetching notes:", error));
  }, []);

  const updateMarkerSettings = (updatedMarker) => {
    setMarkers((prevMarkers) =>
      prevMarkers.map((marker) =>
        marker.id === updatedMarker.id ? updatedMarker : marker
      )
    );
  };


//handle clicking finish
const handleFinishDrawing = () => {
  if (!selectedMarker || drawingBoundary.length < 3) return; // A polygon needs at least 3 points

  setMarkers((prevMarkers) =>
    {
      return prevMarkers.map((marker) =>
        marker.id === selectedMarker
          ? { ...marker, boundary: drawingBoundary }
          : marker
      );
    }
  );

  setSelectedMarker(null);
  setDrawingBoundary(null); // Exit drawing mode
};

  return (
    <div className="map-container">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100vh", width: "100vw" }}
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
        {/*{markers.map((marker) => (
          <React.Fragment key={marker.id}>
            <Marker position={[marker.coords.lat, marker.coords.lng]}>
              <Popup>{marker.text}</Popup>
            </Marker>

            {marker.boundary?.length > 2 && (
              <Polygon
                positions={marker.boundary}
                color="blue"
                fillOpacity={0.3}
              />
            )}
          </React.Fragment>
        ))}*/}

        {/* Show live drawing */}
        {drawingBoundary && drawingBoundary.length > 1 && (
          <Polygon positions={drawingBoundary} color="red" fillOpacity={0.3} />
        )}

        {/* Finish button (Only visible when drawing) */}
        {drawingBoundary && drawingBoundary.length > 2 && (
          <button onClick={handleFinishDrawing} style={{ position: "absolute", top: 10, left: 10, zIndex: 1000 }}>
            Finish Boundary
          </button>
        )}

        {/* Render Text Labels */}
        <TextLabels mapLabels={mapLabels} />
        <AddText
          markers={markers}
          setMarkers={setMarkers}
          setSelectedMarker={setSelectedMarker}
          selectedMarker = {selectedMarker}
          drawingBoundary={drawingBoundary}
          setDrawingBoundary={setDrawingBoundary}
        />
        {StaticMapElements()}
      </MapContainer>

      <TextSettingsPanel
        selectedMarker={selectedMarker}
        setSelectedMarker={setSelectedMarker}
        updateMarkerSettings={updateMarkerSettings}
      />

      <CoordinatesDisplay coords={throttleCoords} />
    </div>
  );
};

export default LeafletMap;
