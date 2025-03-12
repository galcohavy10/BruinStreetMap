import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";


function Profile({ user }) {
    const navigate = useNavigate();
    const [userNotes, setUserNotes] = useState([]);
  
    useEffect(() => {
      const fetchUserNotes = async () => {
        try {
          const response = await fetch(`http://localhost:5001/users/${user.id}/notes`);
          if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
          }
          const data = await response.json();
          setUserNotes(data.notes);
        } catch (error) {
          console.error("Error fetching user notes:", error);
        }
      };
  
      if (user?.id) {
        fetchUserNotes();
      }
    }, [user]);
  
    const handleBackClick = () => {
      navigate(-1);
    };
    return (
        <div className="profile-container">
          {/* Back Button */}
          <button onClick={handleBackClick} className="back-button">
            Back
          </button>
    
          {/* Profile Header */}
          <div className="profile-header">
            <h1>User Profile</h1>
            <p>Welcome to your profile page!</p>
          </div>
    
          {/* Profile Information */}
          <div className="profile-info">
            <div className="profile-info-item">
              <strong>Username:</strong>
              <span>{user.username}</span>
            </div>
            <div className="profile-info-item">
              <strong>Email:</strong>
              <span>{user.email}</span>
            </div>
            <div className="profile-info-item">
              <strong>Major:</strong>
              <span>{user.major || "Not specified"}</span>
            </div>
            <div className="profile-info-item">
              <strong>Clubs:</strong>
              <span>{user.clubs?.join(", ") || "Not specified"}</span>
            </div>
          </div>
    
          {/* User Notes Section */}
          <div className="user-notes">
            <h2>Your Notes</h2>
            {userNotes.length === 0 ? (
              <p>No notes found.</p>
            ) : (
              <div className="notes-list">
                {userNotes.map((note) => (
                  <div key={note.id} className="note-item">
                    <div className="note-text">{note.title}</div>
                    <div className="note-meta">
                      <span>Location: {note.latitude}, {note.longitude}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }
    

export default Profile;
