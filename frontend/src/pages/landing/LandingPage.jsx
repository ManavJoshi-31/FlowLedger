import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import "./LandingPage.css";

export default function LandingPage() {
  const { isAuthenticated } = useContext(AuthContext);
  const [scrolled, setScrolled] = useState(false);
  const [activeModule, setActiveModule] = useState("budgets");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const projectModules = {
    budgets: {
      badge: "BUDGET GOVERNANCE",
      title: "Department Budgets & Allocation Caps",
      roleAccess: "Finance Managers & Executive Admins",
      description:
        "Define and monitor departmental spending caps across fiscal quarters. Backed by high-precision financial arithmetic to guarantee zero reconciliation discrepancies.",
      highlights: [
        "Real-time spent vs. remaining capacity gauges",
        "Granular department-level fiscal constraints",
        "Automated warnings when approaching allocation limits",
      ],
      preview: {
        metric1Label: "Quarterly Allocation",
        metric1Val: "$2,450,000.00",
        metric2Label: "Deployed Capital",
        metric2Val: "$1,680,200.00 (68.5%)",
        metric3Label: "Remaining Liquidity",
        metric3Val: "$769,800.00",
        summary:
          "Engineering Department — Active quarterly budget envelope is 68.5% utilized.",
      },
    },
    requests: {
      badge: "MULTI-TIER APPROVALS",
      title: "Financial Expense Requests & Workflows",
      roleAccess: "Employees & Department Managers",
      description:
        "Employees submit structured financial requests with designated expense categories and justifications. Department managers and finance controllers approve or reject with audit comments.",
      highlights: [
        "Multi-stage approval progression with real-time status tracking",
        "Manager authorization limits and strict organizational isolation",
        "Instant rejection commentary and actionable audit feedback",
      ],
      preview: {
        metric1Label: "Active Queue",
        metric1Val: "14 In Review",
        metric2Label: "Avg Approval Velocity",
        metric2Val: "3.2 Hours",
        metric3Label: "Policy Compliance",
        metric3Val: "99.8%",
        summary:
          "Cloud Infrastructure Expansion — Department manager approval verified; pending finance sign-off.",
      },
    },
    departments: {
      badge: "ORGANIZATIONAL STRUCTURE",
      title: "Department Hierarchy & Manager Mapping",
      roleAccess: "Organization Administrators",
      description:
        "Architect organizations with discrete operational departments. Map designated managers with spending authority and enforce strict departmental isolation boundaries.",
      highlights: [
        "Structured department rosters and manager bindings",
        "Cross-department spending firewalls",
        "Centralized organizational governance",
      ],
      preview: {
        metric1Label: "Active Departments",
        metric1Val: "8 Units",
        metric2Label: "Assigned Managers",
        metric2Val: "8 Managers",
        metric3Label: "Boundary Status",
        metric3Val: "Strictly Enforced",
        summary:
          "Operations & Logistics — Head of Department assigned; dedicated spending envelope established.",
      },
    },
    users: {
      badge: "ACCESS GOVERNANCE",
      title: "Enterprise User & Role Governance",
      roleAccess: "Organization Administrators",
      description:
        "Enforce strict 4-tier Role-Based Access Control: Organization Admin, Finance Manager, Department Manager, and Employee. Real-time active status verification protects every workflow invocation.",
      highlights: [
        "Granular RBAC with defense-in-depth authorization",
        "Immediate user deactivation controls",
        "Tenant-scoped user directories",
      ],
      preview: {
        metric1Label: "Active Directory",
        metric1Val: "42 Members",
        metric2Label: "Access Tiers",
        metric2Val: "4 Roles",
        metric3Label: "Authentication",
        metric3Val: "Secure Session",
        summary:
          "User access state verified — Multi-layered permissions assigned per departmental assignment.",
      },
    },
    audit: {
      badge: "COMPLIANCE & INTEGRITY",
      title: "Immutable Audit Logs & Event Trail",
      roleAccess: "Auditors & Compliance Officers",
      description:
        "Every budget creation, limit adjustment, expense submission, approval, and rejection is permanently recorded with timestamps, user attribution, and multi-tenant isolation tags.",
      highlights: [
        "Chronological forensic audit stream",
        "Granular actor attribution and policy verification",
        "Permanent tamper-evident operational compliance",
      ],
      preview: {
        metric1Label: "Logged Events",
        metric1Val: "1,842 Records",
        metric2Label: "Integrity Verification",
        metric2Val: "100% Passed",
        metric3Label: "Retention Policy",
        metric3Val: "Permanent",
        summary:
          "Department budget allocation modification signed and committed to immutable compliance ledger.",
      },
    },
  };

  const currentMod = projectModules[activeModule];

  return (
    <div className="landing-light-root">
      {/* Luminous Animated Background with Deep Slate Accents */}
      <div className="light-mesh-bg" aria-hidden="true">
        <div className="light-glow-sphere sphere-dark" />
        <div className="light-glow-sphere sphere-slate" />
        <div className="light-grid-pattern" />
      </div>

      {/* Navigation Header */}
      <header className={`landing-light-nav ${scrolled ? "nav-scrolled" : ""}`}>
        <div className="nav-container">
          <Link to="/" className="brand-logo" aria-label="FlowLedger Home">
            <span className="brand-emblem">❖</span>
            <span className="brand-name">
              Flow<span className="brand-dark">Ledger</span>
            </span>
          </Link>

          <nav className="nav-links">
            <a href="#modules" onClick={() => setActiveModule("budgets")}>
              Budgets
            </a>
            <a href="#modules" onClick={() => setActiveModule("requests")}>
              Requests
            </a>
            <a href="#modules" onClick={() => setActiveModule("departments")}>
              Departments
            </a>
            <a href="#modules" onClick={() => setActiveModule("users")}>
              Users &amp; Roles
            </a>
            <a href="#modules" onClick={() => setActiveModule("audit")}>
              Audit Trail
            </a>
          </nav>

          <div className="nav-actions">
            <Link
              to={isAuthenticated ? "/dashboard" : "/login"}
              className="btn-dark-launch"
            >
              Launch Platform
              <span className="arrow">→</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-light-section">
        <div className="hero-light-content">
          <div className="badge-pill-dark animate-fade-in">
            <span className="badge-pulse-dark" />
            <span>Multi-Tenant Enterprise Budget Governance</span>
          </div>

          <h1 className="hero-light-title animate-fade-up">
            Financial workflows with <br />
            <span className="serif-dark-highlight">
              mathematical certainty.
            </span>
          </h1>

          <p className="hero-light-subtitle animate-fade-up-1">
            Empower enterprise teams to disburse, allocate, and audit capital
            across departments. Multi-layered fiscal velocity guarded by
            multi-tier approval chains and precision accounting.
          </p>


          <div className="hero-light-stats animate-fade-up-3">
            <div className="stat-box">
              <span className="stat-val">100%</span>
              <span className="stat-lbl">Accounting Precision</span>
            </div>
            <div className="stat-sep" />
            <div className="stat-box">
              <span className="stat-val">4 Roles</span>
              <span className="stat-lbl">Strict RBAC Hierarchy</span>
            </div>
            <div className="stat-sep" />
            <div className="stat-box">
              <span className="stat-val">Isolated</span>
              <span className="stat-lbl">Organization Boundary</span>
            </div>
          </div>
        </div>

        {/* Live Interactive Hero Preview Card */}
        <div className="hero-light-visual animate-float-gentle">
          <div className="light-glass-mockup">
            <div className="mockup-light-header">
              <div className="traffic-lights">
                <span className="dot red" />
                <span className="dot yellow" />
                <span className="dot green" />
              </div>
              <div className="mockup-url">
                FlowLedger Enterprise Fiscal Governance
              </div>
              <span className="mockup-status-chip">ACTIVE LEDGER</span>
            </div>

            <div className="mockup-light-body">
              <div className="mockup-stat-card">
                <div className="stat-card-header-row">
                  <span className="stat-card-dept">Engineering Department</span>
                  <span className="stat-card-badge">Q3 Envelope</span>
                </div>
                <div className="stat-card-amount">$1,850,000.00</div>
                <div className="stat-progress-bar">
                  <div
                    className="stat-progress-fill"
                    style={{ width: "68%" }}
                  />
                </div>
                <div className="stat-card-sub">
                  <span>$1,258,000.00 Allocated (68%)</span>
                  <span className="remaining-text">$592,000.00 Headroom</span>
                </div>
              </div>

              {/* Structured Real-Time Audit Feed */}
              <div className="mockup-activity-feed">
                <div className="feed-header-label">
                  <span>Live Reconciliation Stream</span>
                  <span className="feed-live-dot" />
                </div>

                <div className="mockup-feed-item">
                  <div className="ticket-icon-check">✓</div>
                  <div className="feed-item-info">
                    <div className="ticket-main-text">
                      Hardware Refresh Approved
                    </div>
                    <div className="ticket-sub-text">
                      Engineering Department • $14,250.00
                    </div>
                  </div>
                  <span className="ticket-tag">Verified</span>
                </div>

                <div className="mockup-feed-item">
                  <div className="ticket-icon-bolt">⚡</div>
                  <div className="feed-item-info">
                    <div className="ticket-main-text">
                      Cryptographic Audit Entry
                    </div>
                    <div className="ticket-sub-text">
                      Reconciled &amp; Committed • Block #849,201
                    </div>
                  </div>
                  <span className="ticket-tag audit-tag">Audited</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meaningful Real Project Modules Showcase */}
      <section id="modules" className="section-light-container">
        <div className="section-light-head">
          <span className="section-light-tag">SYSTEM ARCHITECTURE</span>
          <h2 className="section-light-title">
            Real Project Modules Built for Governance
          </h2>
          <p className="section-light-subtitle">
            FlowLedger connects all financial operational dimensions into one
            verified, role-guarded platform.
          </p>
        </div>

        {/* Module Switcher Tabs */}
        <div className="module-tabs-wrapper" role="tablist">
          <button
            type="button"
            className={`module-tab-btn ${activeModule === "budgets" ? "active" : ""}`}
            onClick={() => setActiveModule("budgets")}
          >
            <span className="tab-icon">📊</span>
            <span>Budgets</span>
          </button>
          <button
            type="button"
            className={`module-tab-btn ${activeModule === "requests" ? "active" : ""}`}
            onClick={() => setActiveModule("requests")}
          >
            <span className="tab-icon">💳</span>
            <span>Requests</span>
          </button>
          <button
            type="button"
            className={`module-tab-btn ${activeModule === "departments" ? "active" : ""}`}
            onClick={() => setActiveModule("departments")}
          >
            <span className="tab-icon">🏢</span>
            <span>Departments</span>
          </button>
          <button
            type="button"
            className={`module-tab-btn ${activeModule === "users" ? "active" : ""}`}
            onClick={() => setActiveModule("users")}
          >
            <span className="tab-icon">👥</span>
            <span>Users &amp; Roles</span>
          </button>
          <button
            type="button"
            className={`module-tab-btn ${activeModule === "audit" ? "active" : ""}`}
            onClick={() => setActiveModule("audit")}
          >
            <span className="tab-icon">📜</span>
            <span>Audit Trail</span>
          </button>
        </div>

        {/* Selected Module Detail Card */}
        <div className="module-detail-card">
          <div className="module-detail-content">
            <span className="module-badge-tag">{currentMod.badge}</span>
            <h3 className="module-title">{currentMod.title}</h3>
            <p className="module-desc">{currentMod.description}</p>

            <div className="module-access-info">
              <span className="access-label">Authorized Personnel:</span>
              <strong className="access-value">{currentMod.roleAccess}</strong>
            </div>

            <ul className="module-features-list">
              {currentMod.highlights.map((item, idx) => (
                <li key={idx}>
                  <span className="check-bullet">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="module-detail-preview">
            <div className="preview-terminal-card">
              <div className="preview-top">
                <span className="preview-dot" />
                <span className="preview-title">
                  Operational Monitor • {currentMod.title}
                </span>
              </div>
              <div className="preview-kpi-grid">
                <div className="kpi-mini">
                  <span className="kpi-lbl">
                    {currentMod.preview.metric1Label}
                  </span>
                  <span className="kpi-val">
                    {currentMod.preview.metric1Val}
                  </span>
                </div>
                <div className="kpi-mini">
                  <span className="kpi-lbl">
                    {currentMod.preview.metric2Label}
                  </span>
                  <span className="kpi-val text-accent">
                    {currentMod.preview.metric2Val}
                  </span>
                </div>
                <div className="kpi-mini">
                  <span className="kpi-lbl">
                    {currentMod.preview.metric3Label}
                  </span>
                  <span className="kpi-val">
                    {currentMod.preview.metric3Val}
                  </span>
                </div>
              </div>
              <div className="preview-log-row">
                <span className="log-icon">❯</span>
                <span className="preview-summary-text">
                  {currentMod.preview.summary}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Authorization Matrix Section */}
      <section className="section-light-container" id="roles">
        <div className="section-light-head">
          <span className="section-light-tag">DEFENSE IN DEPTH</span>
          <h2 className="section-light-title">
            Strict Role-Based Access Hierarchy
          </h2>
          <p className="section-light-subtitle">
            FlowLedger enforces role separation at both the user interface
            boundary and database query layers.
          </p>
        </div>

        <div className="roles-grid">
          <div className="role-card">
            <div className="role-card-badge admin">ORGANIZATION_ADMIN</div>
            <h4>Full Organization Authority</h4>
            <p>
              Creates departments, assigns managers, configures users, and
              reviews company-wide audit trails.
            </p>
            <div className="role-governance-label">
              Executive Administrative Oversight
            </div>
          </div>

          <div className="role-card">
            <div className="role-card-badge finance">FINANCE_MANAGER</div>
            <h4>Budget &amp; Fiscal Governance</h4>
            <p>
              Allocates department budget pools, monitors financial health, and
              performs final disbursement approvals.
            </p>
            <div className="role-governance-label">
              Fiscal Cap &amp; Disbursement Authority
            </div>
          </div>

          <div className="role-card">
            <div className="role-card-badge manager">DEPARTMENT_MANAGER</div>
            <h4>Department Approver</h4>
            <p>
              Oversees assigned departmental spend, reviews incoming employee
              requests, and manages team members.
            </p>
            <div className="role-governance-label">
              Departmental First-Tier Sign-Off
            </div>
          </div>

          <div className="role-card">
            <div className="role-card-badge employee">EMPLOYEE</div>
            <h4>Request Submitter</h4>
            <p>
              Initiates financial requests with justification amounts,
              categorizing items for manager review.
            </p>
            <div className="role-governance-label">
              Structured Request Initiation
            </div>
          </div>
        </div>
      </section>

      {/* High-Impact CTA Banner */}
      <section className="cta-light-banner">
        <div className="cta-light-inner">
          <span className="cta-light-tag">ENTERPRISE CLOUD GOVERNANCE</span>
          <h2 className="cta-light-title">
            Ready to bring deterministic clarity to your balance sheet?
          </h2>
          <p className="cta-light-text">
            Join enterprise finance teams governing departmental allocations
            with FlowLedger.
          </p>
          <div className="cta-light-actions">
            <Link
              to={isAuthenticated ? "/dashboard" : "/login"}
              className="btn-hero-dark"
            >
              {isAuthenticated ? "Launch Dashboard" : "Launch Platform"}
              <span className="arrow">→</span>
            </Link>
            {!isAuthenticated && (
              <Link to="/login" className="btn-hero-signin">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-light-footer">
        <div className="footer-light-container">
          <div className="footer-light-brand">
            <div className="brand-logo">
              <span className="brand-emblem">❖</span>
              <span className="brand-name">
                Flow<span className="brand-dark">Ledger</span>
              </span>
            </div>
            <p className="footer-light-desc">
              Multi-tenant enterprise budget governance and financial workflow
              architecture.
            </p>
          </div>

          <div className="footer-light-links">
            <div className="footer-group">
              <h5>Project Modules</h5>
              <a href="#modules" onClick={() => setActiveModule("budgets")}>
                Budgets
              </a>
              <a href="#modules" onClick={() => setActiveModule("requests")}>
                Requests
              </a>
              <a href="#modules" onClick={() => setActiveModule("departments")}>
                Departments
              </a>
              <a href="#modules" onClick={() => setActiveModule("audit")}>
                Audit Logs
              </a>
            </div>

            <div className="footer-group">
              <h5>Security &amp; Compliance</h5>
              <span>SOC2-Ready Architecture</span>
              <span>Tenant-Isolated Database</span>
              <span>End-to-End Encryption</span>
              <span>Immutable Audit Logs</span>
            </div>
          </div>
        </div>

        <div className="footer-light-bottom">
          <p>
            © {new Date().getFullYear()} FlowLedger Systems. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
