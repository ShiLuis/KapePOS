import React, { useState, useEffect } from 'react';
import './SalesSummary.css';

function SalesSummary() {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Calculate tomorrow's date for the max attribute
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  useEffect(() => {
    fetchDailySummary();
  }, [selectedDate]);

  const fetchDailySummary = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/orders/summary/daily?date=${selectedDate}`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setSummaryData(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch sales summary: ' + err.message);
      console.error('Error fetching summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₱${parseFloat(amount).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="sales-summary">
        <h1>Daily Sales Summary</h1>
        <div className="loading-indicator">Loading sales data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sales-summary">
        <h1>Daily Sales Summary</h1>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="sales-summary">
      <h1>Daily Sales Summary</h1>
      
      <div className="date-selector">
        <label htmlFor="summary-date">Select Date:</label>
        <input 
          type="date" 
          id="summary-date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          max={tomorrowStr} // Allow selecting today by setting max to tomorrow
        />
      </div>
      
      {summaryData && (
        <div className="summary-content">
          <div className="summary-cards">
            <div className="summary-card">
              <h3>Total Sales</h3>
              <p>{formatCurrency(summaryData.totalSales)}</p>
            </div>
            <div className="summary-card">
              <h3>Total Orders</h3>
              <p>{summaryData.totalOrders}</p>
            </div>
            <div className="summary-card">
              <h3>Avg. Order Value</h3>
              <p>
                {summaryData.totalOrders > 0 
                  ? formatCurrency(summaryData.totalSales / summaryData.totalOrders) 
                  : formatCurrency(0)}
              </p>
            </div>
          </div>
          
          <div className="summary-section">
            <h2>Payment Methods</h2>
            <div className="payment-methods">
              {Object.entries(summaryData.paymentMethodCounts || {}).map(([method, count]) => (
                <div key={method} className="payment-method-item">
                  <span>{method}</span>
                  <span>{count} orders</span>
                </div>
              ))}
              {Object.keys(summaryData.paymentMethodCounts || {}).length === 0 && (
                <p>No payment data available</p>
              )}
            </div>
          </div>
          
          <div className="summary-section">
            <h2>Popular Items</h2>
            {summaryData.popularItems && summaryData.popularItems.length > 0 ? (
              <ul className="popular-items">
                {summaryData.popularItems.map((item, index) => (
                  <li key={index} className="popular-item">
                    <span className="item-rank">{index + 1}</span>
                    <span className="item-name">{item.name}</span>
                    <span className="item-count">{item.count} sold</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No item data available</p>
            )}
          </div>
          
          {summaryData.orders && summaryData.orders.length > 0 ? (
            <div className="summary-section">
              <h2>Orders ({summaryData.orders.length})</h2>
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Time</th>
                    <th>Items</th>
                    <th>Payment</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryData.orders.map((order) => (
                    <tr key={order._id}>
                      <td>{order.orderNumber}</td>
                      <td>{new Date(order.date).toLocaleTimeString()}</td>
                      <td>{order.items.length}</td>
                      <td>{order.paymentMethod}</td>
                      <td>{formatCurrency(order.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="summary-section">
              <h2>Orders</h2>
              <p>No orders for this date</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SalesSummary;