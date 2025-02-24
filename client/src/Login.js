import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from 'jwt-decode';
import {useState } from "react";
import "./Login.css";


function Login({ onLogin }) {
  const handleLoginSuccess=(credentialResponse) => {
    const decodedUser = jwtDecode(credentialResponse.credential);
    const userEmail = decodedUser.email;
    let role = "viewer";

    if(userEmail.endsWith("@g.ucla.edu")){
      role = "editor";
    }

    console.log('Authenticated:', role, userEmail);
    onLogin({...decodedUser, role});
    console.log(decodedUser);

  }
  const handleLoginFail=() => {
    console.log("Login Failed.");
  }

    return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">Login</h1>
        <p className="login-subtext">Sign in with your UCLA Google Account</p>

        <div className="google-login-button">
        <GoogleLogin onSuccess={handleLoginSuccess} onError={handleLoginFail} />
        </div>
      </div>
    </div>
  );
}

export default Login;
