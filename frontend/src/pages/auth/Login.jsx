import { useContext, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import "./Login.css";

export default function Login() {
  const { login, isAuthenticated } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please provide both enterprise email and password.");
      return;
    }

    try {
      setLoading(true);
      await login(email.trim(), password);
      navigate("/dashboard");
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Invalid credentials. Please verify your email and password.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="login-light-root">
      {/* Background Ambience with Dark Slate Accents */}
      <div className="login-light-mesh" aria-hidden="true">
        <div className="login-light-sphere sphere-dark" />
        <div className="login-light-sphere sphere-slate" />
        <div className="login-light-grid" />
      </div>

      <div className="login-light-container">
        {/* Left Side: Enterprise Security Verification Panel */}
        <div className="login-light-brand-panel">
          <div>
            <Link to="/" className="login-back-link">
              ← Return to FlowLedger Overview
            </Link>

            <div className="brand-light-badge">
              <span className="brand-dot-dark" /> Enterprise Security Protocol
            </div>

            <h2 className="login-brand-heading">
              Deterministic capital control for <span className="serif-light-accent">enterprise scale.</span>
            </h2>

            <p className="login-brand-sub">
              Access is restricted to authorized organization personnel. Sessions are protected by stateless
              JWT tokens with continuous tenant isolation and defense-in-depth role authorizations.
            </p>
          </div>

          <div className="security-assurance-box">
            <div className="assurance-head">
              <span className="assurance-shield">🛡️</span>
              <span>Security &amp; Compliance Standards</span>
            </div>
            <ul className="assurance-list">
              <li>
                <span className="assurance-check">✓</span>
                <span>Tenant-Isolated Database Partitioning</span>
              </li>
              <li>
                <span className="assurance-check">✓</span>
                <span>Cryptographic Bcrypt Credential Hashing</span>
              </li>
              <li>
                <span className="assurance-check">✓</span>
                <span>Strict 4-Tier Role-Based Permissions</span>
              </li>
              <li>
                <span className="assurance-check">✓</span>
                <span>Immutable Forensic Audit Logging</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Side: The Sign In Form Card */}
        <div className="login-light-form-panel">
          <div className="login-form-card">
            <div className="login-card-header">
              <div className="card-brand">
                <span className="card-brand-icon">❖</span>
                <span className="card-brand-name">Flow<span className="brand-dark-text">Ledger</span></span>
              </div>
              <h1 className="card-title">Sign in to your account</h1>
              <p className="card-desc">Enter your organizational credentials to continue</p>
            </div>

            {error && (
              <div className="login-error-alert animate-shake" role="alert">
                <span className="error-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email">Enterprise Email</label>
                <div className="input-wrapper">
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="login-input"
                    autoComplete="email"
                  />
                  <span className="input-icon">✉</span>
                </div>
              </div>

              <div className="form-group">
                <div className="label-row">
                  <label htmlFor="password">Password</label>
                </div>
                <div className="input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="login-input"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="login-submit-btn"
              >
                {loading ? (
                  <span className="btn-spinner" />
                ) : (
                  <>
                    <span>Authenticate Session</span>
                    <span className="arrow">→</span>
                  </>
                )}
              </button>
            </form>

            <div className="login-card-footer">
              <p className="security-notice">
                🔒 Protected by End-to-End Enterprise Encryption &amp; Real-Time Tenant Isolation
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
