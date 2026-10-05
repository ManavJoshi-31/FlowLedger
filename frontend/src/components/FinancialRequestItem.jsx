function FinancialRequestItem({ request }) {
  return (
    <div>
      <h3>{request.title}</h3>

      <p>Amount: ₹{Number(request.amount).toLocaleString("en-IN")}</p>

      <p>Category: {request.category}</p>

      <p>Status: {request.status}</p>

      <small>
        Created: {new Date(request.createdAt).toLocaleDateString("en-IN")}
      </small>
    </div>
  );
}

export default FinancialRequestItem;
