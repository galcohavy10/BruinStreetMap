import L from "leaflet";

// Fix default marker issue in React-Leaflet
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";

export const userIcon = L.divIcon({
  className: "custom-user-icon",
  html: `<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
           <circle cx="10" cy="10" r="8" fill="blue" stroke="white" stroke-width="3"/>
         </svg>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export const defaultIcon = L.icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
