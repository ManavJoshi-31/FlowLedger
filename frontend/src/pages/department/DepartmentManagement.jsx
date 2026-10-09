import { useEffect, useState } from "react";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
} from "../../services/departmentService";
import { getDepartmentManagers } from "../../services/userService";
import "./DepartmentManagement.css";

function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    managerId: "",
  });

  const [editingDepartment, setEditingDepartment] = useState(null);

  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    managerId: "",
    status: "ACTIVE",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [departmentData, managerData] = await Promise.all([
          getDepartments(),
          getDepartmentManagers(),
        ]);

        setDepartments(departmentData.departments);
        setManagers(managerData.managers);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load department data",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("Department name is required.");
      return;
    }

    if (!formData.managerId) {
      setError("Please select a department manager.");
      return;
    }

    try {
      setSubmitting(true);

      const data = await createDepartment({
        name: formData.name.trim(),
        description: formData.description.trim(),
        managerId: formData.managerId,
      });

      setDepartments((currentDepartments) => [
        ...currentDepartments,
        data.department,
      ]);

      setFormData({
        name: "",
        description: "",
        managerId: "",
      });

      setSuccess(data.message || "Department created successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create department");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (department) => {
    setError("");
    setSuccess("");

    setEditingDepartment(department);

    setEditFormData({
      name: department.name,
      description: department.description || "",
      managerId: department.managerId || "",
      status: department.status,
    });
  };

  const handleCancelEdit = () => {
    setEditingDepartment(null);

    setEditFormData({
      name: "",
      description: "",
      managerId: "",
      status: "ACTIVE",
    });

    setError("");
  };

  const handleUpdate = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!editFormData.name.trim()) {
      setError("Department name is required.");
      return;
    }

    if (!editFormData.managerId) {
      setError("Please select a department manager.");
      return;
    }

    try {
      setUpdating(true);

      const data = await updateDepartment(editingDepartment._id, {
        name: editFormData.name.trim(),
        description: editFormData.description.trim(),
        managerId: editFormData.managerId,
        status: editFormData.status,
      });

      setDepartments((currentDepartments) =>
        currentDepartments.map((department) =>
          department._id === editingDepartment._id
            ? data.department
            : department,
        ),
      );

      setEditingDepartment(null);

      setEditFormData({
        name: "",
        description: "",
        managerId: "",
        status: "ACTIVE",
      });

      setSuccess(data.message || "Department updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update department");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-indicator">
        <span className="spinner"></span>
        <span>Loading department records...</span>
      </div>
    );
  }

  return (
    <div className="mgmt-page-layout">
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Department Management</h1>
          <p className="page-subtitle">
            Configure enterprise departments, assign leadership, and govern status
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success" role="status">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>{success}</span>
        </div>
      )}

      <div className="mgmt-split-grid">
        {/* Form Panel: Create or Edit */}
        <div>
          {editingDepartment ? (
            <div className="mgmt-form-card editing-mode">
              <div className="mgmt-form-header">
                <h2 className="mgmt-form-title">Edit Department</h2>
                <span className="mgmt-editing-indicator">Editing Mode</span>
              </div>

              <form onSubmit={handleUpdate}>
                <div className="form-field">
                  <label htmlFor="edit-department-name">Department Name *</label>
                  <input
                    id="edit-department-name"
                    name="name"
                    type="text"
                    value={editFormData.name}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="edit-description">Description</label>
                  <textarea
                    id="edit-description"
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditChange}
                    rows={3}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="edit-managerId">Department Manager *</label>
                  <select
                    id="edit-managerId"
                    name="managerId"
                    value={editFormData.managerId}
                    onChange={handleEditChange}
                    required
                  >
                    <option value="">Select a manager</option>
                    {managers.map((manager) => (
                      <option key={manager._id} value={manager._id}>
                        {manager.name} ({manager.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="edit-status">Status</label>
                  <select
                    id="edit-status"
                    name="status"
                    value={editFormData.status}
                    onChange={handleEditChange}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>

                <div className="form-actions" style={{ marginTop: "1rem" }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleCancelEdit}
                    disabled={updating}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={updating}>
                    {updating ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="mgmt-form-card">
              <div className="mgmt-form-header">
                <h2 className="mgmt-form-title">Create Department</h2>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-field">
                  <label htmlFor="name">Department Name *</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Engineering & IT"
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Provide scope and purpose of the department"
                    rows={3}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="managerId">Department Manager *</label>
                  <select
                    id="managerId"
                    name="managerId"
                    value={formData.managerId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a manager</option>
                    {managers.map((manager) => (
                      <option key={manager._id} value={manager._id}>
                        {manager.name} ({manager.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-actions" style={{ marginTop: "1rem" }}>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? "Creating..." : "Create Department"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Existing Departments List / Table */}
        <div className="mgmt-table-card">
          <div className="mgmt-table-header">
            <h2 className="mgmt-table-title">Existing Departments</h2>
            <span className="badge badge-draft">{departments.length} total</span>
          </div>

          {departments.length === 0 ? (
            <div className="state-box" style={{ margin: "1.5rem" }}>
              <span className="state-box-title">No departments configured</span>
              <span className="state-box-desc">
                Use the form on the left to create your organization&apos;s first department.
              </span>
            </div>
          ) : (
            <div className="mgmt-table-responsive">
              <table className="mgmt-table">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Manager</th>
                    <th>Status</th>
                    <th className="mgmt-actions-cell">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((department) => {
                    const manager = managers.find(
                      (m) => m._id === department.managerId,
                    );
                    const isSelected = editingDepartment?._id === department._id;

                    return (
                      <tr
                        key={department._id}
                        style={isSelected ? { backgroundColor: "#f0f7f5" } : undefined}
                      >
                        <td>
                          <div className="mgmt-user-cell">
                            <span className="mgmt-user-name">{department.name}</span>
                            <span className="mgmt-user-email">
                              {department.description || "No description provided"}
                            </span>
                          </div>
                        </td>
                        <td>{manager ? manager.name : "Unassigned"}</td>
                        <td>
                          <span
                            className={`badge ${
                              department.status === "ACTIVE"
                                ? "badge-active"
                                : "badge-inactive"
                            }`}
                          >
                            {department.status}
                          </span>
                        </td>
                        <td className="mgmt-actions-cell">
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleEdit(department)}
                            disabled={updating}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DepartmentManagement;
