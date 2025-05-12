import React from 'react';
import './OrderHistoryModal.css'; // We'll create this CSS file

function OrderHistoryModal({ isOpen, onClose, orderHistory }) {
  if (!isOpen) {
    return null;
  }

  const formatOptions = (item) => {
    let optionsString = "";
    if (item.selectedOptions) {
      optionsString = Object.entries(item.selectedOptions)
        .map(([key, value]) => value)
        .join(', ');
    }
    if (item.selectedAddons && item.selectedAddons.length > 0) {
      optionsString += (optionsString ? ", " : "") + item.selectedAddons.join(', ');
    }
    return optionsString ? `(${optionsString})` : "";
  };

  const displayItemNotesInHistory = (item) => {
    return item.itemNotes ? <span style={{ fontSize: '0.9em', color: '#555' }}> <em>(Note: {item.itemNotes})</em></span> : null;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content history-modal-content">
        <h2>Order History</h2>
        {orderHistory && orderHistory.length > 0 ? (
          <ul className="history-list">
            {orderHistory.slice().reverse().map(order => ( // Show newest first
              <li key={order.id} className="history-order-item">
                <p><strong>Order ID:</strong> {order.id}</p>
                <p><strong>Date:</strong> {new Date(order.date).toLocaleString()}</p>
                <p><strong>Total:</strong> ₱{order.totalAmount.toFixed(2)} ({order.paymentMethod})</p>
                <details>
                  <summary>View Items ({order.items.length})</summary>
                  <ul className="history-order-items-list">
                    {order.items.map(item => (
                      <li key={item.cartItemId || item.id}>
                        {item.name} {formatOptions(item)} (x{item.quantity}) - ₱{ (item.price * item.quantity).toFixed(2)}
                        {displayItemNotesInHistory(item)} {/* Display item notes */}
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
            ))}
          </ul>
        ) : (
          <p>No past orders found.</p>
        )}
        <button onClick={onClose} className="close-history-btn">Close</button>
      </div>
    </div>
  );
}

export default OrderHistoryModal;