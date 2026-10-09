import { useContext, useEffect, useState } from "react";
import AuthContext from "../../context/AuthContext";
import { getUsers, createUser, updateUser } from "../../services/userService";
import { getDepartments } from "../../services/departmentService";
import "./UserManagement.css";

function UserManagement() {
  const { user } = useContext(AuthContext);
  const isDeptManager = user?.role === "DEPARTMENT_MANAGER";
  const isAdmin = user?.role === "ORGANIZATION_ADMIN";

  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "EMPLOYEE",
    departmentId: "",
  });

  const [editingUser, setEditingUser] = useState(null);

  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    departmentId: "",
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

        if (isAdmin) {
          const [userData, departmentData] = await Promise.all([
            getUsers(),
            getDepartments(),
          ]);

          setUsers(userData.users);
          setDepartments(departmentData.departments);
        } else {
          // Department Manager: fetch users only (getDepartments is restricted)
          const userData = await getUsers();
          setUsers(userData.users);
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load user management data",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin]);

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
      setError("Name is required.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!formData.password) {
      setError("Password is required.");
      return;
    }

    if (isAdmin && formData.role === "EMPLOYEE" && !formData.departmentId) {
      setError("Employee must be assigned to a department.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: isDeptManager ? "EMPLOYEE" : formData.role,
        ...(isAdmin && formData.departmentId && {
          departmentId: formData.departmentId,
        }),
      };

      const data = await createUser(payload);

      setUsers((currentUsers) => [...currentUsers, data.user]);

      setFormData({
        name: "",
        email: "",
        password: "",
        role: "EMPLOYEE",
        departmentId: "",
      });

      setSuccess(data.message || "User created successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (userToEdit) => {
    setError("");
    setSuccess("");

    setEditingUser(userToEdit);

    setEditFormData({
      name: userToEdit.name,
      email: userToEdit.email,
      departmentId: userToEdit.departmentId || "",
      status: userToEdit.status,
    });
  };

  const handleCancelEdit = () => {
    setEditingUser(null);

    setEditFormData({
      name: "",
      email: "",
      departmentId: "",
      status: "ACTIVE",
    });

    setError("");
  };

  const handleUpdate = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!editFormData.name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!editFormData.email.trim()) {
      setError("Email is required.");
      return;
    }

    if (isAdmin && !editFormData.departmentId) {
      setError("User must be assigned to a department.");
      return;
    }

    try {
      setUpdating(true);

      const payload = {
        name: editFormData.name.trim(),
        email: editFormData.email.trim(),
        status: editFormData.status,
      };

      // Only Org Admin can alter department assignment
      if (isAdmin && editFormData.departmentId) {
        payload.departmentId = editFormData.departmentId;
      }

      const data = await updateUser(editingUser._id, payload);

      setUsers((currentUsers) =>
        currentUsers.map((u) =>
          u._id === editingUser._id ? data.user : u,
        ),
      );

      setEditingUser(null);

      setEditFormData({
        name: "",
        email: "",
        departmentId: "",
        status: "ACTIVE",
      });

      setSuccess(data.message || "User updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user");
    } finally {
      setUpdating(false);
    }
  };

  const formatRoleBadge = (role) => {
    switch (role) {
      case "ORGANIZATION_ADMIN":
        return <span className="badge badge-draft">Admin</span>;
      case "FINANCE_MANAGER":
        return <span className="badge badge-pending">Finance Mgr</span>;
      case "DEPARTMENT_MANAGER":
        return <span className="badge badge-active">Dept Mgr</span>;
      case "EMPLOYEE":
        return <span className="badge badge-draft">Employee</span>;
      default:
        return <span className="badge badge-draft">{role}</span>;
    }
  };

  if (loading) {
    return (
      <div className="loading-indicator">
        <span className="spinner"></span>
        <span>Loading user accounts...</span>
      </div>
    );
  }

  return (
    <div className="mgmt-page-layout">
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">
            {isDeptManager ? "Department Team Management" : "User Management"}
          </h1>
          <p className="page-subtitle">
            {isDeptManager
              ? "Provision employee accounts for your department and manage team member access"
              : "Provision organization members, assign roles, and allocate departmental affiliations"}
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
        {/* Form Panel: Create or Edit User */}
        <div>
          {editingUser ? (
            <div className="mgmt-form-card editing-mode">
              <div className="mgmt-form-header">
                <h2 className="mgmt-form-title">
                  {isDeptManager ? "Edit Employee" : "Edit User"}
                </h2>
                <span className="mgmt-editing-indicator">Editing Mode</span>
              </div>

              <form onSubmit={handleUpdate}>
                <div className="form-field">
                  <label htmlFor="edit-name">Full Name *</label>
                  <input
                    id="edit-name"
                    name="name"
                    type="text"
                    value={editFormData.name}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="edit-email">Email Address *</label>
                  <input
                    id="edit-email"
                    name="email"
                    type="email"
                    value={editFormData.email}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="edit-departmentId">Department *</label>
                  {isDeptManager ? (
                    <>
                      <input
                        id="edit-departmentId"
                        type="text"
                        value="Your Department (Fixed)"
                        disabled
                      />
                      <span style={{ fontSize: "0.8rem", color: "var(--color-steel)", marginTop: "0.25rem", display: "block" }}>
                        Department Managers cannot change an employee&apos;s department.
                      </span>
                    </>
                  ) : (
                    <select
                      id="edit-departmentId"
                      name="departmentId"
                      value={editFormData.departmentId}
                      onChange={handleEditChange}
                      required
                    >
                      <option value="">Select a department</option>
                      {departments.map((department) => (
                        <option key={department._id} value={department._id}>
                          {department.name}
                        </option>
                      ))}
                    </select>
                  )}
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
                <h2 className="mgmt-form-title">
                  {isDeptManager ? "Add Employee" : "Create User"}
                </h2>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-field">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Jane Doe"
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="jane@company.com"
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="password">Temporary Password *</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="role">Role *</label>
                  {isDeptManager ? (
                    <>
                      <input
                        id="role"
                        type="text"
                        value="Employee"
                        disabled
                      />
                      <span style={{ fontSize: "0.8rem", color: "var(--color-steel)", marginTop: "0.25rem", display: "block" }}>
                        Department Managers can create employee accounts only.
                      </span>
                    </>
                  ) : (
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                    >
                      <option value="EMPLOYEE">Employee</option>
                      <option value="DEPARTMENT_MANAGER">Department Manager</option>
                    </select>
                  )}
                </div>

                <div className="form-field">
                  <label htmlFor="departmentId">
                    Department {(!isDeptManager && formData.role === "EMPLOYEE") && "*"}
                  </label>
                  {isDeptManager ? (
                    <>
                      <input
                        id="departmentId"
                        type="text"
                        value="Your Department (Auto-assigned)"
                        disabled
                      />
                      <span style={{ fontSize: "0.8rem", color: "var(--color-steel)", marginTop: "0.25rem", display: "block" }}>
                        New employees are automatically assigned to your managed department.
                      </span>
                    </>
                  ) : (
                    <select
                      id="departmentId"
                      name="departmentId"
                      value={formData.departmentId}
                      onChange={handleChange}
                    >
                      <option value="">
                        {formData.role === "EMPLOYEE"
                          ? "Select target department"
                          : "No department assigned"}
                      </option>
                      {departments.map((department) => (
                        <option key={department._id} value={department._id}>
                          {department.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="form-actions" style={{ marginTop: "1rem" }}>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting
                      ? (isDeptManager ? "Adding..." : "Creating...")
                      : (isDeptManager ? "Add Employee" : "Create User")}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Existing Users Table Card */}
        <div className="mgmt-table-card">
          <div className="mgmt-table-header">
            <h2 className="mgmt-table-title">
              {isDeptManager ? "Department Employees" : "Organization Users"}
            </h2>
            <span className="badge badge-draft">{users.length} total</span>
          </div>

          {users.length === 0 ? (
            <div className="state-box" style={{ margin: "1.5rem" }}>
              <span className="state-box-title">No users registered</span>
              <span className="state-box-desc">
                {isDeptManager
                  ? "Use the form on the left to add employee accounts for your department."
                  : "Use the form on the left to add team members to your organization."}
              </span>
            </div>
          ) : (
            <div className="mgmt-table-responsive">
              <table className="mgmt-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th className="mgmt-actions-cell">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const department = departments.find(
                      (d) => d._id === u.departmentId,
                    );
                    const isSelected = editingUser?._id === u._id;

                    return (
                      <tr
                        key={u._id}
                        style={isSelected ? { backgroundColor: "#f0f7f5" } : undefined}
                      >
                        <td>
                          <div className="mgmt-user-cell">
                            <span className="mgmt-user-name">{u.name}</span>
                            <span className="mgmt-user-email">{u.email}</span>
                          </div>
                        </td>
                        <td>{formatRoleBadge(u.role)}</td>
                        <td>
                          {isDeptManager
                            ? "Your Department"
                            : (department ? department.name : "Not assigned")}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              u.status === "ACTIVE"
                                ? "badge-active"
                                : "badge-inactive"
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="mgmt-actions-cell">
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleEdit(u)}
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

export default UserManagement;
