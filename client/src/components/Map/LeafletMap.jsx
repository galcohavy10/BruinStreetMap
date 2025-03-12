import React, { useState, useRef, useEffect } from "react";
import {
  MapContainer,
  Marker,
  CircleMarker,
  Tooltip,
  Popup,
  ZoomControl,
  useMap,
  Polygon,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { userIcon } from "./Markers";
import MouseTracker from "./MouseTracker";
import UserLocation from "./UserLocation";
import CoordinatesDisplay from "../UI/CoordinatesDisplay";
import TextLabels from "./MapLabels";
import StaticMapElements, { bounds } from "./StaticMapElements";
import "./map.css";
import * as turf from "@turf/turf";
import { useNavigate } from "react-router-dom";
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
// Center of UCLA campus
const center = [
  (bounds[0][0] + bounds[1][0]) / 2,
  (bounds[0][1] + bounds[1][1]) / 2,
];

// Add accurate coordinates for UCLA buildings
const mapLabels = [
  { coords: { lat: 34.0729, lng: -118.4422 }, text: "Royce Hall" },
  { coords: { lat: 34.0716, lng: -118.4422 }, text: "Powell Library" },
  { coords: { lat: 34.07219, lng: -118.44317 }, text: "Janss Steps" },
  { coords: { lat: 34.070406, lng: -118.444259 }, text: "Ackerman Union" },
];

// Icons for the UI
const CommentIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const UpvoteIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
);

const DownvoteIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 5v14M5 12l7 7 7-7" />
  </svg>
);

// ClickHandler component to detect map clicks
const ClickHandler = ({ onMapClick }) => {
  const map = useMap();

  useEffect(() => {
    const handleClick = (e) => {
      onMapClick(e.latlng);
    };

    map.on("click", handleClick);

    return () => {
      map.off("click", handleClick);
    };
  }, [map, onMapClick]);

  return null;
};

