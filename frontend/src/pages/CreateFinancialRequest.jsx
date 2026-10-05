import { useState } from "react";
import { createFinancialRequest } from "../services/financialRequestService";

function CreateFinancialRequest() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
    category: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  return (
    <main className="request-page">
      <section className="request-form-container">
        <h1>Create Financial Request</h1>

        <p>Submit a financial request for review.</p>

        <form onSubmit={handleSubmit}>
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
