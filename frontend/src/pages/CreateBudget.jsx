import { useEffect, useState } from "react";
import { getDepartments } from "../services/departmentService";
import { createBudget } from "../services/budgetService";

function CreateBudget() {
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    departmentId: "",
    totalAmount: "",
    startDate: "",
    endDate: "",
  });

  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoadingDepartments(true);
        setError("");

        const data = await getDepartments();

        setDepartments(data.departments);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to load departments");
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, []);

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

    if (!formData.departmentId) {
      setError("Please select a department.");
      return;
    }

    if (!formData.totalAmount) {
      setError("Please enter a total budget amount.");
      return;
    }

    const totalAmount = Number(formData.totalAmount);

    if (!Number.isFinite(totalAmount) || totalAmount < 0) {
      setError("Budget amount cannot be negative.");
      return;
    }

    if (!Number.isInteger(totalAmount)) {
      setError("Budget amount must be a whole number.");
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      setError("Please select both budget dates.");
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError("Start date must be before end date.");
      return;
    }

    try {
      setSubmitting(true);

      const data = await createBudget({
        departmentId: formData.departmentId,
        totalAmount,
        period: {
          startDate: formData.startDate,
          endDate: formData.endDate,
        },
      });

      setSuccess(data.message);

      setFormData({
        departmentId: "",
        totalAmount: "",
        startDate: "",
        endDate: "",
      });
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create budget");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main>
      <h1>Create Budget</h1>

      {loadingDepartments && <p>Loading departments...</p>}

      {!loadingDepartments && (
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="departmentId">Department</label>

            <select
              id="departmentId"
              name="departmentId"
              value={formData.departmentId}
              onChange={handleChange}
            >
              <option value="">Select a department</option>

              {departments.map((department) => (
                <option key={department._id} value={department._id}>
                  {department.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="totalAmount">Total Budget Amount (₹)</label>

            <input
              id="totalAmount"
              name="totalAmount"
              type="number"
              min="0"
              step="1"
              value={formData.totalAmount}
              onChange={handleChange}
              placeholder="Enter budget amount"
            />
          </div>

          <div className="form-field">
            <label htmlFor="startDate">Start Date</label>

            <input
              id="startDate"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label htmlFor="endDate">End Date</label>

            <input
              id="endDate"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
            />
          </div>

          <button type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create Budget"}
          </button>
        </form>
      )}

      {error && <p>{error}</p>}

      {success && <p>{success}</p>}
    </main>
  );
}

export default CreateBudget;
