import { useState } from "react";
import "./AuditLogTable.css";

function AuditLogTable({
  logs = [],
  loading = false,
  error = "",
  onRetry,
  viewMode = "table",
}) {
  const [expandedLogId, setExpandedLogId] = useState(null);

  const toggleExpand = (logId) => {
    setExpandedLogId((prev) => (prev === logId ? null : logId));
  };

  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getActionBadgeClass = (action, severity) => {
    if (severity === "success" || action.includes("APPROVED"))
      return "audit-badge-success";
    if (severity === "danger" || action.includes("REJECTED"))
      return "audit-badge-danger";
    if (severity === "warning" || action.includes("CLOSED"))
      return "audit-badge-warning";
    if (action.includes("CREATED") || action.includes("SUBMITTED"))
      return "audit-badge-info";
    return "audit-badge-neutral";
  };

  const getInitials = (name) => {
    if (!name) return "FL";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Loading State
  if (loading) {
    return (
      <div className="audit-loading-card">
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="audit-skeleton-line" style={{ height: "40px" }} />
          <div className="audit-skeleton-line" style={{ height: "52px" }} />
          <div className="audit-skeleton-line" style={{ height: "52px" }} />
          <div className="audit-skeleton-line" style={{ height: "52px" }} />
          <div className="audit-skeleton-line" style={{ height: "52px" }} />
        </div>
        <p className="audit-empty-subtitle" style={{ marginTop: "1rem" }}>
          Loading FlowLedger activity history from backend services...
        </p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="audit-error-card">
        <div className="audit-error-icon" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h3 className="audit-error-title">Unable to Load Audit History</h3>
        <p className="audit-error-subtitle">{error}</p>
        {onRetry && (
          <button type="button" className="audit-retry-btn" onClick={onRetry}>
            Try Again
          </button>
        )}
      </div>
    );
  }

  // Empty State
  if (logs.length === 0) {
    return (
      <div className="audit-empty-card">
        <div className="audit-empty-icon" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>
        <h3 className="audit-empty-title">No Audit Events Found</h3>
        <p className="audit-empty-subtitle">
          No matching activity history records were found for the selected criteria.
        </p>
      </div>
    );
  }

  // TIMELINE VIEW
  if (viewMode === "timeline") {
    return (
      <div className="audit-timeline">
        {logs.map((log) => {
          const badgeClass = getActionBadgeClass(log.action, log.severity);
          const markerClass =
            log.severity === "success"
              ? "success"
              : log.severity === "danger"
              ? "danger"
              : log.severity === "warning"
              ? "warning"
              : "";

          return (
            <div key={log.id} className="audit-timeline-item">
              <div className={`audit-timeline-marker ${markerClass}`}>
                {log.action.includes("APPROVED") ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : log.action.includes("REJECTED") ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                ) : log.action.includes("CREATED") ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                )}
              </div>

              <div className="audit-timeline-card">
                <div className="audit-timeline-header">
                  <div className="audit-timeline-title-area">
                    <h4 className="audit-timeline-title">{log.title}</h4>
                    <span className={`audit-badge ${badgeClass}`}>
                      {log.actionLabel}
                    </span>
                    <span className="audit-badge audit-badge-entity">
                      {log.entityType}
                    </span>
                  </div>

                  <div className="audit-timeline-meta">
                    <span>{formatDate(log.timestamp)}</span>
                    <span>&bull;</span>
                    <span>{formatTime(log.timestamp)}</span>
                  </div>
                </div>

                <p className="audit-timeline-desc">{log.description}</p>

                {log.details && (
                  <div className="audit-timeline-details-chips">
                    <span className="audit-detail-chip">
                      <strong>Actor:</strong> {log.actor?.name || "System"} ({log.actor?.role || "Staff"})
                    </span>
                    {Object.entries(log.details).map(([key, val]) => (
                      <span key={key} className="audit-detail-chip">
                        <strong>{key}:</strong> {String(val)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // TABLE VIEW (Default)
  return (
    <div className="audit-table-card">
      <div className="audit-table-wrapper">
        <table className="audit-table" aria-label="Audit Activity History Table">
          <thead>
            <tr>
              <th scope="col">Action &amp; Event</th>
              <th scope="col">Entity</th>
              <th scope="col">Entity Title / ID</th>
              <th scope="col">Actor / Reviewer</th>
              <th scope="col">Timestamp</th>
              <th scope="col" style={{ textAlign: "right" }}>Inspect</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              const badgeClass = getActionBadgeClass(log.action, log.severity);

              return (
                <tr key={log.id} style={{ display: "contents" }}>
                  <tr className={`audit-table-row ${isExpanded ? "expanded" : ""}`}>
                    <td>
                      <div className="audit-action-cell">
                        <span className={`audit-badge ${badgeClass}`}>
                          {log.actionLabel}
                        </span>
                        <span className="audit-action-code">{log.action}</span>
                      </div>
                    </td>

                    <td>
                      <span className="audit-badge audit-badge-entity">
                        {log.entityType}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                        <span style={{ fontWeight: 600, color: "var(--color-ink)" }}>
                          {log.title}
                        </span>
                        {log.entityId && (
                          <span style={{ fontSize: "0.75rem", color: "var(--color-text-subtle)", fontFamily: "monospace" }}>
                            ID: {String(log.entityId).slice(-8)}
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="audit-actor-cell">
                        <div className="audit-actor-avatar">
                          {getInitials(log.actor?.name)}
                        </div>
                        <div className="audit-actor-info">
                          <span className="audit-actor-name">{log.actor?.name || "System"}</span>
                          <span className="audit-actor-role">{log.actor?.role || "Staff"}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="audit-time-cell">
                        <span className="audit-time-date">{formatDate(log.timestamp)}</span>
                        <span className="audit-time-clock">{formatTime(log.timestamp)}</span>
                      </div>
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        className="audit-details-btn"
                        onClick={() => toggleExpand(log.id)}
                        aria-expanded={isExpanded}
                        aria-label={`Inspect audit details for ${log.title}`}
                      >
                        <span>{isExpanded ? "Hide" : "Details"}</span>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{
                            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 150ms ease",
                          }}
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="audit-expanded-row">
                      <td colSpan={6}>
                        <div className="audit-details-panel">
                          <div className="audit-details-header">
                            Verified Audit Log Payload &bull; {log.action}
                          </div>
                          <div className="audit-details-grid">
                            <div className="audit-detail-item">
                              <span className="audit-detail-key">Action Name</span>
                              <span className="audit-detail-val">{log.action}</span>
                            </div>
                            <div className="audit-detail-item">
                              <span className="audit-detail-key">Entity Type</span>
                              <span className="audit-detail-val">{log.entityType}</span>
                            </div>
                            <div className="audit-detail-item">
                              <span className="audit-detail-key">Entity ID</span>
                              <span className="audit-detail-val" style={{ fontFamily: "monospace", fontSize: "0.82rem" }}>
                                {String(log.entityId)}
                              </span>
                            </div>
                            <div className="audit-detail-item">
                              <span className="audit-detail-key">Timestamp (ISO)</span>
                              <span className="audit-detail-val" style={{ fontSize: "0.82rem" }}>
                                {log.timestamp.toISOString()}
                              </span>
                            </div>
                            <div className="audit-detail-item">
                              <span className="audit-detail-key">Recorded Actor</span>
                              <span className="audit-detail-val">
                                {log.actor?.name} ({log.actor?.email || log.actor?.role})
                              </span>
                            </div>

                            {log.details &&
                              Object.entries(log.details).map(([key, val]) => (
                                <div key={key} className="audit-detail-item">
                                  <span className="audit-detail-key">{key}</span>
                                  <span className="audit-detail-val">{String(val)}</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AuditLogTable;
