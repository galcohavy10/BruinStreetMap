import React, { useState, useEffect } from "react";

const TextSettingsPanel = ({
  selectedMarker,
  setSelectedMarker,
  updateMarkerSettings,
}) => {
  const [text, setText] = useState("");
  const [color, setColor] = useState("black");
  const [fontSize, setFontSize] = useState("14px");

  // Sync UI with the selected marker
  useEffect(() => {
    if (selectedMarker) {
      setText(selectedMarker.text);
      setColor(selectedMarker.color);
      setFontSize(selectedMarker.fontSize);
    }
  }, [selectedMarker]);

  // Handle form submission
  const handleSave = () => {
    if (selectedMarker) {
      updateMarkerSettings({ ...selectedMarker, text, color, fontSize });
      setSelectedMarker(null); // Close the panel after saving
    }
  };

  if (!selectedMarker) return null; // Hide if no marker is selected



  return selectedMarker ? (
    <div className="text-settings-panel">
      <h3>Edit Text Marker</h3>
      <label>Text:</label>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <label>Text Color:</label>
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
      />

      <label>Font Size:</label>
      <select value={fontSize} onChange={(e) => setFontSize(e.target.value)}>
        <option value="12px">Small</option>
        <option value="14px">Medium</option>
        <option value="18px">Large</option>
        <option value="24px">X-Large</option>
      </select>

      <button onClick={handleSave}>Save</button>
    </div>
  ) : null;
};

export default TextSettingsPanel;
