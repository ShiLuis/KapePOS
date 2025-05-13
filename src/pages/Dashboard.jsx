import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import products from '../data/products.json';

function Dashboard({ orderHistory, stockData }) {
  const navigate = useNavigate();

  // Calculate stats
  const totalRevenue = orderHistory.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalOrders = orderHistory.length;
  const averageSale = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const allItems = products.flatMap((category) => category.items);
  const totalStock = allItems.reduce((sum, item) => sum + (item.stock || 0), 0);
  const lowStockItems = allItems.filter((item) => item.stock <= 10);

  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>
      <div className="dashboard-overview">
        <div className="dashboard-card" onClick={() => navigate('/sales-summary')}>
          <h3>Total Revenue</h3>
          <p>₱{totalRevenue.toFixed(2)}</p>
        </div>
        <div className="dashboard-card" onClick={() => navigate('/order-history')}>
          <h3>Total Orders</h3>
          <p>{totalOrders}</p>
        </div>
        <div className="dashboard-card" onClick={() => navigate('/sales-summary')}>
          <h3>Average Sale</h3>
          <p>₱{averageSale.toFixed(2)}</p>
        </div>
        <div className="dashboard-card" onClick={() => navigate('/stock-management')}>
          <h3>Total Stock</h3>
          <p>{totalStock} items</p>
        </div>
        <div className="dashboard-card" onClick={() => navigate('/stock-management')}>
          <h3>Low Stock Items</h3>
          <p>{lowStockItems.length} items</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;