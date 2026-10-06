import { useEffect, useState } from "react";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
} from "../services/departmentService";
import { getDepartmentManagers } from "../services/userService";

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
      } catch (error) {
        setError(
          error.response?.data?.message || "Failed to load department data",
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

      setSuccess(data.message);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create department");
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

      setSuccess(data.message);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update department");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <main>
        <h1>Department Management</h1>
        <p>Loading departments...</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Department Management</h1>

      <section>
        <h2>Create Department</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="name">Department Name</label>

            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter department name"
            />
          </div>

          <div className="form-field">
            <label htmlFor="description">Description</label>

            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter department description"
            />
          </div>

          <div className="form-field">
            <label htmlFor="managerId">Department Manager</label>

            <select
              id="managerId"
              name="managerId"
              value={formData.managerId}
              onChange={handleChange}
            >
              <option value="">Select a manager</option>

              {managers.map((manager) => (
                <option key={manager._id} value={manager._id}>
                  {manager.name} ({manager.email})
                </option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create Department"}
          </button>
        </form>
      </section>

      {error && <p>{error}</p>}
      {success && <p>{success}</p>}

      {editingDepartment && (
        <section>
          <h2>Edit Department: {editingDepartment.name}</h2>

          <form onSubmit={handleUpdate}>
            <div className="form-field">
              <label htmlFor="edit-department-name">Department Name</label>

              <input
                id="edit-department-name"
                name="name"
                type="text"
                value={editFormData.name}
                onChange={handleEditChange}
              />
            </div>

            <div className="form-field">
              <label htmlFor="edit-description">Description</label>

              <textarea
                id="edit-description"
                name="description"
                value={editFormData.description}
                onChange={handleEditChange}
              />
            </div>

            <div className="form-field">
              <label htmlFor="edit-managerId">Department Manager</label>

              <select
                id="edit-managerId"
                name="managerId"
                value={editFormData.managerId}
                onChange={handleEditChange}
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

            <button type="submit" disabled={updating}>
              {updating ? "Updating..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={updating}
            >
              Cancel
            </button>
          </form>
        </section>
      )}

      <section>
        <h2>Existing Departments</h2>

        {departments.length === 0 ? (
          <p>No departments found.</p>
        ) : (
          <div>
            {departments.map((department) => (
              <article key={department._id}>
                <h3>{department.name}</h3>

                <p>{department.description || "No description provided."}</p>

                <p>Status: {department.status}</p>

                <p>
                  Manager:{" "}
                  {managers.find(
                    (manager) => manager._id === department.managerId,
                  )?.name || "Unknown"}
                </p>

                <button
                  type="button"
                  onClick={() => handleEdit(department)}
                  disabled={updating}
                >
                  Edit
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default DepartmentManagement;
