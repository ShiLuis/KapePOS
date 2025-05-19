import React from 'react';
import './ReceiptModal.css';

function ReceiptModal({ isOpen, onClose, order }) {
  if (!isOpen || !order) {
    return null;
  }

  // Calculate subtotal and tax if not present in the order
  const subtotal = order.subtotal || order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxRate = 0.12; // 12% tax rate
  const taxAmount = order.tax || (subtotal * taxRate);
  const totalAmount = order.totalAmount || (subtotal + taxAmount);

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

  const displayItemNotesInReceipt = (item) => {
    return item.itemNotes ? <div style={{ fontSize: '0.8em', color: '#444', paddingLeft: '10px' }}><em>↳ Note: {item.itemNotes}</em></div> : null;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content receipt-modal-content">
        <h2>Order Receipt</h2>
        <p><strong>Order ID:</strong> {order.id}</p>
        <p><strong>Date:</strong> {new Date(order.date).toLocaleString()}</p>
        
        <h4>Items:</h4>
        <ul className="receipt-items-list">
          {order.items.map((item, index) => (
            <li key={item.cartItemId || item.id || index}>
              <div>
                <span>{item.name} {formatOptions(item)} (x{item.quantity})</span>
                {displayItemNotesInReceipt(item)}
              </div>
              <span>₱{(item.price * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>

        <div className="receipt-summary">
          <div className="receipt-row">
            <span>Subtotal:</span>
            <span>₱{subtotal.toFixed(2)}</span>
          </div>
          <div className="receipt-row">
            <span>Tax (12%):</span>
            <span>₱{taxAmount.toFixed(2)}</span>
          </div>
          <div className="receipt-row total">
            <span>Total:</span>
            <span>₱{totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <button onClick={onClose} className="close-receipt-btn">Close</button>
      </div>
    </div>
  );
}

export default ReceiptModal;