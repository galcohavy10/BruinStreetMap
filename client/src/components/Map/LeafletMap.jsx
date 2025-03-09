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

const LeafletMap = ({ onLogout }) => {
  const navigate = useNavigate();
  const coordsRef = useRef(null);
  const [userPosition, setUserPosition] = useState(null);
  const [notes, setNotes] = useState([]);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteText, setNoteText] = useState("");
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
        setNotes(data);

        // Initialize votes to 0
        const initialVotes = {};
        data.forEach((note) => {
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
    if (notes.length === 0) return;

    const fetchVotes = async () => {
      const apiBaseUrl = process.env.REACT_APP_API_URL || "";
      try {
        // Fetch votes for each note
        const votePromises = notes.map((note) =>
          fetch(`${apiBaseUrl}/notes/${note.id}/votes`).then((res) =>
            res.ok ? res.json() : { upvotes: "0", downvotes: "0" }
          )
        );

        const voteResults = await Promise.all(votePromises);

        // Create votes object
        const votesObj = {};
        notes.forEach((note, index) => {
          votesObj[note.id] = {
            upvotes: parseInt(voteResults[index].upvotes || 0),
            downvotes: parseInt(voteResults[index].downvotes || 0),
          };
        });

        setVotes(votesObj);
      } catch (error) {
        console.error("Error fetching votes:", error);
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

    // Makes sure the point clicked upon is within UCLA bounds
    if (!isWithinBounds(lat, lng)) {
      alert("Please select a location within UCLA bounds.");
      return;
    }

    // Store selected location and show note form
    setSelectedLocation(latlng);
    setShowNoteForm(true);
    setDrawingBoundary([...drawingBoundary, [lat, lng]]);
  };

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  const submitNote = async () => {
    if (!noteText || !selectedLocation) return;

    // Prepare the new note
    const newNote = {
      id: `temp-${Date.now()}`,
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
      text: noteText,
      color: "#000000",
      font_size: "20px",
      created_at: new Date().toISOString(),
      bounds: drawingBoundary,
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
    setNoteText("");
    setShowNoteForm(false);

    // Submit to API
    const apiBaseUrl = process.env.REACT_APP_API_URL || "";

    try {
      const response = await fetch(`${apiBaseUrl}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
          text: noteText,
          color: "#000000",
          fontSize: "20px",
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      // Update with server data
      const savedNote = await response.json();
      setNotes((prev) =>
        prev.map((note) => (note.id === newNote.id ? savedNote : note))
      );

      // Update votes with the real ID
      setVotes((prev) => {
        const newVotes = { ...prev };
        newVotes[savedNote.id] = newVotes[newNote.id];
        delete newVotes[newNote.id];
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

    // Toggle vote if clicking the same button
    if (currentVote === "up" && isUpvote) {
      // Remove upvote
      try {
        await fetch(`${apiBaseUrl}/notes/${noteId}/remove-vote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: 1 }), // Use actual user ID when available
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
          body: JSON.stringify({ user_id: 1 }), // Use actual user ID when available
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
        body: JSON.stringify({ user_id: 1 }), // Use actual user ID when available
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

  // Filter notes based on search query
  const filteredNotes = notes.filter((note) =>
    note.text.toLowerCase().includes(searchQuery.toLowerCase())
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
      console.log("Hovering over", note.text);
      setHovered((prev) => (prev !== note.id ? note.id : prev));
    },
    mouseout: () => setHovered(null),
    click: () => {
      setNoteThread(note);
    },
  });

  // Helper to convert Leaflet [lat, lng] to Turf [lng, lat]
  const toTurfCoords = (coords) => {
    coords.map((c) => [c[1], c[0]]);
    coords = [...coords, coords[0]];
    return coords;
  };

  // Helper to convert Turf [lng, lat] back to Leaflet [lat, lng]
  const toLeafletCoords = (coords) => {
    coords.map((c) => [c[1], c[0]]);
    coords = coords.slice(0, coords.length - 1);
    return coords;
  };

  //Render Multipolygon components
  const MultiPolygonComponent = ({ multiPoly, note, noteVotes }) => {
    // Convert a [lng, lat] coordinate pair to [lat, lng]
    //const convertCoord = coord => [coord[1], coord[0]];

    // Extract and convert outer rings for each polygon
    const leafletPolygons = multiPoly.coordinates.map((polygon, idx) => {
      // polygon is an array of rings. Typically, the first ring is the outer ring.
      console.log("polygon parameter", polygon);
      const outerRing = polygon.map(toLeafletCoords);
      console.log("outer ring ", outerRing);
      return outerRing;
    });

    console.log("Leaflet polygons to display ", leafletPolygons);

    return (
      <>
        {leafletPolygons.map((positions, index) => (
          <Polygon
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
                      {note.text.length > 40
                        ? `${note.text.substring(0, 40)}...`
                        : note.text}
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
                      <p>{note.text}</p>
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
  const NoteThread = ({ note }) => {
    return (
      <div className={`comments-panel open`}>
        <div className="comments-header">
          <h2>{note.text}</h2>
          <button className="close-btn" onClick={() => setNoteThread(null)}>
            <CloseIcon />
          </button>
        </div>

        <div className="comments-list">
          {note.comments.length === 0 ? (
            <div
              style={{ padding: "20px", textAlign: "center", color: "#777" }}
            >
              No comments yet. Type in the textbox above to add a comment!
            </div>
          ) : (
            note.comments.map((comment) => {
              //const noteVotes = votes[note.id] || { upvotes: 0, downvotes: 0 };
              return (
                <div key={comment} className="comment-item">
                  {/*<div className="comment-meta">
                      <span className="comment-location">
                        {new Date(note.created_at).toLocaleDateString()}
                      </span>
                    </div>*/}
                  <div className="comment-content">{note.text}</div>
                  {/*<div className="comment-actions">
                      <button 
                        className={`vote-btn upvote-btn ${userVotes[note.id] === 'up' ? 'active' : ''}`}
                        onClick={() => handleVote(note.id, true)}
                      >
                        <UpvoteIcon /> {noteVotes.upvotes}
                      </button>
                      <button 
                        className={`vote-btn downvote-btn ${userVotes[note.id] === 'down' ? 'active' : ''}`}
                        onClick={() => handleVote(note.id, false)}
                      >
                        <DownvoteIcon /> {noteVotes.downvotes}
                      </button>
                      <button 
                        className="vote-btn"
                        onClick={() => deleteNote(note.id)}
                        style={{ marginLeft: 'auto', color: '#d32f2f' }}
                      >
                        <CloseIcon />
                      </button>
                    </div>*/}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };
  return (
    <div className="map-container">
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
                    {note.text.length > 60
                      ? note.text.substring(0, 60) + "..."
                      : note.text}
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
        {/* User location marker */}
        {userPosition && (
          <>
            <Marker position={userPosition} icon={userIcon} />
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
            <CircleMarker
              center={userPosition}
              radius={15}
              className="user-location-pulse"
              pathOptions={{
                fillColor: "transparent",
                color: "#4285F4",
                weight: 1,
                fillOpacity: 0.2,
              }}
            />
          </>
        )}

        {/* Note markers with permanently visible comments */}
        {notes
          .sort((a, b) => {
            const a_id = a.id;
            const b_id = b.id;
            //console.log(votes[a_id], votes[b_id]);
            //console.log(votes);
            try {
              console.log("Comparing by upvotes");
              return -(
                votes[a_id].upvotes -
                votes[a_id].downvotes -
                (votes[b_id].upvotes - votes[b_id].downvotes)
              );
            } catch {
              console.log("Upvotes or downvotes not working");
              return -1;
            }
          })
          .map((note, index, arr) => {
            const noteVotes = votes[note.id] || { upvotes: 0, downvotes: 0 };
            const isHighlighted = activeNote && activeNote.id === note.id;
            let coords = note.bounds;
            if (note.bounds.length > 2) {
              const prev_notes = arr.slice(0, index);
              console.log("Note bounds polygon ", toTurfCoords(note.bounds));
              let cur_turf = turf.polygon([toTurfCoords(note.bounds)]);
              for (let i = 0; i < prev_notes.length; i++) {
                let prev_note = prev_notes[i];
                if (prev_note.bounds.length < 3) {
                  continue;
                }
                console.log(
                  "Previous note polygon ",
                  toTurfCoords(prev_note.bounds)
                );
                let prev_turf = turf.polygon([toTurfCoords(prev_note.bounds)]);
                console.log("Current Turf Polygon:", cur_turf);
                console.log("Previous Turf Polygon:", prev_turf);
                //console.log("Difference: ", turf.difference(cur_turf, prev_turf));
                if (cur_turf !== null) {
                  cur_turf = turf.difference(
                    turf.featureCollection([cur_turf, prev_turf])
                  );
                }
                console.log("cur_turf after difference: ", cur_turf);
              }
              if (
                cur_turf !== null &&
                cur_turf.geometry !== null &&
                cur_turf.geometry.type === "MultiPolygon"
              ) {
                console.log("Current polygon is a multi-poly");
                //multipolygon = true;
                //coords = cur_turf.geometry;
                coords = cur_turf.geometry.coordinates;
              } else if (
                cur_turf !== null &&
                cur_turf.geometry !== null &&
                cur_turf.coordinates !== null
              ) {
                console.log(
                  "Coordinates being converted: ",
                  cur_turf.geometry.coordinates[0]
                );
                coords = toLeafletCoords(cur_turf.geometry.coordinates[0]);
              } else {
                console.log("Coords are null");
                coords = null;
              }
              console.log("Coords to display in Polygon: ", coords);
            }
            /* Render bounds if selected, or else a circle marker*/
            return (
              <>
                {note.bounds.length > 2 ? (
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
                                  {note.text.length > 40
                                    ? `${note.text.substring(0, 40)}...`
                                    : note.text}
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
                                  <p>{note.text}</p>
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
                    )}{" "}
                  </>
                ) : (
                  <CircleMarker
                    key={note.id}
                    center={[note.lat, note.lng]}
                    radius={getMarkerSize(note.id)}
                    /*className={`area-marker ${getMarkerColor(note.id)} ${isHighlighted ? 'highlighted' : ''}`}
              eventHandlers={{
                click: () => setActiveNote(note)
              }}*/
                    color="red"
                    eventHandlers={polygonEventHandlers(note)}
                  >
                    {/* Show tooltip if hovering */}
                    {hovered === note.id ? (
                      <>
                        <Tooltip
                          /*direction="top" 
                offset={[0, -10]} 
                opacity={1.0}
                permanent={true}
                className="permanent-comment-box"*/
                          sticky={true}
                          permanent={true}
                          className="permanent-comment-box"
                        >
                          <div className="permanent-comment">
                            <div className="comment-text">
                              {note.text.length > 40
                                ? `${note.text.substring(0, 40)}...`
                                : note.text}
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
                              <p>{note.text}</p>
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
              </>
            );
          })}

        {/* Building labels */}
        <TextLabels mapLabels={mapLabels} />
        {StaticMapElements()}
      </MapContainer>

      {/* Note Expanded Thread */}
      {noteThread ? <NoteThread note={noteThread} /> : null}

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
                      setNoteThread(note);
                      setShowNotesList(false);
                    }}
                  >
                    <div className="comment-meta">
                      <span className="comment-location">
                        {new Date(note.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="comment-content">{note.text}</div>
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
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="What would you like to share about this area?"
            className="note-textarea"
          />
          <div className="comment-form-actions">
            <button
              className="cancel-btn"
              onClick={() => {
                setShowNoteForm(false);
                setNoteText("");
                setDrawingBoundary([]);
              }}
            >
              Cancel
            </button>
            <button
              className="submit-btn"
              onClick={submitNote}
              disabled={!noteText.trim()}
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
