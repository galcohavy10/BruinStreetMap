import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useState } from "react";
import Login from "./Login.js";
import LeafletMap from "./components/Map/LeafletMap";

const CLIENT_ID =process.env.REACT_APP_GOOGLE_AUTH_CLIENT_ID;


function App() {
  const [user, setUser] = useState(null);

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <Router>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/map" /> : <Login onLogin={setUser}/>}/>
          <Route path="/map" element={user ? <LeafletMap/> : <Navigate to="/"/>}/>
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
