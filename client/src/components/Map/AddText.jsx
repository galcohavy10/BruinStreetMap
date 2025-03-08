// client/src/components/Map/AddText.jsx
import React, { forwardRef, useImperativeHandle } from "react";
import { Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./map.css";

const AddText = forwardRef(
  (
    {
      markers,
      setMarkers,
      setSelectedMarker,
      userPosition,
      drawingBoundary,
      setDrawingBoundary,
    },
    ref
  ) => {
    useImperativeHandle(ref, () => ({
      addTextAtCurrentLocation,
    }));

    const addMarkerAtPosition = async (position) => {
      // Create a temporary marker with unique ID and timestamp
      const tempTimestamp = Date.now();
      const newMarker = {
        id: `temp-${tempTimestamp}`,
        tempTimestamp, // Added this field for optimistic updates
        coords: position,
        text: "",
        color: "#000000",
        fontSize: "20px",
      };

      // Optimistically add the marker to the UI
      setMarkers((prevMarkers) => [...prevMarkers, newMarker]);

      // Try to save to backend
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

        // Check if response is OK before trying to parse JSON
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }

        const savedNote = await response.json();

        // Replace the temporary marker with the one returned by the backend
        setMarkers((prevMarkers) =>
          prevMarkers.map((marker) =>
            marker.tempTimestamp === newMarker.tempTimestamp
              ? { ...marker, id: savedNote.id }
              : marker
          )
        );

        // Only open the settings panel once we have the proper ID
        setSelectedMarker({ ...newMarker, id: savedNote.id });
      } catch (error) {
        console.error("Error saving note:", error);

        // If in development mode, still open the settings panel with temp ID
        if (process.env.NODE_ENV === "development") {
          setSelectedMarker(newMarker);
        }
      }
    };

    // Map click handler component
    function ClickHandler() {
      useMapEvents({
        click: async (e) => {
          // If we're in drawing mode, add point to boundary
          if (drawingBoundary !== null) {
            setDrawingBoundary((prev) => [
              ...prev,
              [e.latlng.lat, e.latlng.lng],
            ]);
          } else {
            // Otherwise add a new marker
            await addMarkerAtPosition(e.latlng);
          }
        },
      });
      return null;
    }

    // Create a custom icon for text markers
    const createTextIcon = (text, color, fontSize) => {
      // Default values if not provided
      const displayText = text || "";
      const displayColor = color || "#000000";
      const displayFontSize = fontSize || "20px";

      return L.divIcon({
        className: "custom-text-marker",
        html: `<div class="text-label" style="color: ${displayColor}; font-size: ${displayFontSize};">${displayText}</div>`,
        iconSize: [100, 30],
        iconAnchor: [50, 15],
      });
    };

    // Function to add text at current user location
    const addTextAtCurrentLocation = async () => {
      if (!userPosition) {
        console.error("User position not available");
        return;
      }

      // Convert userPosition array to latlng object
      const position = {
        lat: userPosition[0],
        lng: userPosition[1],
      };

      await addMarkerAtPosition(position);
    };

    return (
      <>
        <ClickHandler />
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={marker.coords}
            icon={createTextIcon(marker.text, marker.color, marker.fontSize)}
            eventHandlers={{
              click: () => {
                // If we're drawing, don't select on click
                if (drawingBoundary === null) {
                  setSelectedMarker(marker);
                }
              },
            }}
          />
        ))}
      </>
    );
  }
);

export default AddText;
