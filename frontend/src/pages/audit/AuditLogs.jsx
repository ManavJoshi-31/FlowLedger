import { useContext, useEffect, useState, useMemo } from "react";
import AuthContext from "../../context/AuthContext";
import { getAuditHistory } from "../../services/auditLogService";
import AuditLogTable from "../../components/audit/AuditLogTable";
import "./AuditLogs.css";

function AuditLogs() {
  const { user } = useContext(AuthContext);

  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [limitationNotice, setLimitationNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Filters & View State
  const [searchQuery, setSearchQuery] = useState("");
  const [entityFilter, setEntityFilter] = useState("ALL");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("table");

  const isAuthorized =
    user?.role === "ORGANIZATION_ADMIN" || user?.role === "DEPARTMENT_MANAGER";

  useEffect(() => {
    if (!isAuthorized) {
      return;
    }

    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getAuditHistory(user);
        if (isMounted) {
          setLogs(data.logs || []);
          setSummary(data.summary || null);
          setLimitationNotice(data.backendLimitation || null);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to load audit history:", err);
          setError(
            err.response?.data?.message ||
              "Failed to fetch audit activity from backend services. Please verify your connection.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [user, isAuthorized]);

  const handleManualRefresh = async () => {
    try {
      setRefreshing(true);
      setError("");

      const data = await getAuditHistory(user);
      setLogs(data.logs || []);
      setSummary(data.summary || null);
      setLimitationNotice(data.backendLimitation || null);
    } catch (err) {
      console.error("Failed to refresh audit history:", err);
      setError(
        err.response?.data?.message ||
          "Failed to refresh audit activity from backend services. Please verify your connection.",
      );
    } finally {
      setRefreshing(false);
    }
  };

  // Client-side filtering across live audit entries
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Entity Filter
      if (entityFilter !== "ALL" && log.entityType !== entityFilter) {
        return false;
      }

      // Action Filter
      if (actionFilter !== "ALL") {
        if (!log.action.includes(actionFilter)) {
          return false;
        }
      }

      // Search Query Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = log.title?.toLowerCase().includes(query);
        const matchesAction = log.action?.toLowerCase().includes(query);
        const matchesActionLabel = log.actionLabel?.toLowerCase().includes(query);
        const matchesActor = log.actor?.name?.toLowerCase().includes(query);
        const matchesDesc = log.description?.toLowerCase().includes(query);
        const matchesEntityId = String(log.entityId || "").toLowerCase().includes(query);
        const matchesDetails = log.details
          ? Object.values(log.details).some((val) =>
              String(val).toLowerCase().includes(query),
            )
          : false;

        if (
          !matchesTitle &&
          !matchesAction &&
          !matchesActionLabel &&
          !matchesActor &&
          !matchesDesc &&
          !matchesEntityId &&
          !matchesDetails
        ) {
          return false;
        }
      }

      return true;
    });
  }, [logs, entityFilter, actionFilter, searchQuery]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setEntityFilter("ALL");
    setActionFilter("ALL");
  };

  if (!isAuthorized) {
    return (
      <div className="audit-page-layout">
        <div className="audit-error-card">
          <div className="audit-error-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          </div>
          <h3 className="audit-error-title">Access Restricted</h3>
          <p className="audit-error-subtitle">
            Audit history is reserved for Organization Administrators and Department Managers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="audit-page-layout">
      {/* Page Header */}
      <header className="audit-page-header">
        <div className="audit-header-title-area">
          <span className="audit-page-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            System Governance
          </span>
          <h1 className="audit-page-title">Audit &amp; Activity History</h1>
          <p className="audit-page-subtitle">
            Immutable operational activity ledger and compliance traceability across financial requests, department workflows, budgets, and user governance.
          </p>
        </div>

        <div className="audit-header-actions">
          <button
            type="button"
            className={`audit-refresh-btn ${refreshing ? "spinning" : ""}`}
            onClick={handleManualRefresh}
            disabled={loading || refreshing}
            title="Refresh latest audit events from backend"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            <span>{refreshing ? "Syncing..." : "Sync Activity"}</span>
          </button>
        </div>
      </header>

      {/* Backend Architecture Transparency Notice */}
      {limitationNotice && (
        <aside className="audit-notice-card" aria-label="Backend architecture status notice">
          <div className="audit-notice-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>
          <div className="audit-notice-content">
            <strong>Backend Source of Truth</strong>
            <span>
              {limitationNotice.message} All activity items and timestamps displayed below represent live, verified state transitions returned by active FlowLedger backend services.
            </span>
          </div>
        </aside>
      )}

      {/* Summary Metrics Cards */}
      <section className="audit-metrics-grid" aria-label="Audit summary metrics">
        <div className="audit-metric-card">
          <span className="audit-metric-label">Total Audited Events</span>
          <span className="audit-metric-value">{summary?.totalEvents ?? "-"}</span>
          <span className="audit-metric-subtext">Across accessible domain records</span>
        </div>

        <div className="audit-metric-card">
          <span className="audit-metric-label">Financial Actions</span>
          <span className="audit-metric-value">{summary?.requestsCount ?? "-"}</span>
          <span className="audit-metric-subtext">
            {summary ? `${summary.approvalsCount} approved, ${summary.rejectionsCount} rejected` : "Requests recorded"}
          </span>
        </div>

        <div className="audit-metric-card">
          <span className="audit-metric-label">Budget Milestones</span>
          <span className="audit-metric-value">{summary?.budgetsCount ?? "-"}</span>
          <span className="audit-metric-subtext">Allocations and closures</span>
        </div>

        <div className="audit-metric-card">
          <span className="audit-metric-label">Directory &amp; Org Events</span>
          <span className="audit-metric-value">
            {summary ? summary.usersCount + summary.departmentsCount : "-"}
          </span>
          <span className="audit-metric-subtext">User &amp; department lifecycle</span>
        </div>
      </section>

      {/* Controls & Filter Bar */}
      <section className="audit-controls-bar" aria-label="Audit log filters">
        <div className="audit-search-filter-group">
          {/* Search box */}
          <div className="audit-search-input-wrapper">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="audit-search-input"
              placeholder="Filter by action, user, title, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Filter audit history"
            />
          </div>

          {/* Entity Type Filter */}
          <select
            className="audit-select-filter"
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            aria-label="Filter by entity type"
          >
            <option value="ALL">All Entities</option>
            <option value="FINANCIAL_REQUEST">Financial Requests</option>
            <option value="BUDGET">Budgets</option>
            <option value="USER">Users</option>
            <option value="DEPARTMENT">Departments</option>
          </select>

          {/* Action Filter */}
          <select
            className="audit-select-filter"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            aria-label="Filter by action"
          >
            <option value="ALL">All Actions</option>
            <option value="CREATED">Creation Events</option>
            <option value="APPROVED">Approvals</option>
            <option value="REJECTED">Rejections</option>
            <option value="CLOSED">Closures</option>
            <option value="UPDATED">Modifications</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="audit-view-toggle" role="group" aria-label="Layout view mode toggle">
          <button
            type="button"
            className={`audit-toggle-btn ${viewMode === "table" ? "active" : ""}`}
            onClick={() => setViewMode("table")}
            aria-pressed={viewMode === "table"}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18" />
              <path d="M3 15h18" />
              <path d="M9 3v18" />
            </svg>
            <span>Table</span>
          </button>

          <button
            type="button"
            className={`audit-toggle-btn ${viewMode === "timeline" ? "active" : ""}`}
            onClick={() => setViewMode("timeline")}
            aria-pressed={viewMode === "timeline"}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="20" x2="12" y2="10" />
              <line x1="18" y1="20" x2="18" y2="4" />
              <line x1="6" y1="20" x2="6" y2="16" />
            </svg>
            <span>Timeline</span>
          </button>
        </div>
      </section>

      {/* Results Count Bar */}
      <div className="audit-results-bar">
        <span>
          Showing <strong>{filteredLogs.length}</strong> of <strong>{logs.length}</strong> total events
        </span>
        {(searchQuery || entityFilter !== "ALL" || actionFilter !== "ALL") && (
          <button
            type="button"
            className="audit-results-reset-btn"
            onClick={handleResetFilters}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Audit Events Table / Timeline */}
      <main>
        <AuditLogTable
          logs={filteredLogs}
          loading={loading}
          error={error}
          onRetry={handleManualRefresh}
          viewMode={viewMode}
        />
      </main>
    </div>
  );
}

export default AuditLogs;
