import { useMapEvents } from "react-leaflet";

export default function MouseTracker({ coordsRef }) {
  useMapEvents({
    mousemove: (e) => {
      coordsRef.current = e.latlng; // Store in ref (no re-renders)
    },
  });
  return null;
}
