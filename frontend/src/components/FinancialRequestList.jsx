import FinancialRequestItem from "./FinancialRequestItem";

function FinancialRequestList({ requests }) {
  if (requests.length === 0) {
    return <p>No financial requests found.</p>;
  }

  return (
    <div>
      {requests.map((request) => (
        <FinancialRequestItem key={request._id} request={request} />
      ))}
    </div>
  );
}

export default FinancialRequestList;
