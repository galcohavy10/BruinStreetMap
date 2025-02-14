// client/src/components/UI/TextSettingsPanel.jsx
import React, { useState, useEffect } from 'react';
import './TextSettingsPanel.css';

const TextSettingsPanel = ({ selectedMarker, setSelectedMarker, updateMarkerSettings }) => {
  const [text, setText] = useState('');

  useEffect(() => {
    if (selectedMarker) {
      setText(selectedMarker.text);
    }
  }, [selectedMarker]);

  const handleSave = async () => {
    const apiBaseUrl = process.env.REACT_APP_API_URL;
    try {
      const response = await fetch(`${apiBaseUrl}/notes/${selectedMarker.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, color: '#000000' }), // always set color to black
      });
      const updatedNote = await response.json();
      updateMarkerSettings({
        id: updatedNote.id,
        coords: selectedMarker.coords,
        text: updatedNote.text,
        color: '#000000',
        fontSize: selectedMarker.fontSize, // unchanged
      });
      setSelectedMarker(null);
    } catch (error) {
      console.error("Error updating note:", error);
    }
  };

  if (!selectedMarker) return null;

  return (
    <div className="text-settings-panel">
      <h2>Edit Marker</h2>
      <div className="section">
        <label>Marker Text</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter marker text"
          rows="3"
        />
      </div>
      <div className="actions">
        <button className="save-btn" onClick={handleSave}>Save</button>
        <button className="cancel-btn" onClick={() => setSelectedMarker(null)}>Cancel</button>
      </div>
    </div>
  );
};

export default TextSettingsPanel;
