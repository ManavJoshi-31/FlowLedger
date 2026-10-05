import { useEffect, useState } from "react";
import { createFinancialRequest } from "../services/financialRequestService";
import { getBudgets } from "../services/budgetService";

function CreateFinancialRequest() {
  const [formData, setFormData] = useState({
    budgetId: "",
    title: "",
    description: "",
    amount: "",
    category: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [budgets, setBudgets] = useState([]);
  const [budgetsLoading, setBudgetsLoading] = useState(true);
  const [budgetsError, setBudgetsError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      const data = await createFinancialRequest(formData);

      setSuccess(data.message);
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to create financial request",
      );
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        setBudgetsLoading(true);
        setBudgetsError("");

        const data = await getBudgets();

        setBudgets(data.budgets.filter((budget) => budget.status === "ACTIVE"));
      } catch (error) {
        setBudgetsError(
          error.response?.data?.message || "Failed to load budgets",
        );
      } finally {
        setBudgetsLoading(false);
      }
    };

    fetchBudgets();
  }, []);

  return (
    <main className="request-page">
      <section className="request-form-container">
        <h1>Create Financial Request</h1>

        <p>Submit a request against an available department budget.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="budgetId">Budget</label>

            <select
              id="budgetId"
              name="budgetId"
              value={formData.budgetId}
              onChange={handleChange}
              disabled={budgetsLoading}
            >
              <option value="">
                {budgetsLoading ? "Loading budgets..." : "Select a budget"}
              </option>

              {budgets.map((budget) => (
                <option key={budget._id} value={budget._id}>
                  {new Date(budget.period.startDate).toLocaleDateString(
                    "en-IN",
                  )}{" "}
                  –{" "}
                  {new Date(budget.period.endDate).toLocaleDateString("en-IN")}
                </option>
              ))}
            </select>
          </div>

          {budgetsError && <p>{budgetsError}</p>}

          <button type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
        </form>

        {error && <p>{error}</p>}
        {success && <p>{success}</p>}
      </section>
    </main>
  );
}

export default CreateFinancialRequest;
