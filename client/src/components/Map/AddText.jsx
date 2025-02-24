//modifying
// client/src/components/Map/AddText.jsx
import { Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./map.css";

const AddText = ({ markers, setMarkers, setSelectedMarker, selectedMarker, drawingBoundary, setDrawingBoundary }) => {
  function ClickHandler() {
    useMapEvents({
      click: async (e) => {
          /*if (!selectedMarker) {
            // Create a new label marker
            const newMarker = {
              id: Date.now(),
              coords: { lat, lng },
              text: "New Label",
              boundary: [], // Initialize an empty boundary
            };
        
            setMarkers([...markers, newMarker]);
            setSelectedMarker(newMarker.id);
            setDrawingBoundary([]); // Start boundary drawing mode
          } else {
            // Add clicked point to the boundary
            setDrawingBoundary([...drawingBoundary, [lat, lng]]);
          }*/

        const { lat, lng } = e.latlng;
        //if selectedMarker is not null, reset drawing boundary; else reset the 
        if(selectedMarker){
          console.log(drawingBoundary);
          setDrawingBoundary([...drawingBoundary, [lat, lng]]);
        }
        else {
          console.log(drawingBoundary);
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

            //set drawingBoundary to empty
            setDrawingBoundary([]);
          } catch (error) {
            console.error("Error saving note:", error);
            //for dev purposes, change setSelectedMarker and drawingBoundary even if there's an error in the backend
            setSelectedMarker(newMarker);
            setDrawingBoundary([]);
          }
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

  //markers.forEach((marker) => console.log(marker));

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