const LeafletMap = ({ onLogout, user }) => {
  const navigate = useNavigate();
  const coordsRef = useRef(null);
  const [userPosition, setUserPosition] = useState(null);
  const [notes, setNotes] = useState([]);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showNotesList, setShowNotesList] = useState(false);
  const [throttleCoords, setThrottleCoords] = useState(null);
  const [activeNote, setActiveNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [drawingBoundary, setDrawingBoundary] = useState([]);

  // Votes tracking with starting value of 0 (not random)
  const [votes, setVotes] = useState({});
  // Track user votes to prevent multiple voting
  const [userVotes, setUserVotes] = useState({});

  // Handle hovering over a polygon
  const [hovered, setHovered] = useState(null);

  // Handle clicking on a note and showing its thread
  const [noteThread, setNoteThread] = useState(null);

  // Track the selected search location
  const [searchLocation, setSearchLocation] = useState(null);

  // Comment Text
  const [commentText, setCommentText] = useState("");

  // Throttled coordinate updates
  useEffect(() => {
    const interval = setInterval(() => {
      setThrottleCoords(coordsRef.current);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Fetch notes from API
  useEffect(() => {
    const fetchNotes = async () => {
      const apiBaseUrl = process.env.REACT_APP_API_URL || "";
      try {
        const response = await fetch(`${apiBaseUrl}/notes`);

        if (!response.ok) {
          // Don't set sample data, just use empty array
          setNotes([]);
          return;
        }

        const data = await response.json();

        // should check validity of data, but skip for now.

        const notes = data.notes;

        setNotes(notes);

        // Initialize votes to 0
        const initialVotes = {};
        notes.forEach((note) => {
          initialVotes[note.id] = {
            upvotes: 0,
            downvotes: 0,
          };
        });
        setVotes(initialVotes);
      } catch (error) {
        console.error("Error fetching notes:", error);
        setNotes([]);
      }
    };

    fetchNotes();
  }, []);

  // Add this right after the useEffect where you fetch notes
  useEffect(() => {
    // Guard clause with proper type checking
    if (!notes || !Array.isArray(notes) || notes.length === 0) return;
  
    const fetchVotes = async () => {
      const apiBaseUrl = process.env.REACT_APP_API_URL || "";
      try {
        console.log("Fetching votes for notes:", notes.map(n => n.id));
        
        // Fetch votes for each note with robust error handling
        const votePromises = notes.map((note) => {
          // Skip notes without valid IDs
          if (!note || !note.id) {
            console.log("Skipping note with no ID:", note);
            return Promise.resolve({ upvotes: "0", downvotes: "0" });
          }
          
          return fetch(`${apiBaseUrl}/notes/${note.id}/votes`)
            .then((res) => {
              if (!res.ok) {
                console.log(`Error fetching votes for note ${note.id}: ${res.status}`);
                return { upvotes: "0", downvotes: "0" };
              }
              console.log(res);
              return res.json();
            })
            .catch((error) => {
              console.error(`Failed to fetch votes for note ${note.id}:`, error);
              return { upvotes: "0", downvotes: "0" };
            });
        });
  
        const voteResults = await Promise.all(votePromises);
        console.log("Vote results:", voteResults);
  
        // Create votes object
        const votesObj = {};
        notes.forEach((note, index) => {
          if (!note || !note.id) return;
          
          // Handle potential undefined or malformed vote results
          const result = voteResults[index] || { upvotes: "0", downvotes: "0" };
          
          votesObj[note.id] = {
            upvotes: parseInt(result.upvotes || 0),
            downvotes: parseInt(result.downvotes || 0),
          };
        });
  
        console.log("Setting votes:", votesObj);
        setVotes(votesObj);
      } catch (error) {
        console.error("Error in vote fetching process:", error);
        // Don't leave votes empty on error
        const safeVotes = {};
        notes.forEach(note => {
          if (note && note.id) {
            safeVotes[note.id] = { upvotes: 0, downvotes: 0 };
          }
        });
        setVotes(safeVotes);
      }
    };
  
    fetchVotes();
  }, [notes]);

  // Checks if point (lat, lng) is inside the bounds of UCLA
  const isWithinBounds = (lat, lng) => {
    const [[minLat, minLng], [maxLat, maxLng]] = bounds;
    return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
  };

  const handleMapClick = (latlng) => {
    const { lat, lng } = latlng;

    if (searchQuery.length > 0){
      if (!isWithinBounds(lat, lng)) {
        setSearchQuery("");
        setSearchLocation(null);
        return;
      }
      else{
        setSearchLocation([lat, lng]);
        console.log("Search location specified");
      }
    }
    else{
      // Makes sure the point clicked upon is within UCLA bounds
      if (!isWithinBounds(lat, lng)) {
        alert("Please select a location within UCLA bounds.");
        return;
      }

      // Store selected location and show note form
      setSelectedLocation(latlng);
      setShowNoteForm(true);
      setDrawingBoundary([...drawingBoundary, [lat, lng]]);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const submitNote = async () => {
    if (!noteTitle || !selectedLocation) return;
  
    // Convert single-point notes to squares
    let displayed_bounds = drawingBoundary;
    if (displayed_bounds.length < 3){
      let lat_delta = 0.0003;
      let long_delta = 0.0003;
      displayed_bounds = [
        [selectedLocation.lat + lat_delta, selectedLocation.lng + long_delta],
        [selectedLocation.lat - lat_delta, selectedLocation.lng + long_delta],
        [selectedLocation.lat - lat_delta, selectedLocation.lng - long_delta],
        [selectedLocation.lat + lat_delta, selectedLocation.lng - long_delta]
      ]
    }
  
    console.log("Displayed bounds:", displayed_bounds);
  
    // Prepare the new note
    const newNote = {
      id: `temp-${Date.now()}`,
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
      title: noteTitle,
      color: "#000000",
      font_size: "20px",
      created_at: new Date().toISOString(),
      bounds: displayed_bounds,
      comments: [],
    };
  
    //reset drawingBoundary to empty array
    setDrawingBoundary([]);
  
    // Optimistically add to UI
    setNotes((prev) => [...prev, newNote]);
  
    // Initialize votes to 0
    setVotes((prev) => ({
      ...prev,
      [newNote.id]: { upvotes: 0, downvotes: 0 },
    }));
  
    // Reset form
    setNoteTitle("");
    setShowNoteForm(false);
  
    // Submit to API
    const apiBaseUrl = process.env.REACT_APP_API_URL || "";
  
    console.log("API Base URL:", apiBaseUrl);

    let user_id_parameter;
    if (user){
      user_id_parameter = null;
    }
    else{
      user_id_parameter = 1;
    }
  
    try {
      // Match the parameters that the backend expects
      const response = await fetch(`${apiBaseUrl}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: 1, // Use actual user ID when available
          title: noteTitle, // Backend expects 'title', not 'text'
          latitude: selectedLocation.lat, // Backend expects 'latitude', not 'lat'
          longitude: selectedLocation.lng, // Backend expects 'longitude', not 'lng'
          bounds: displayed_bounds, // Include bounds
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
  
      // Update with server data
      const savedNote = await response.json();
      setNotes((prev) =>
        prev.map((note) => (note.id === newNote.id ? savedNote.note : note))
      );
  
      // Update votes with the real ID
      setVotes((prev) => {
        const newVotes = { ...prev };
        if (savedNote.note && savedNote.note.id) {
          newVotes[savedNote.note.id] = newVotes[newNote.id];
          delete newVotes[newNote.id];
        }
        return newVotes;
      });
    } catch (error) {
      console.error("Error saving note:", error);
      // Keep optimistic update in UI
    }
  };

  const handleVote = async (noteId, isUpvote) => {
    const currentVote = userVotes[noteId];
    const apiBaseUrl = process.env.REACT_APP_API_URL || "";

    let user_id_parameter;
    if (user){
      user_id_parameter = user.id;
    }
    else{
      user_id_parameter = 1;
    }

    // Toggle vote if clicking the same button
    if (currentVote === "up" && isUpvote) {
      // Remove upvote
      try {
        await fetch(`${apiBaseUrl}/notes/${noteId}/remove-vote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: user_id_parameter }), // Use actual user ID when available
        });

        // Update local state
        setVotes((prev) => {
          const noteVotes = prev[noteId] || { upvotes: 0, downvotes: 0 };
          return {
            ...prev,
            [noteId]: {
              upvotes: Math.max(0, noteVotes.upvotes - 1),
              downvotes: noteVotes.downvotes,
            },
          };
        });

        setUserVotes((prev) => {
          const newUserVotes = { ...prev };
          delete newUserVotes[noteId];
          return newUserVotes;
        });
      } catch (error) {
        console.error("Error removing vote:", error);
      }
      return;
    }

    if (currentVote === "down" && !isUpvote) {
      // Remove downvote
      try {
        await fetch(`${apiBaseUrl}/notes/${noteId}/remove-vote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: user_id_parameter }), // Use actual user ID when available
        });

        // Update local state
        setVotes((prev) => {
          const noteVotes = prev[noteId] || { upvotes: 0, downvotes: 0 };
          return {
            ...prev,
            [noteId]: {
              upvotes: noteVotes.upvotes,
              downvotes: Math.max(0, noteVotes.downvotes - 1),
            },
          };
        });

        setUserVotes((prev) => {
          const newUserVotes = { ...prev };
          delete newUserVotes[noteId];
          return newUserVotes;
        });
      } catch (error) {
        console.error("Error removing vote:", error);
      }
      return;
    }

    // Handle new vote or changing vote
    try {
      const endpoint = isUpvote
        ? `${apiBaseUrl}/notes/${noteId}/upvote`
        : `${apiBaseUrl}/notes/${noteId}/downvote`;

      await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user_id_parameter }), // Use actual user ID when available
      });

      // Update local state
      setVotes((prev) => {
        const noteVotes = prev[noteId] || { upvotes: 0, downvotes: 0 };

        if (isUpvote) {
          return {
            ...prev,
            [noteId]: {
              // If changing from downvote to upvote
              upvotes: noteVotes.upvotes + 1,
              downvotes:
                currentVote === "down"
                  ? Math.max(0, noteVotes.downvotes - 1)
                  : noteVotes.downvotes,
            },
          };
        } else {
          return {
            ...prev,
            [noteId]: {
              // If changing from upvote to downvote
              upvotes:
                currentVote === "up"
                  ? Math.max(0, noteVotes.upvotes - 1)
                  : noteVotes.upvotes,
              downvotes: noteVotes.downvotes + 1,
            },
          };
        }
      });

      // Update user vote
      setUserVotes((prev) => ({
        ...prev,
        [noteId]: isUpvote ? "up" : "down",
      }));
    } catch (error) {
      console.log(error);
      console.error(
        `Error ${isUpvote ? "upvoting" : "downvoting"} note:`,
        error
      );
    }
  };

  const deleteNote = async (noteId) => {
    // Optimistically remove from UI
    setNotes((prev) => prev.filter((note) => note.id !== noteId));
    setActiveNote(null);

    // Delete from API
    const apiBaseUrl = process.env.REACT_APP_API_URL || "";
    try {
      await fetch(`${apiBaseUrl}/notes/${noteId}`, {
        method: "DELETE",
      });

      // Remove from votes object
      setVotes((prev) => {
        const newVotes = { ...prev };
        delete newVotes[noteId];
        return newVotes;
      });

      // Remove from user votes
      setUserVotes((prev) => {
        const newUserVotes = { ...prev };
        delete newUserVotes[noteId];
        return newUserVotes;
      });
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  // Get marker size based on vote count
  const getMarkerSize = (noteId) => {
    const noteVotes = votes[noteId] || { upvotes: 0, downvotes: 0 };
    const score = noteVotes.upvotes - noteVotes.downvotes;
    if (score > 20) return 25;
    if (score > 10) return 20;
    if (score > 5) return 15;
    if (score < -5) return 8;
    return 12; // default size
  };

  // Get marker color based on vote ratio
  const getMarkerColor = (noteId) => {
    const noteVotes = votes[noteId] || { upvotes: 0, downvotes: 0 };
    const total = noteVotes.upvotes + noteVotes.downvotes;
    if (total === 0) return "area-marker-neutral";

    const upvoteRatio = noteVotes.upvotes / total;
    if (upvoteRatio > 0.8) return "area-marker-high";
    if (upvoteRatio > 0.5) return "area-marker-medium";
    return "area-marker-low";
  };

  // Helper to convert Leaflet [lat, lng] to Turf [lng, lat]
  const toTurfCoords = (coords) => {
    if (!coords || !Array.isArray(coords)) {
      return [];
    }
    const mappedCoords = coords.map((c) => [c[1], c[0]]);
    return [...mappedCoords, mappedCoords[0]]; // Close the polygon
  };

  // Helper to convert Turf [lng, lat] back to Leaflet [lat, lng]
  const toLeafletCoords = (coords) => {
    if (!coords || !Array.isArray(coords)) {
      return [];
    }
    const mappedCoords = coords.map((c) => [c[1], c[0]]);
    return mappedCoords.slice(0, mappedCoords.length - 1);
  };
  // Filter notes based on search query
  const filteredNotes = notes.filter((note) => 
    {
      // Check if note.title exists before calling toLowerCase()
      if (!note || !note.title) {
        return false;
      }
      
      if (searchLocation === null){
        return note.title.toLowerCase().includes(searchQuery.toLowerCase());
      }
      
      // Check if note.bounds exists
      if (!note.bounds || note.bounds.length < 3) {
        return false;
      }
      
      // Convert your point into a GeoJSON feature.
      const pointGeoJSON = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [searchLocation[0], searchLocation[1]],
        },
        properties: {},
      };

      let polygon = turf.polygon([toTurfCoords(note.bounds)]);

      console.log("Polygon:", polygon);
      console.log("point:", pointGeoJSON);

      if (booleanPointInPolygon(pointGeoJSON, polygon)){
        return note.title.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return false;
    }
  );

  // Focus on searched note on the map
  const focusOnNote = (noteId) => {
    const note = notes.find((n) => n.id === noteId);
    if (note) {
      setActiveNote(note);

      // Get the map instance
      const mapInstance =
        document.querySelector(".leaflet-container")?._leaflet_map;
      if (mapInstance) {
        mapInstance.setView([note.lat, note.lng], 16);
      }
    }
  };

  // Handle hover and click for polygon bounds of notes
  const polygonEventHandlers = (note) => ({
    mouseover: () => {
      console.log("Hovering over", note.title);
      setHovered((prev) => (prev !== note.id ? note.id : prev));
    },
    mouseout: () => setHovered(null),
    click: () => {
      if (searchQuery.length === 0)
      {
        setNoteThread(note);
      }
    },
  });

  

  //Render Multipolygon components
  const MultiPolygonComponent = ({ multiPoly, note, noteVotes }) => {
    // Check if multiPoly or coordinates are null/undefined
    if (!multiPoly || !multiPoly.coordinates || !Array.isArray(multiPoly.coordinates)) {
      console.log("Invalid multiPoly data:", multiPoly);
      return null;
    }

    // Extract and convert outer rings for each polygon
    const leafletPolygons = multiPoly.coordinates.map((polygon, idx) => {
      // Check if polygon is valid
      if (!polygon || !Array.isArray(polygon)) {
        console.log("Invalid polygon:", polygon);
        return null;
      }
      
      // polygon is an array of rings. Typically, the first ring is the outer ring.
      console.log("polygon parameter", polygon);
      const outerRing = toLeafletCoords(polygon);
      console.log("outer ring ", outerRing);
      return outerRing;
    }).filter(Boolean); // Filter out null values

    console.log("Leaflet polygons to display ", leafletPolygons);

    if (leafletPolygons.length === 0) {
      return null;
    }

    return (
      <>
        {leafletPolygons.map((positions, index) => (
          <Polygon
            key={index}
            positions={positions}
            color="red"
            fillOpacity={0.3}
            eventHandlers={polygonEventHandlers(note)}
          >
            {hovered === note.id ? (
              <>
                <Tooltip
                  direction="top"
                  offset={[0, 10]}
                  opacity={1.0}
                  permanent={true}
                  className="permanent-comment-box"
                >
                  <div className="permanent-comment">
                    <div className="comment-text">
                      {note.title.length > 40
                        ? `${note.title.substring(0, 40)}...`
                        : note.title}
                    </div>

                    <div className="comment-vote-actions">
                      <button
                        className={`vote-action upvote ${
                          userVotes[note.id] === "up" ? "active" : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(note.id, true);
                        }}
                      >
                        <UpvoteIcon /> <span>{noteVotes.upvotes}</span>
                      </button>
                      <button
                        className={`vote-action downvote ${
                          userVotes[note.id] === "down" ? "active" : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(note.id, false);
                        }}
                      >
                        <DownvoteIcon /> <span>{noteVotes.downvotes}</span>
                      </button>
                    </div>
                  </div>
                </Tooltip>

                {/* Popup for expanded view */}
                {activeNote && activeNote.id === note.id && (
                  <Popup
                    className="custom-popup"
                    onClose={() => setActiveNote(null)}
                  >
                    <div className="popup-content">
                      <p>{note.title}</p>
                      <div className="popup-actions">
                        <div
                          className={`vote-btn upvote-btn ${
                            userVotes[note.id] === "up" ? "active" : ""
                          }`}
                          onClick={() => handleVote(note.id, true)}
                        >
                          <UpvoteIcon /> {noteVotes.upvotes}
                        </div>
                        <div
                          className={`vote-btn downvote-btn ${
                            userVotes[note.id] === "down" ? "active" : ""
                          }`}
                          onClick={() => handleVote(note.id, false)}
                        >
                          <DownvoteIcon /> {noteVotes.downvotes}
                        </div>
                        <div
                          className="vote-btn delete-btn"
                          onClick={() => deleteNote(note.id)}
                          style={{ marginLeft: "auto", color: "#d32f2f" }}
                        >
                          <CloseIcon />
                        </div>
                      </div>
                    </div>
                  </Popup>
                )}
              </>
            ) : null}
          </Polygon>
        ))}
      </>
    );
  };

  const submitComment = () => {
    if (!noteThread) return;
    
    // Initialize comments array if it doesn't exist
    if (!noteThread.comments) {
      noteThread.comments = [];
    }
    
    noteThread.comments = [...noteThread.comments, commentText];
    setCommentText("");
  }
  
  return (
    <div className="map-container">
      {/* Profile Page Button */}
      <button
        className="profile-button"
        onClick={handleProfileClick}
        style={{
          position: "absolute",
          top: "125px", // Adjust the position as needed
          right: "20px",
          width: "150px",
          height: "40px",
          zIndex: 500,
          backgroundColor: "#2962FF",
          color: "white",
          border: "none",
          cursor: "pointer",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: "500",
        }}
      >
        Profile Page
      </button>

      {/* Logout Button */}
      <button
        className="logout-button"
        onClick={handleLogout}
        style={{
          position: "absolute",
          top: "75px",
          right: "20px",
          width: "150px",
          height: "40px",
          zIndex: 500,
          backgroundColor: "#2962FF",
          color: "white",
          border: "none",
          cursor: "pointer",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: "500",
        }}
      >
        Logout
      </button>

      {/* Search Box */}
      <div className="search-container">
        <div className="search-box">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search comments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {searchQuery && (
          <div className="search-results">
            {filteredNotes.length === 0 ? (
              <div className="no-results">No comments found</div>
            ) : (
              filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className="search-result-item"
                  onClick={() => {
                    focusOnNote(note.id);
                    setNoteThread(note);
                  }}
                >
                  <div className="search-result-text">
                    {note.title.length > 60
                      ? note.title.substring(0, 60) + "..."
                      : note.title}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <MapContainer
        center={center}
        zoom={15}
        style={{ height: "100vh", width: "100vw" }}
        maxBounds={bounds}
        maxBoundsViscosity={0.8}
        minZoom={14}
        zoomControl={false}
      >
        <ZoomControl position="bottomright" />
        <MouseTracker coordsRef={coordsRef} />
        <UserLocation setUserPosition={setUserPosition} />
        <ClickHandler onMapClick={handleMapClick} />

        {/* Show live drawing bounds*/}
        {drawingBoundary && drawingBoundary.length > 1 && (
          <Polygon positions={drawingBoundary} color="red" fillOpacity={0.3} />
        )}

      {/* User location marker - simplified version */}
      {userPosition && (
        <>
          <CircleMarker
            center={userPosition}
            radius={8}
            className="user-location"
            pathOptions={{
              fillColor: "#4285F4",
              color: "white",
              weight: 2,
              fillOpacity: 0.7,
            }}
          />
          {/* Optional: Static circle instead of animated pulse */}
          <CircleMarker
            center={userPosition}
            radius={12}
            pathOptions={{
              fillColor: "transparent",
              color: "#4285F4",
              weight: 1,
              fillOpacity: 0.1,
            }}
          />
        </>
      )}

        {/* Note markers with permanently visible comments */}
        {/* Note markers with permanently visible comments */}
        {notes && Array.isArray(notes) ? notes
          .sort((a, b) => {
            // Safety checks for both notes
            if (!a || !b || !a.id || !b.id) return 0;
            
            const a_id = a.id;
            const b_id = b.id;
            
            // Make sure vote objects exist
            if (!votes || !votes[a_id] || !votes[b_id]) {
              return 0;
            }
            
            // Safely access vote properties
            const aUpvotes = votes[a_id]?.upvotes || 0;
            const aDownvotes = votes[a_id]?.downvotes || 0;
            const bUpvotes = votes[b_id]?.upvotes || 0;
            const bDownvotes = votes[b_id]?.downvotes || 0;
            
            try {
              // Calculate scores safely
              const aScore = aUpvotes - aDownvotes;
              const bScore = bUpvotes - bDownvotes;
              return -(aScore - bScore);
            } catch (error) {
              console.error("Error in vote sorting:", error);
              return 0;
            }
          })
          .map((note, index, arr) => {
            // Make sure note exists and has required properties
            if (!note || !note.id) {
              return null;
            }
            
            const noteVotes = votes[note.id] || { upvotes: 0, downvotes: 0 };
            const isHighlighted = activeNote && activeNote.id === note.id;
            
            // Check if note.bounds exists
            if (!note.bounds) {
              //console.log("Note has no bounds:", note);
              return null;
            }
            
            let coords = note.bounds;
            
            if (note.bounds.length > 2) {
              try {
              const prev_notes = arr.slice(0, index);
              let cur_turf = turf.polygon([toTurfCoords(note.bounds)]);
                
              for (let i = 0; i < prev_notes.length; i++) {
                let prev_note = prev_notes[i];
                  if (!prev_note.bounds || prev_note.bounds.length < 3) {
                    continue;
                  }
                  
                  let prev_turf = turf.polygon([toTurfCoords(prev_note.bounds)]);
                  
                  if (cur_turf !== null) {
                    try {
                      cur_turf = turf.difference(
                        turf.featureCollection([cur_turf, prev_turf])
                      );
                    } catch (error) {
                      console.error("Error in turf.difference:", error);
                    }
                  }
                }
                
                if (
                  cur_turf !== null &&
                  cur_turf.geometry !== null &&
                  cur_turf.geometry.type === "MultiPolygon"
                ) {
                  coords = cur_turf.geometry.coordinates;
                } else if (
                  cur_turf !== null &&
                  cur_turf.geometry !== null &&
                  cur_turf.geometry.coordinates !== null
                ) {
                  coords = toLeafletCoords(cur_turf.geometry.coordinates[0]);
                } else {
                  coords = null;
                }
              } catch (error) {
                console.error("Error processing polygon:", error);
                coords = null;
              }
            }
            
            /* Render bounds if selected, or else a circle marker*/
            return (
              <React.Fragment key={note.id}>
                {note.bounds && Array.isArray(note.bounds) && note.bounds.length > 2 ? (
                  <>
                    {!coords ? null : (
                      <Polygon
                        positions={coords}
                        color="red"
                        fillOpacity={0.3}
                        eventHandlers={polygonEventHandlers(note)}
                      >
                        {hovered === note.id ? (
                          <>
                            <Tooltip
                              sticky={true}
                              permanent={true}
                              className="permanent-comment-box"
                            >
                              <div className="permanent-comment">
                                <div className="comment-text">
                                  {note.title.length > 40
                                    ? `${note.title.substring(0, 40)}...`
                                    : note.title}
                                </div>

                                <div className="comment-vote-actions">
                                  <button
                                    className={`vote-action upvote ${
                                      userVotes[note.id] === "up"
                                        ? "active"
                                        : ""
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleVote(note.id, true);
                                    }}
                                  >
                                    <UpvoteIcon />{" "}
                                    <span>{noteVotes.upvotes}</span>
                                  </button>
                                  <button
                                    className={`vote-action downvote ${
                                      userVotes[note.id] === "down"
                                        ? "active"
                                        : ""
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleVote(note.id, false);
                                    }}
                                  >
                                    <DownvoteIcon />{" "}
                                    <span>{noteVotes.downvotes}</span>
                                  </button>
                                </div>
                              </div>
                            </Tooltip>

                            {/* Popup for expanded view */}
                            {activeNote && activeNote.id === note.id && (
                              <Popup
                                className="custom-popup"
                                onClose={() => setActiveNote(null)}
                              >
                                <div className="popup-content">
                                  <p>{note.title}</p>
                                  <div className="popup-actions">
                                    <div
                                      className={`vote-btn upvote-btn ${
                                        userVotes[note.id] === "up"
                                          ? "active"
                                          : ""
                                      }`}
                                      onClick={() => handleVote(note.id, true)}
                                    >
                                      <UpvoteIcon /> {noteVotes.upvotes}
                                    </div>
                                    <div
                                      className={`vote-btn downvote-btn ${
                                        userVotes[note.id] === "down"
                                          ? "active"
                                          : ""
                                      }`}
                                      onClick={() => handleVote(note.id, false)}
                                    >
                                      <DownvoteIcon /> {noteVotes.downvotes}
                                    </div>
                                    <div
                                      className="vote-btn delete-btn"
                                      onClick={() => deleteNote(note.id)}
                                      style={{
                                        marginLeft: "auto",
                                        color: "#d32f2f",
                                      }}
                                    >
                                      <CloseIcon />
                                    </div>
                                  </div>
                                </div>
                              </Popup>
                            )}
                          </>
                        ) : null}
                      </Polygon>
                    )}
                  </>
                ) : (
                  <CircleMarker
                    key={note.id}
                    center={[note.lat, note.lng]}
                    radius={getMarkerSize(note.id)}
                    color="red"
                    eventHandlers={polygonEventHandlers(note)}
                  >
                    {/* Show tooltip if hovering */}
                    {hovered === note.id ? (
                      <>
                        <Tooltip
                          sticky={true}
                          permanent={true}
                          className="permanent-comment-box"
                        >
                          <div className="permanent-comment">
                            <div className="comment-text">
                              {note.title.length > 40
                                ? `${note.title.substring(0, 40)}...`
                                : note.title}
                            </div>

                            <div className="comment-vote-actions">
                              <button
                                className={`vote-action upvote ${
                                  userVotes[note.id] === "up" ? "active" : ""
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVote(note.id, true);
                                }}
                              >
                                <UpvoteIcon /> <span>{noteVotes.upvotes}</span>
                              </button>
                              <button
                                className={`vote-action downvote ${
                                  userVotes[note.id] === "down" ? "active" : ""
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVote(note.id, false);
                                }}
                              >
                                <DownvoteIcon />{" "}
                                <span>{noteVotes.downvotes}</span>
                              </button>
                            </div>
                          </div>
                        </Tooltip>

                        {/* Popup for expanded view */}
                        {activeNote && activeNote.id === note.id && (
                          <Popup
                            className="custom-popup"
                            onClose={() => setActiveNote(null)}
                          >
                            <div className="popup-content">
                              <p>{note.title}</p>
                              <div className="popup-actions">
                                <div
                                  className={`vote-btn upvote-btn ${
                                    userVotes[note.id] === "up" ? "active" : ""
                                  }`}
                                  onClick={() => handleVote(note.id, true)}
                                >
                                  <UpvoteIcon /> {noteVotes.upvotes}
                                </div>
                                <div
                                  className={`vote-btn downvote-btn ${
                                    userVotes[note.id] === "down"
                                      ? "active"
                                      : ""
                                  }`}
                                  onClick={() => handleVote(note.id, false)}
                                >
                                  <DownvoteIcon /> {noteVotes.downvotes}
                                </div>
                                <div
                                  className="vote-btn delete-btn"
                                  onClick={() => deleteNote(note.id)}
                                  style={{
                                    marginLeft: "auto",
                                    color: "#d32f2f",
                                  }}
                                >
                                  <CloseIcon />
                                </div>
                              </div>
                            </div>
                          </Popup>
                        )}
                      </>
                    ) : null}
                  </CircleMarker>
                )}
              </React.Fragment>
            );
          })
          .filter(Boolean) : null /* Filter out null values and handle empty notes array */}

        {/* Building labels */}
        <TextLabels mapLabels={mapLabels} />
        {StaticMapElements()}
      </MapContainer>

      {/* Note Expanded Thread */}
      {noteThread && 
      <div className={`thread-panel`}>
        {/* Note Thread Header */}
        <div className="thread-header">
          <h2>{noteThread.title}</h2>
          <button className="close-btn" onClick={() => {
            setNoteThread(null);
            setCommentText("");
          }}>
            <CloseIcon />
          </button>
        </div>

        {/* Note Thread Textbox */}
        <div className="thread-form">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="What would you like to share about this note?"
            className="thread-commentarea"
          />
          <div className="thread-form-actions">
            <button
              className="thread-submit-btn"
              onClick={submitComment}
              disabled={!commentText.trim()}
            >
              Post Note
            </button>
          </div>
        </div>
        <div className="comments-list">
          {!noteThread.comments || noteThread.comments.length === 0 ? 
          (
            <div
              style={{ padding: "20px", textAlign: "center", color: "#777" }}
            >
              No comments yet. Type in the textbox above to add a comment!
            </div>
          ) : 
          (
            noteThread.comments.map((comment, index) => {
              return (
                <div key={index} className="comment-item">
                  <div className="comment-content">{comment}</div>
                </div>
              );
            })
          )}
        </div>
      </div>
      }

      {/* Notes List Panel */}
      <div className={`comments-panel ${showNotesList ? "open" : ""}`}>
        <div className="comments-header">
          <h2>Campus Notes</h2>
          <button className="close-btn" onClick={() => setShowNotesList(false)}>
            <CloseIcon />
          </button>
        </div>

        <div className="comments-list">
          {notes.length === 0 ? (
            <div
              style={{ padding: "20px", textAlign: "center", color: "#777" }}
            >
              No notes yet. Click on the map to add the first note!
            </div>
          ) : (
            notes
              .sort((a, b) => {
                const aScore =
                  (votes[a.id]?.upvotes || 0) - (votes[a.id]?.downvotes || 0);
                const bScore =
                  (votes[b.id]?.upvotes || 0) - (votes[b.id]?.downvotes || 0);
                return bScore - aScore;
              })
              .map((note) => {
                const noteVotes = votes[note.id] || {
                  upvotes: 0,
                  downvotes: 0,
                };
                return (
                  <div
                    key={note.id}
                    className="comment-item"
                    onClick={() => {
                      //setNoteThread(note);
                      //setShowNotesList(false);
                    }}
                  >
                    <div className="comment-meta">
                      <span className="comment-location">
                        {new Date(note.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="comment-content">{note.title}</div>
                    <div className="comment-actions">
                      <button
                        className={`vote-btn upvote-btn ${
                          userVotes[note.id] === "up" ? "active" : ""
                        }`}
                        onClick={() => handleVote(note.id, true)}
                      >
                        <UpvoteIcon /> {noteVotes.upvotes}
                      </button>
                      <button
                        className={`vote-btn downvote-btn ${
                          userVotes[note.id] === "down" ? "active" : ""
                        }`}
                        onClick={() => handleVote(note.id, false)}
                      >
                        <DownvoteIcon /> {noteVotes.downvotes}
                      </button>
                      <button
                        className="vote-btn"
                        onClick={() => deleteNote(note.id)}
                        style={{ marginLeft: "auto", color: "#d32f2f" }}
                      >
                        <CloseIcon />
                      </button>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>

      {/* Note Form */}
      {showNoteForm && (
        <div className="comment-form">
          <h3>Add Your Note</h3>
          <textarea
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            placeholder="What would you like to share about this area?"
            className="note-textarea"
          />
          <div className="comment-form-actions">
            <button
              className="cancel-btn"
              onClick={() => {
                setShowNoteForm(false);
                setNoteTitle("");
                setDrawingBoundary([]);
              }}
            >
              Cancel
            </button>
            <button
              className="submit-btn"
              onClick={submitNote}
              disabled={!noteTitle.trim()}
            >
              Post Note
            </button>
          </div>
        </div>
      )}

      {/* Comments toggle button */}
      <button
        className="comments-toggle"
        onClick={() => setShowNotesList(!showNotesList)}
      >
        <CommentIcon />
        {showNotesList ? "Hide Notes" : "View All Notes"}
      </button>

      {/* Map legend */}
      <div className="map-legend">
        <div className="legend-title">Note Colors:</div>
        <div className="legend-item">
          <div className="legend-color legend-high"></div>
          <span>Popular Notes</span>
        </div>
        <div className="legend-item">
          <div className="legend-color legend-medium"></div>
          <span>Mixed Opinions</span>
        </div>
        <div className="legend-item">
          <div className="legend-color legend-low"></div>
          <span>Unpopular Notes</span>
        </div>
        <div className="legend-item">
          <div className="legend-color legend-neutral"></div>
          <span>New Notes</span>
        </div>
      </div>

      {/* Coordinates Display */}
      <CoordinatesDisplay coords={throttleCoords} />
    </div>
  );
};

export default LeafletMap;
