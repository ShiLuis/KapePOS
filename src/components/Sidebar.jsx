import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

function Sidebar({ user }) {
  return (
    <div className="sidebar">
      <h2>KapePOS</h2>
      <nav>
        <ul>
          {user.role === 'admin' && (
            <li>
              <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
                Dashboard
              </NavLink>
            </li>
          )}
          <li>
            <NavLink to="/pos" className={({ isActive }) => (isActive ? 'active' : '')}>
              POS
            </NavLink>
          </li>
          {user.role === 'admin' && (
            <>
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
                  to="/daily-sales-summary"
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
            </>
          )}
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;