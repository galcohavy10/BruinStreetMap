import React, { useRef, useEffect } from "react";
// import leaflet from "./leaflet";
import "./App.css";
import LeafletMap from "./leafletmap";

// let map = new L.map("map", mapOptions);

// let layer = new L.TileLayer(
//   "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
// );
// map.addLayer(layer);

// let marker = null;
// map.on("click", (event) => {
//   if (marker !== null) {
//     map.removeLayer(marker);
//   }

//   marker = L.marker([event.latlng.lat, event.latlng.lng]).addTo(map);

//   document.getElementById("latitude").value = event.latlng.lat;
//   document.getElementById("longitude").value = event.latlng.lng;
// });

function App() {
  return (
    <div className="App">
      <div>
        <h1>My Leaflet Map in React</h1>
        <LeafletMap />
      </div>
    </div>
  );
}

export default App;
