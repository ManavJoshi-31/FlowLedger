import { useState, useMemo, useEffect } from "react";
import FinancialRequestItem from "./FinancialRequestItem";
import "./FinancialRequestItem.css";

const ITEMS_PER_PAGE = 5;

function FinancialRequestList({ requests = [], onRequestUpdated }) {
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter requests by status and search terms
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      // 1. Status Filter
      if (activeFilter === "PENDING" && req.status !== "PENDING") return false;
      if (activeFilter === "APPROVED" && req.status !== "APPROVED") return false;
      if (activeFilter === "REJECTED" && req.status !== "REJECTED") return false;

      // 2. Search Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = (req.title || "").toLowerCase().includes(query);
        const descMatch = (req.description || "").toLowerCase().includes(query);
        const categoryMatch = (req.category || "").toLowerCase().includes(query);
        const idMatch = (req._id || "").toLowerCase().includes(query);
        if (!titleMatch && !descMatch && !categoryMatch && !idMatch) {
          return false;
        }
      }

      return true;
    });
  }, [requests, activeFilter, searchQuery]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredRequests.length);
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (requests.length === 0) {
    return (
      <div className="state-box">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: "var(--color-steel)" }}
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        <span className="state-box-title">No financial requests found</span>
        <span className="state-box-desc">
          When requests are submitted or assigned to your department, they will appear here.
        </span>
      </div>
    );
  }

  return (
    <div className="financial-requests-wrapper">
      {/* Search & Filter Toolbar */}
      <div className="financial-requests-toolbar">
        <div className="filter-tabs-pill" role="tablist" aria-label="Filter Requests">
          <button
            type="button"
            className={`filter-tab-btn ${activeFilter === "ALL" ? "active" : ""}`}
            onClick={() => setActiveFilter("ALL")}
          >
            All ({requests.length})
          </button>
          <button
            type="button"
            className={`filter-tab-btn ${activeFilter === "PENDING" ? "active" : ""}`}
            onClick={() => setActiveFilter("PENDING")}
          >
            Pending ({requests.filter((r) => r.status === "PENDING").length})
          </button>
          <button
            type="button"
            className={`filter-tab-btn ${activeFilter === "APPROVED" ? "active" : ""}`}
            onClick={() => setActiveFilter("APPROVED")}
          >
            Approved ({requests.filter((r) => r.status === "APPROVED").length})
          </button>
        </div>

        <div className="search-input-wrapper">
          <svg
            className="search-icon"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search by title, category, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchQuery("")}
              title="Clear search"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* List Container */}
      {filteredRequests.length === 0 ? (
        <div className="state-box" style={{ padding: "2.5rem 1rem", marginTop: "1rem" }}>
          <span className="state-box-title" style={{ fontSize: "1rem" }}>
            No matching requests
          </span>
          <span className="state-box-desc" style={{ fontSize: "0.85rem" }}>
            Try adjusting your search query or filter tab.
          </span>
        </div>
      ) : (
        <>
          <div className="financial-requests-container">
            {paginatedRequests.map((request) => (
              <FinancialRequestItem
                key={request._id}
                request={request}
                onRequestUpdated={onRequestUpdated}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="requests-pagination-bar">
              <span className="pagination-info">
                Showing <strong>{startIndex + 1}</strong> to <strong>{endIndex}</strong> of{" "}
                <strong>{filteredRequests.length}</strong> requests
              </span>

              <div className="pagination-actions">
                <button
                  type="button"
                  className="pagination-btn"
                  onClick={() => handlePageChange(safeCurrentPage - 1)}
                  disabled={safeCurrentPage === 1}
                  aria-label="Previous Page"
                >
                  ← Prev
                </button>

                <div className="pagination-pages">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      className={`pagination-page-chip ${safeCurrentPage === pageNum ? "active" : ""}`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className="pagination-btn"
                  onClick={() => handlePageChange(safeCurrentPage + 1)}
                  disabled={safeCurrentPage === totalPages}
                  aria-label="Next Page"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default FinancialRequestList;
