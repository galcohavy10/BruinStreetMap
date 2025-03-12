import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useState } from "react";
import Login from "./Login.js";
import LeafletMap from "./components/Map/LeafletMap";
import Profile from "./Profile.js";

const CLIENT_ID = "22705282070-u8depo5tckdvp7damoi2sjpcscttjo9u.apps.googleusercontent.com";

function App() {
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <Router>
        <Routes>
          <Route
            path="/"
            element={user ? <Navigate to="/map" replace /> : <Login onLogin={setUser} />}
          />
          <Route
            path="/map"
            element={user ? <LeafletMap onLogout={handleLogout} user={user}  /> : <Navigate to="/" replace />}
          />
          <Route
            path="/profile"
            element={user ? <Profile user={user} /> : <Navigate to="/" replace />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
