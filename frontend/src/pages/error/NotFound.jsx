import { Link } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../../context/AuthContext";
import "./NotFound.css";

export default function NotFound() {
  const { isAuthenticated, logout } = useContext(AuthContext);

  return (
    <div className="error-page-root">
      <div className="error-page-ambient" aria-hidden="true">
        <div className="error-sphere sphere-teal" />
        <div className="error-sphere sphere-slate" />
      </div>

      <div className="error-card">
        <div className="error-badge">STATUS 404 &bull; RESOURCE NOT LOCATED</div>
        <div className="error-code">404</div>
        <h1 className="error-title">Page Not Found</h1>
        <p className="error-description">
          The requested ledger route or governance resource does not exist, has been repositioned, or is inaccessible.
          Please verify the URL or return to your secure workspace.
        </p>

        <div className="error-actions">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="btn-error-primary">
                Return to Dashboard &rarr;
              </Link>
              <Link
                to="/login"
                onClick={() => {
                  if (logout) logout();
                }}
                className="btn-error-secondary"
              >
                Sign In with Different Account
              </Link>
            </>
          ) : (
            <>
              <Link to="/" className="btn-error-primary">
                Return to FlowLedger Overview &rarr;
              </Link>
              <Link to="/login" className="btn-error-secondary">
                Sign In with Credentials
              </Link>
            </>
          )}
        </div>

        <div className="error-footer">
          <span>FlowLedger Multi-Tenant Financial Platform &bull; Defense-in-Depth Architecture</span>
        </div>
      </div>
    </div>
  );
}
