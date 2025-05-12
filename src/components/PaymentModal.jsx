import React from 'react';
import './PaymentModal.css'; // We'll create this CSS file

function PaymentModal({ isOpen, onClose, onProcessPayment, totalAmount }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content payment-modal-content">
        <h2>Process Payment</h2>
        <h3>Total Due: ₱{totalAmount.toFixed(2)}</h3>
        <div className="payment-options">
          <button onClick={() => onProcessPayment('Cash', totalAmount)}>Pay with Cash</button>
          <button onClick={() => onProcessPayment('Card', totalAmount)}>Pay with Card</button>
        </div>
        <button onClick={onClose} className="cancel-payment-btn">Cancel</button>
      </div>
    </div>
  );
}

export default PaymentModal;