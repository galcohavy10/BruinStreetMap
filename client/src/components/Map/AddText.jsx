//modifying
// client/src/components/Map/AddText.jsx
import { Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./map.css";

const AddText = ({ markers, setMarkers, setSelectedMarker }) => {
  function ClickHandler() {
    useMapEvents({
      click: async (e) => {
        // Use a temporary string ID so it doesn't conflict with the DB's integer IDs
        const newMarker = {
          id: `temp-${Date.now()}`,
          coords: e.latlng,
          text: "",
          color: "#000000",
          fontSize: "20px",
        };

        // Optimistically add the marker to the UI
        setMarkers((prevMarkers) => [...prevMarkers, newMarker]);

        // Use the API URL from env variables
        const apiBaseUrl = process.env.REACT_APP_API_URL || "";
        try {
          const response = await fetch(`${apiBaseUrl}/notes`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              lat: newMarker.coords.lat,
              lng: newMarker.coords.lng,
              text: newMarker.text,
              color: newMarker.color,
              fontSize: newMarker.fontSize,
            }),
          });
          const savedNote = await response.json();

          // Replace the temporary marker with the one returned by the backend
          setMarkers((prevMarkers) =>
            prevMarkers.map((marker) =>
              marker.id === newMarker.id
                ? { ...marker, id: savedNote.id }
                : marker
            )
          );
          // Only open the settings panel once we have the proper (numeric) id
          setSelectedMarker({ ...newMarker, id: savedNote.id });
        } catch (error) {
          console.error("Error saving note:", error);
        }
      },
    });
    return null;
  }

  const createTextIcon = (text, color, fontSize) =>
    L.divIcon({
      className: "custom-text-marker",
      html: `<div class="text-label" style="color: ${color}; font-size: ${fontSize};">${text}</div>`,
      iconSize: [100, 30],
      iconAnchor: [50, 15],
    });

  markers.forEach((marker) => console.log(marker));

  return (
    <>
      <ClickHandler />
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={marker.coords}
          icon={createTextIcon(marker.text, marker.color, marker.fontSize)}
          eventHandlers={{
            click: () => setSelectedMarker(marker),
          }}
        />
      ))}
    </>
  );
};

export default AddText;
