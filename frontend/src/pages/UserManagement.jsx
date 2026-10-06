import { useEffect, useState } from "react";
import { getUsers, createUser, updateUser } from "../services/userService";
import { getDepartments } from "../services/departmentService";

function UserManagement() {
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

        const [userData, departmentData] = await Promise.all([
          getUsers(),
          getDepartments(),
        ]);

        setUsers(userData.users);
        setDepartments(departmentData.departments);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Failed to load user management data",
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

    if (formData.role === "EMPLOYEE" && !formData.departmentId) {
      setError("Employee must be assigned to a department.");
      return;
    }

    try {
      setSubmitting(true);

      const data = await createUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        ...(formData.departmentId && {
          departmentId: formData.departmentId,
        }),
      });

      setUsers((currentUsers) => [...currentUsers, data.user]);

      setFormData({
        name: "",
        email: "",
        password: "",
        role: "EMPLOYEE",
        departmentId: "",
      });

      setSuccess(data.message);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (user) => {
    setError("");
    setSuccess("");

    setEditingUser(user);

    setEditFormData({
      name: user.name,
      email: user.email,
      departmentId: user.departmentId || "",
      status: user.status,
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

    if (!editFormData.departmentId) {
      setError("User must be assigned to a department.");
      return;
    }

    try {
      setUpdating(true);

      const data = await updateUser(editingUser._id, {
        name: editFormData.name.trim(),
        email: editFormData.email.trim(),
        departmentId: editFormData.departmentId,
        status: editFormData.status,
      });

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user._id === editingUser._id ? data.user : user,
        ),
      );

      setEditingUser(null);

      setEditFormData({
        name: "",
        email: "",
        departmentId: "",
        status: "ACTIVE",
      });

      setSuccess(data.message);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update user");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <main>
        <h1>User Management</h1>
        <p>Loading users...</p>
      </main>
    );
  }

  return (
    <main>
      <h1>User Management</h1>

      <section>
        <h2>Create User</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="name">Name</label>

            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter name"
            />
          </div>

          <div className="form-field">
            <label htmlFor="email">Email</label>

            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>

            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
            />
          </div>

          <div className="form-field">
            <label htmlFor="role">Role</label>

            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="EMPLOYEE">Employee</option>

              <option value="DEPARTMENT_MANAGER">Department Manager</option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="departmentId">
              Department
              {formData.role === "EMPLOYEE" && " *"}
            </label>

            <select
              id="departmentId"
              name="departmentId"
              value={formData.departmentId}
              onChange={handleChange}
            >
              <option value="">
                {formData.role === "EMPLOYEE"
                  ? "Select a department"
                  : "No department assigned"}
              </option>

              {departments.map((department) => (
                <option key={department._id} value={department._id}>
                  {department.name}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create User"}
          </button>
        </form>
      </section>

      {error && <p>{error}</p>}
      {success && <p>{success}</p>}

      {editingUser && (
        <section>
          <h2>Edit User: {editingUser.name}</h2>

          <form onSubmit={handleUpdate}>
            <div className="form-field">
              <label htmlFor="edit-name">Name</label>

              <input
                id="edit-name"
                name="name"
                type="text"
                value={editFormData.name}
                onChange={handleEditChange}
              />
            </div>

            <div className="form-field">
              <label htmlFor="edit-email">Email</label>

              <input
                id="edit-email"
                name="email"
                type="email"
                value={editFormData.email}
                onChange={handleEditChange}
              />
            </div>

            <div className="form-field">
              <label htmlFor="edit-departmentId">Department</label>

              <select
                id="edit-departmentId"
                name="departmentId"
                value={editFormData.departmentId}
                onChange={handleEditChange}
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
        <h2>Users</h2>

        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <div>
            {users.map((user) => (
              <article key={user._id}>
                <h3>{user.name}</h3>

                <p>Email: {user.email}</p>

                <p>Role: {user.role}</p>

                <p>Status: {user.status}</p>

                <p>
                  Department:{" "}
                  {departments.find(
                    (department) => department._id === user.departmentId,
                  )?.name || "Not assigned"}
                </p>

                <button
                  type="button"
                  onClick={() => handleEdit(user)}
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

export default UserManagement;
