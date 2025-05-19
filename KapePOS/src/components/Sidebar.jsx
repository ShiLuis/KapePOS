import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

function Sidebar({ user }) {
  const isAdmin = user.role === 'admin';

  return (
    <div className="sidebar">
      <h2>KapePOS</h2>
      <div className="user-info">
        <p>{user.username} ({user.role})</p>
      </div>
      <nav>
        <ul>
          {/* POS is available to everyone */}
          <li>
            <NavLink to="/pos" className={({ isActive }) => (isActive ? 'active' : '')}>
              Point of Sale
            </NavLink>
          </li>
          
          {/* Admin-only menu items */}
          {isAdmin && (
            <>
              <li>
                <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink to="/menu-management" className={({ isActive }) => (isActive ? 'active' : '')}>
                  Manage Menu
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/account-management"
                  className={({ isActive }) => (isActive ? 'active' : '')}
                >
                  Account Management
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/sales-summary"
                  className={({ isActive }) => (isActive ? 'active' : '')}
                >
                  Daily Sales Summary
                </NavLink>
              </li>
              <li>
                <NavLink to="/order-history" className={({ isActive }) => (isActive ? 'active' : '')}>
                  Order History
                </NavLink>
              </li>
              <li>
                <NavLink to="/stock-management" className={({ isActive }) => (isActive ? 'active' : '')}>
                  Stock Management
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>
      
      {/* Add logout functionality */}
      <div className="sidebar-footer">
        <button 
          className="logout-btn" 
          onClick={() => window.location.reload()}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;