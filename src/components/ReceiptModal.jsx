import React from 'react';
import './ReceiptModal.css'; // We'll create this CSS file

function ReceiptModal({ isOpen, onClose, order }) {
  if (!isOpen || !order) {
    return null;
  }

  const taxRate = 0.08; // Assuming the same tax rate for display consistency
  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxAmount = subtotal * taxRate;
  // Note: order.totalAmount is the final amount paid.
  // If discounts were applied, subtotal + taxAmount might not exactly equal order.totalAmount.
  // For this receipt, we'll display the recorded totalAmount.

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
          {order.items.map(item => (
            <li key={item.cartItemId || item.id}>
              <div>
                <span>{item.name} {formatOptions(item)} (x{item.quantity})</span>
                {displayItemNotesInReceipt(item)} {/* Display item notes */}
              </div>
              <span>₱{(item.price * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>

        <div className="receipt-summary">
          <p>Subtotal: <span>₱{subtotal.toFixed(2)}</span></p>
          <p>Tax ({(taxRate * 100).toFixed(0)}%): <span>₱{taxAmount.toFixed(2)}</span></p>
          {/* If you implement discounts, you would show them here */}
          <p><strong>Total Paid:</strong> <span>₱{order.totalAmount.toFixed(2)}</span></p>
          <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
        </div>

        <button onClick={onClose} className="close-receipt-btn">Close</button>
      </div>
    </div>
  );
}

export default ReceiptModal;