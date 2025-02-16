import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { jwtDecode } from 'jwt-decode';


function Login({ onLogin }) {
  const handleLoginSuccess=(credentialResponse) => {
    const decodedUser = jwtDecode(credentialResponse.credential);
    console.log(decodedUser);
    onLogin(decodedUser);  
  }
  const handleLoginFail=() => {
    console.log("Login Failed.");
  }

    return (
    <div>
        <h1>Login Page</h1>
        <GoogleLogin onSuccess={handleLoginSuccess} onError={handleLoginFail}
        />
    </div>
  );
}

export default Login;
