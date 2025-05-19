import React, { useState, useEffect } from 'react';
import './OrderHistory.css';

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/orders');
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setOrders(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch orders: ' + err.message);
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatOptions = (item) => {
    let optionsString = "";
    if (item.selectedOptions) {
      optionsString = Object.entries(item.selectedOptions)
        .map(([key, value]) => `${value}`)
        .join(', ');
    }
    if (item.selectedAddons && item.selectedAddons.length > 0) {
      optionsString += (optionsString ? ", " : "") + item.selectedAddons.join(', ');
    }
    return optionsString ? `(${optionsString})` : "";
  };

  return (
    <div className="order-history">
      <h1>Order History</h1>
      
      {loading ? (
        <div className="loading-indicator">Loading orders...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="orders-container">
          <div className="orders-summary">
            <p><strong>Total Orders:</strong> {orders.length}</p>
            <p><strong>Total Revenue:</strong> ₱{orders.reduce((sum, order) => sum + order.totalAmount, 0).toFixed(2)}</p>
          </div>
          <ul className="order-list">
            {orders.map((order) => (
              <li key={order._id} className="order-item">
                <div className="order-header">
                  <h3>Order #{order.orderNumber}</h3>
                  <p className="order-date">{new Date(order.date).toLocaleString()}</p>
                </div>
                <div className="order-info">
                  <p><strong>Cashier:</strong> {order.createdBy}</p>
                  <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
                </div>
                <details>
                  <summary>View Items ({order.items.length})</summary>
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Price</th>
                        <th>Qty</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, index) => (
                        <tr key={index}>
                          <td>
                            {item.name} {formatOptions(item)}
                            {item.itemNotes && <div className="item-note">Note: {item.itemNotes}</div>}
                          </td>
                          <td>₱{item.price.toFixed(2)}</td>
                          <td>{item.quantity}</td>
                          <td>₱{(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr className="summary-row subtotal-row">
                        <td colSpan="3" className="text-right"><strong>Subtotal:</strong></td>
                        <td>₱{order.subtotal ? order.subtotal.toFixed(2) : order.totalAmount.toFixed(2)}</td>
                      </tr>
                      <tr className="summary-row">
                        <td colSpan="3" className="text-right"><strong>Tax (12%):</strong></td>
                        <td>₱{order.tax ? order.tax.toFixed(2) : (order.totalAmount * 0.12).toFixed(2)}</td>
                      </tr>
                      <tr className="summary-row total-row">
                        <td colSpan="3" className="text-right"><strong>Total:</strong></td>
                        <td>₱{order.totalAmount.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </details>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default OrderHistory;