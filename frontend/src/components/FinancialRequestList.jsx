import FinancialRequestItem from "./FinancialRequestItem";

function FinancialRequestList({ requests, onRequestUpdated }) {
  if (requests.length === 0) {
    return <p>No financial requests found.</p>;
  }

  return (
    <div>
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
