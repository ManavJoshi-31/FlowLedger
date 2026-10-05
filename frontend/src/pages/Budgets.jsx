import { useEffect, useState } from "react";
import { getBudgets } from "../services/budgetService";
import BudgetCard from "../components/BudgetCard";
function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getBudgets();

        setBudgets(data.budgets);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to load budgets");
      } finally {
        setLoading(false);
      }
    };

    fetchBudgets();
  }, []);

  return (
    <main>
      <h1>Budgets</h1>

      {loading && <p>Loading budgets...</p>}

      {error && <p>{error}</p>}

      {!loading && !error && (
        <section>
          {budgets.length === 0 ? (
            <p>No budgets found.</p>
          ) : (
            budgets.map((budget) => (
              <BudgetCard key={budget._id} budget={budget} />
            ))
          )}
        </section>
      )}
    </main>
  );
}

export default Budgets;
