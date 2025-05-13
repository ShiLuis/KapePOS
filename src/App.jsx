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

function App() {
  const [user, setUser] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]); // Pass this to pages
  const [stockData, setStockData] = useState([]); // Example stock data

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
  };

  return (
    <Router>
      <div className="App">
        {user ? (
          <div className="app-layout">
            <Sidebar user={user} />
            <div className="main-content">
              <Routes>
                {/* Redirect admins to Dashboard */}
                {user.role === 'admin' && <Route path="/" element={<Navigate to="/dashboard" />} />}
                <Route path="/dashboard" element={<Dashboard orderHistory={orderHistory} products={products} />} />
                <Route path="/sales-summary" element={<SalesSummary orderHistory={orderHistory} />} />
                <Route path="/stock-management" element={<StockManagement products={products} />} />
                <Route path="/pos" element={<POS user={user} />} />
                <Route path="/order-history" element={<OrderHistory orderHistory={orderHistory} />} />
                {user.role === 'admin' && (
                  <Route path="/account-management" element={<AccountManagement />} />
                )}
                {/* Add more routes as needed */}
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