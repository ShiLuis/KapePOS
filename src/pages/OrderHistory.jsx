import React from 'react';

function OrderHistory({ orderHistory }) {
  return (
    <div className="order-history">
      <h1>Order History</h1>
      {orderHistory && orderHistory.length > 0 ? (
        <ul className="order-list">
          {orderHistory.slice().reverse().map((order) => (
            <li key={order.id} className="order-item">
              <p><strong>Order ID:</strong> {order.id}</p>
              <p><strong>Date:</strong> {new Date(order.date).toLocaleString()}</p>
              <p><strong>Total:</strong> ₱{order.totalAmount.toFixed(2)} ({order.paymentMethod})</p>
              <details>
                <summary>View Items</summary>
                <ul>
                  {order.items.map((item) => (
                    <li key={item.cartItemId || item.id}>
                      {item.name} (x{item.quantity}) - ₱{(item.price * item.quantity).toFixed(2)}
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          ))}
        </ul>
      ) : (
        <p>No orders found.</p>
      )}
    </div>
  );
}

export default OrderHistory;