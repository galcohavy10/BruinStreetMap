import React, { useState, useEffect } from 'react';
import './TextSettingsPanel.css';

const TextSettingsPanel = ({ selectedMarker, setSelectedMarker, updateMarkerSettings }) => {
  const [text, setText] = useState('');
  const [color, setColor] = useState('#000000');
  const [fontSize, setFontSize] = useState('20px');
  
  const colorOptions = [
    '#000000', // Black
    '#0D47A1', // Dark Blue
    '#1976D2', // Blue
    '#2E7D32', // Green
    '#D32F2F', // Red
    '#7B1FA2', // Purple
    '#F57C00', // Orange
    '#5D4037', // Brown
  ];

  const fontSizeOptions = [
    { value: '16px', label: 'Small' },
    { value: '20px', label: 'Medium' },
    { value: '24px', label: 'Large' },
    { value: '30px', label: 'X-Large' },
  ];

  useEffect(() => {
    if (selectedMarker) {
      setText(selectedMarker.text || '');
      setColor(selectedMarker.color || '#000000');
      setFontSize(selectedMarker.fontSize || '20px');
    }
  }, [selectedMarker]);

  const handleSave = async () => {
    if (!selectedMarker) return;
    
    const apiBaseUrl = process.env.REACT_APP_API_URL || "";
    try {
      const response = await fetch(`${apiBaseUrl}/notes/${selectedMarker.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text, 
          color, 
          fontSize
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const updatedNote = await response.json();
      
      // Update UI with the returned note data
      const updatedMarker = {
        id: updatedNote.id,
        coords: selectedMarker.coords,
        text: updatedNote.text,
        color: updatedNote.color,
        fontSize: updatedNote.font_size || fontSize,
      };
      
      updateMarkerSettings(updatedMarker);
      setSelectedMarker(null);
    } catch (error) {
      console.error("Error updating note:", error);
      
      // Fallback to optimistic update if server fails
      const updatedMarker = {
        ...selectedMarker,
        text,
        color,
        fontSize
      };
      
      updateMarkerSettings(updatedMarker);
      setSelectedMarker(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedMarker) return;
    
    if (window.confirm('Are you sure you want to delete this marker?')) {
      const apiBaseUrl = process.env.REACT_APP_API_URL || "";
      try {
        await fetch(`${apiBaseUrl}/notes/${selectedMarker.id}`, {
          method: 'DELETE'
        });
        // Remove the marker from the UI
        updateMarkerSettings(null);
        setSelectedMarker(null);
      } catch (error) {
        console.error("Error deleting note:", error);
      }
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
          placeholder="Enter text to display on map"
          rows="3"
        />
      </div>
      
      <div className="section">
        <label>Text Color</label>
        <div className="color-picker">
          {colorOptions.map((colorOption) => (
            <div
              key={colorOption}
              className={`color-option ${color === colorOption ? 'selected' : ''}`}
              style={{ backgroundColor: colorOption }}
              onClick={() => setColor(colorOption)}
              title={colorOption}
            />
          ))}
        </div>
      </div>
      
      <div className="section">
        <label>Font Size</label>
        <div className="font-size-options">
          <select 
            value={fontSize} 
            onChange={(e) => setFontSize(e.target.value)}
            className="font-size-select"
          >
            {fontSizeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="actions">
        <button className="save-btn" onClick={handleSave}>Save Changes</button>
        <button className="cancel-btn" onClick={() => setSelectedMarker(null)}>Cancel</button>
      </div>
      
      <button className="delete-btn" onClick={handleDelete}>Delete Marker</button>
    </div>
  );
};

export default TextSettingsPanel;