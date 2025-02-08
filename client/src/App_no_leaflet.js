import React, { useRef, useEffect } from "react";
import "./App.css";

function App() {
  const iframeRef = useRef(null);

  useEffect(() => {
    if (iframeRef.current) {
      console.log("Iframe Object:", iframeRef.current); // Print iframe object
    }
  }, []);

  // Function to update iframe source dynamically
  const updateIframeSrc = () => {
    if (iframeRef.current) {
      iframeRef.current.src =
        "https://www.openstreetmap.org/export/embed.html?bbox=-118.45,34.05,-118.40,34.10&layer=mapnik";
    }
  };

  // //cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/leaflet.js

  return (
    <div className="App">
      <div className="map">
        <iframe
          ref={iframeRef} // Attach ref to iframe
          title="map"
          width="425"
          height="350"
          src="https://www.openstreetmap.org/export/embed.html?bbox=-118.48969459533693%2C34.047432475078324%2C-118.4055805206299%2C34.09382368756353&amp;layer=mapnik"
          style={{ border: "1px solid black" }}
        ></iframe>
        <br />
        <small>
          <a href="https://www.openstreetmap.org/?#map=15/34.07063/-118.44764&amp;layers=N">
            View Larger Map
          </a>
        </small>
      </div>
      <button onClick={updateIframeSrc}>Update Iframe Source</button>
    </div>
  );
}

export default App;
