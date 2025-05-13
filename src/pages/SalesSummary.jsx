import React from 'react';
import './SalesSummary.css';

function SalesSummary({ orderHistory }) {
  const today = new Date().toISOString().split('T')[0];
  const todayOrders = orderHistory.filter((order) => order.date.startsWith(today));
  const totalRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <div className="sales-summary">
      <h1>Sales Summary</h1>
      <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
      <p><strong>Total Revenue:</strong> ₱{totalRevenue.toFixed(2)}</p>
      <p><strong>Total Orders:</strong> {todayOrders.length}</p>
      <ul>
        {todayOrders.map((order) => (
          <li key={order.id}>
            Order #{order.id} - ₱{order.totalAmount.toFixed(2)} ({order.paymentMethod})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SalesSummary;