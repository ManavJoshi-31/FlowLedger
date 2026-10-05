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

    setError("");
    setSuccess("");

    if (!formData.budgetId) {
      setError("Please select a budget.");
      return;
    }

    if (!formData.title.trim()) {
      setError("Please enter a request title.");
      return;
    }

    if (!formData.description.trim()) {
      setError("Please enter a description.");
      return;
    }

    const amount = Number(formData.amount);

    if (!formData.amount) {
      setError("Please enter a request amount.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }

    if (!Number.isInteger(amount)) {
      setError("Amount must be a whole number.");
      return;
    }

    if (!formData.category) {
      setError("Please select a category.");
      return;
    }

    try {
      setSubmitting(true);

      const data = await createFinancialRequest({
        ...formData,
        amount,
      });

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
          {/* Budget */}
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
                  {`Budget — ${new Date(
                    budget.period.startDate,
                  ).getFullYear()}–${new Date(
                    budget.period.endDate,
                  ).getFullYear()}`}
                </option>
              ))}
            </select>
          </div>

          {budgetsError && <p>{budgetsError}</p>}

          {/* Request Title */}
          <div className="form-field">
            <label htmlFor="title">Request Title</label>

            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter request title"
            />
          </div>

          {/* Description */}
          <div className="form-field">
            <label htmlFor="description">Description</label>

            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Explain why this request is needed"
              rows="5"
            />
          </div>

          {/* Amount */}
          <div className="form-field">
            <label htmlFor="amount">Amount (₹)</label>

            <input
              id="amount"
              name="amount"
              type="number"
              min="1"
              step="1"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Enter requested amount"
            />
          </div>

          {/* Category */}
          <div className="form-field">
            <label htmlFor="category">Category</label>

            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="">Select a category</option>

              <option value="PURCHASE">Purchase</option>

              <option value="TRAVEL">Travel</option>

              <option value="REIMBURSEMENT">Reimbursement</option>

              <option value="TRAINING">Training</option>

              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Submit */}
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
