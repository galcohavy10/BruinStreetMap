import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useState } from "react";
import Login from "./Login.js";
import LeafletMap from "./components/Map/LeafletMap";

const CLIENT_ID ='22705282070-u8depo5tckdvp7damoi2sjpcscttjo9u.apps.googleusercontent.com';


function App() {
  const [user, setUser] = useState(null);

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <Router>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/map" /> : <Login onLogin={setUser}/>}/>
          <Route path="/map" element={user ? <LeafletMap user={user}/> : <Navigate to="/"/>}/>
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
