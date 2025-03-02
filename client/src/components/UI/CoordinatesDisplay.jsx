import React from 'react';

const CoordinatesDisplay = ({ coords }) => {
  if (!coords) return null;
  
  return (
    <div className="coordinates-display">
      <div>
        <b>Lat:</b> {coords.lat?.toFixed(5)}
      </div>
      <div>
        <b>Lng:</b> {coords.lng?.toFixed(5)}
      </div>
    </div>
  );
};

export default CoordinatesDisplay;