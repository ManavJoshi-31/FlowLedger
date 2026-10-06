import FinancialRequestItem from "./FinancialRequestItem";

function FinancialRequestList({ requests, onRequestUpdated }) {
  if (requests.length === 0) {
    return (
      <div className="state-box">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-steel)" }}>
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
    <div className="financial-requests-container">
      {requests.map((request) => (
        <FinancialRequestItem
          key={request._id}
          request={request}
          onRequestUpdated={onRequestUpdated}
        />
      ))}
    </div>
  );
}

export default FinancialRequestList;
