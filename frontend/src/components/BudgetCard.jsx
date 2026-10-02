function BudgetCard({ budget }) {
  const totalAmount = Number(budget.totalAmount);
  const usedAmount = Number(budget.usedAmount);
  const availableAmount = totalAmount - usedAmount;

  return (
    <div>
      <h3>Budget</h3>

      <p>Total: ₹{totalAmount}</p>

      <p>Used: ₹{usedAmount}</p>

      <p>Available: ₹{availableAmount}</p>

      <p>Status: {budget.status}</p>
    </div>
  );
}

export default BudgetCard;
