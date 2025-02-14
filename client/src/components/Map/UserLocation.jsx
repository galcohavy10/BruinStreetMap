// client/src/components/Map/UserLocation.jsx
import { useEffect } from "react";
import { useMap } from "react-leaflet";

export default function UserLocation({ setUserPosition }) {
  const map = useMap();

  useEffect(() => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log("User location updated:", latitude, longitude);
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
