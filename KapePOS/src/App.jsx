import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import POS from './pages/POS';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AccountManagement from './pages/AccountManagement';
import Sidebar from './components/Sidebar';
import SalesSummary from './pages/SalesSummary';
import StockManagement from './pages/StockManagement';
import products from './data/products.json'; // Example product data
import './App.css';
import OrderHistory from './pages/OrderHistory';
import MenuManagement from './pages/MenuManagement';

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
  };

  // Role-based route protection
  const ProtectedRoute = ({ element, allowedRoles }) => {
    if (!user) {
      return <Navigate to="/" replace />;
    }
    
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // Redirect cashiers to POS, admins to Dashboard
      return <Navigate to={user.role === 'admin' ? "/dashboard" : "/pos"} replace />;
    }
    
    return element;
  };

  return (
    <Router>
      <div className="App">
        {user ? (
          <div className="app-layout">
            <Sidebar user={user} />
            <div className="main-content">
              <Routes>
                {/* Redirect based on role */}
                <Route path="/" element={
                  <Navigate to={user.role === 'admin' ? "/dashboard" : "/pos"} replace />
                } />
                
                {/* Admin-only routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute 
                    element={<Dashboard products={products} />} 
                    allowedRoles={['admin']} 
                  />
                } />
                <Route path="/account-management" element={
                  <ProtectedRoute 
                    element={<AccountManagement />} 
                    allowedRoles={['admin']} 
                  />
                } />
                <Route path="/sales-summary" element={
                  <ProtectedRoute 
                    element={<SalesSummary />} 
                    allowedRoles={['admin']} 
                  />
                } />
                <Route path="/stock-management" element={
                  <ProtectedRoute 
                    element={<StockManagement />} 
                    allowedRoles={['admin']} 
                  />
                } />
                <Route path="/order-history" element={
                  <ProtectedRoute 
                    element={<OrderHistory />} 
                    allowedRoles={['admin']} 
                  />
                } />
                <Route path="/menu-management" element={
                  <ProtectedRoute 
                    element={<MenuManagement />} 
                    allowedRoles={['admin']} 
                  />
                } />
                
                {/* Shared routes */}
                <Route path="/pos" element={<POS user={user} />} />
              </Routes>
            </div>
          </div>
        ) : (
          <Login onLogin={handleLogin} />
        )}
      </div>
    </Router>
  );
}

export default App;