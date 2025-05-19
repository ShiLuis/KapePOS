import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard({ products }) {
  const navigate = useNavigate();
  const [orderStats, setOrderStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageSale: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Calculate stock stats from products
  const allItems = products.flatMap((category) => category.items);
  const totalStock = allItems.reduce((sum, item) => sum + (item.stock || 0), 0);
  const lowStockItems = allItems.filter((item) => item.stock <= 10);

  useEffect(() => {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Fetch today's sales summary for dashboard
    const fetchDailySummary = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/orders/summary/daily?date=${today}`);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        setOrderStats({
          totalRevenue: data.totalSales || 0,
          totalOrders: data.totalOrders || 0,
          averageSale: data.totalOrders > 0 ? data.totalSales / data.totalOrders : 0
        });
        
        setError(null);
      } catch (err) {
        setError('Failed to fetch sales data: ' + err.message);
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDailySummary();
  }, []);

  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="dashboard-overview">
        <div className="dashboard-card" onClick={() => navigate('/sales-summary')}>
          <h3>Today's Revenue</h3>
          <p>
            {loading ? 'Loading...' : `₱${orderStats.totalRevenue.toFixed(2)}`}
          </p>
        </div>
        <div className="dashboard-card" onClick={() => navigate('/order-history')}>
          <h3>Today's Orders</h3>
          <p>
            {loading ? 'Loading...' : orderStats.totalOrders}
          </p>
        </div>
        <div className="dashboard-card" onClick={() => navigate('/sales-summary')}>
          <h3>Average Sale</h3>
          <p>
            {loading ? 'Loading...' : `₱${orderStats.averageSale.toFixed(2)}`}
          </p>
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