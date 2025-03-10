import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from 'jwt-decode';
import { useState } from "react";
import "./Login.css";

function Login({ onLogin }) {
  const [loginError, setLoginError] = useState(null);

  const handleLoginSuccess =  async (credentialResponse) => {
    try {
      const decodedUser = jwtDecode(credentialResponse.credential);
      const userEmail = decodedUser.email;
      
      if (userEmail.endsWith("@g.ucla.edu")) {
        console.log("Authenticated:", userEmail);
        console.log(decodedUser);

        // Send user information to backend
        const response = await fetch("http://localhost:5001/users/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(decodedUser),
        });

        if(!response.ok){
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        // Update user state with backend response
        const userData = await response.json();
        console.log("User data from backend:", userData);
        if (userData.incompleteUser){
          const major = prompt("Please enter your major.");
          let clubs = [];
          let moreClubs = true;
          while (moreClubs) {
            const club = prompt("Please enter the clubs you are affiliated with (or leave blank if done).");
          
            if (club) {
              clubs.push(club);
            } else {
              moreClubs = false;
            }
          }
          if (major && clubs){
            console.log("User ID:", userData.user?.id);
            const username = userData.name;
            const email = userData.email;
            const updatedResponse = await fetch(`http://localhost:5001/users/${userData.user.id}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ 
                username: decodedUser.name, 
                email: decodedUser.email, 
                major: major, 
                clubs: clubs
              }),
            });
            
            if (!updatedResponse.ok) {
              throw new Error(`Server responded with status: ${updatedResponse.status}`);
            }
        
            const updatedUserData = await updatedResponse.json();
            console.log("Updated user data:", updatedUserData);
          }
        }
        // onLogin(userData.userEmail);
        onLogin(decodedUser);

      } else {
        setLoginError("Please use your UCLA email (@g.ucla.edu) to login.");
        handleLoginFail();
      }
    } catch (error) {
      console.error("Login decode error:", error);
      setLoginError("Authentication failed. Please try again.");
      handleLoginFail();
    }
  };
  
  const handleLoginFail = () => {
    console.log("Login Failed.");
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">BruinStreetMap</h1>
        <p className="login-subtext">The crowdsourced campus map for UCLA students</p>

        <div className="login-description" style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
          Add comments to locations around campus, vote on the most helpful tips,
          and discover what other Bruins are saying about campus spots.
        </div>
        
        <div className="google-login-button">
          <GoogleLogin 
            onSuccess={handleLoginSuccess} 
            onError={handleLoginFail}
            shape="pill"
            text="signin_with"
            theme="filled_blue"
          />
        </div>
        
        {loginError && (
          <div style={{ 
            marginTop: '15px', 
            color: '#d32f2f', 
            fontSize: '14px',
            padding: '10px',
            backgroundColor: '#ffebee',
            borderRadius: '4px'
          }}>
            {loginError}
          </div>
        )}

        {/* Development login bypass */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{
            marginTop: '25px',
            borderTop: '1px solid #eee',
            paddingTop: '20px'
          }}>
            <p style={{
              fontSize: '12px',
              color: '#666',
              marginBottom: '10px'
            }}>
              Development Mode Only
            </p>
            <button 
              onClick={() => {
                const fakeUser = {
                  name: "Development User",
                  email: "dev@g.ucla.edu",
                  picture: "https://ui-avatars.com/api/?name=Dev+User&background=2962FF&color=fff"
                };
                console.log("Using development login bypass");
                onLogin(fakeUser);
              }}
              style={{
                background: '#2962FF',
                color: 'white',
                border: 'none',
                padding: '10px 15px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '14px',
                transition: 'all 0.2s ease'
              }}
            >
              Development Login (Bypass Google)
            </button>
          </div>
        )}
        
        <div style={{ marginTop: '25px', fontSize: '12px', color: '#999' }}>
          Only available to UCLA students with @g.ucla.edu emails
        </div>
      </div>
    </div>
  );
}

export default Login;