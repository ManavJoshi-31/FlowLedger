import { useContext, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import AuthContext from "../context/AuthContext";

function Login() {
  // "Give me the value currently provided by AuthContext, and extract its login property."
const { login, isAuthenticated } = useContext(AuthContext)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const data = await login(email, password);

      console.log("Login successful:", data);

      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error.response?.data?.message);
    }
  };
  if (isAuthenticated) {
  return <Navigate to="/dashboard" replace />
}
  return (
    <main>
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <button type="submit">Login</button>
      </form>
    </main>
  );
}

export default Login;
