import React, { useState } from 'react';
import usersData from '../data/users.json';
import './AccountManagement.css';

function AccountManagement() {
  const [users, setUsers] = useState(usersData);

  const toggleAccountStatus = (id) => {
    const updatedUsers = users.map((user) =>
      user.id === id ? { ...user, isActive: !user.isActive } : user
    );
    setUsers(updatedUsers);
  };

  return (
    <div className="account-management">
      <h2>Account Management</h2>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.role}</td>
              <td>{user.isActive ? 'Active' : 'Disabled'}</td>
              <td>
                <button
                  onClick={() => toggleAccountStatus(user.id)}
                  className={user.isActive ? 'disable-btn' : 'enable-btn'}
                >
                  {user.isActive ? 'Disable' : 'Enable'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AccountManagement;