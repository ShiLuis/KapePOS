import React, { useState, useEffect } from 'react';
import './AccountManagement.css';

function AccountManagement() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState(null);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'cashier',
    active: true,
  });

  const API_URL = 'http://localhost:5000/api/users';

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Filter users when search query changes
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filtered = users.filter(user => 
        user.username.toLowerCase().includes(lowerCaseQuery) ||
        user.role.toLowerCase().includes(lowerCaseQuery)
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setUsers(data);
      setFilteredUsers(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch users: ' + err.message);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (user) => {
    try {
      const response = await fetch(`${API_URL}/${user._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: !user.active }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const updatedUser = await response.json();
      
      // Update the user in the state
      setUsers(prevUsers => 
        prevUsers.map(u => u._id === updatedUser._id ? updatedUser : u)
      );
      
    } catch (err) {
      setError('Failed to update user status: ' + err.message);
      console.error('Error updating user:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const openModal = (user = null) => {
    if (user) {
      // Editing an existing user
      setFormData({
        username: user.username,
        password: '', // Don't populate password for security
        role: user.role,
        active: user.active,
        userId: user._id, // Store the ID for editing
      });
      setIsEditing(true);
    } else {
      // Creating a new user
      setFormData({
        username: '',
        password: '',
        role: 'cashier',
        active: true,
      });
      setIsEditing(false);
    }
    setModalIsOpen(true);
    setFormError(null);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setFormError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.username.trim()) {
      setFormError("Username is required");
      return;
    }
    
    if (!isEditing && !formData.password) {
      setFormError("Password is required for new users");
      return;
    }
    
    try {
      let response;
      
      if (isEditing) {
        // Update existing user
        const updateData = {
          username: formData.username,
          role: formData.role,
          active: formData.active
        };
        
        // Only include password if it was changed
        if (formData.password) {
          updateData.password = formData.password;
        }
        
        response = await fetch(`${API_URL}/${formData.userId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });
      } else {
        // Create new user
        response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}`);
      }
      
      // Fetch updated user list
      await fetchUsers();
      
      // Close the modal
      closeModal();
      
    } catch (err) {
      setFormError(err.message);
      console.error('Error submitting user form:', err);
    }
  };

  return (
    <div className="account-management">
      <h1>Account Management</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="actions-bar">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <button onClick={() => openModal()} className="add-user-btn">
          Add New User
        </button>
      </div>
      
      {loading ? (
        <div className="loading-indicator">Loading users...</div>
      ) : filteredUsers.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table className="users-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id} className={!user.active ? 'inactive-user' : ''}>
                <td>{user.username}</td>
                <td>
                  <span className={`role-badge ${user.role}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${user.active ? 'active' : 'inactive'}`}>
                    {user.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="actions-cell">
                  <button
                    onClick={() => openModal(user)}
                    className="btn-edit"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleActive(user)}
                    className={`btn-toggle ${user.active ? 'btn-disable' : 'btn-enable'}`}
                  >
                    {user.active ? 'Disable' : 'Enable'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      {/* User Form Modal */}
      {modalIsOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{isEditing ? 'Edit User' : 'Add New User'}</h2>
            
            {formError && <div className="form-error">{formError}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">
                  {isEditing ? 'Password (Leave blank to keep unchanged)' : 'Password'}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!isEditing}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                >
                  <option value="cashier">Cashier</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              {isEditing && (
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="active"
                      checked={formData.active}
                      onChange={handleInputChange}
                    />
                    <span>Account Active</span>
                  </label>
                </div>
              )}
              
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {isEditing ? 'Update User' : 'Create User'}
                </button>
                <button type="button" onClick={closeModal} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AccountManagement;