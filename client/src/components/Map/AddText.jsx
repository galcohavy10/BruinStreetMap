import { Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./map.css";

const AddText = ({ markers, setMarkers, setSelectedMarker }) => {
  // Handle Click Events on the Map
  function ClickHandler() {
    useMapEvents({
      click: (e) => {
        const newMarker = {
          id: Date.now(),
          coords: e.latlng,
          text: "", // Initially empty, user will input text
          color: "#000000", // Default text color
          fontSize: "14px", // Default font size
        };

        setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
        setSelectedMarker(newMarker); // Open text settings panel for this marker
      },
    });
    return null;
  }

  // Function to update the selected marker's properties

  return (
    <>
      {/* Handle Clicks on Map */}
      <ClickHandler />

      {/* Render Markers */}
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={marker.coords}
          icon={createTextIcon(marker.text, marker.color, marker.fontSize)}
          eventHandlers={{
            click: () => setSelectedMarker(marker), // Open panel when clicking a marker
          }}
        />
      ))}
    </>
  );
};

// Function to create a custom text marker
const createTextIcon = (text, color, fontSize) =>
  L.divIcon({
    className: "custom-text-marker",
    html: `<div class="text-label" style="color: ${color}; font-size: ${fontSize};">${text}</div>`,
    iconSize: [100, 30],
    iconAnchor: [50, 15],
  });

export default AddText;
