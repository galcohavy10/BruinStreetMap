const CoordinatesDisplay = ({ coords }) => {
  return (
    <div>
      <b>Latitude</b>: {coords?.lat?.toFixed(4) || "N/A"} <br />
      <b>Longitude</b>: {coords?.lng?.toFixed(4) || "N/A"}
    </div>
  );
};

export default CoordinatesDisplay;
