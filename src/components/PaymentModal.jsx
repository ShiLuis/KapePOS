import React, { useState } from 'react';
import './PaymentModal.css';

function PaymentModal({ isOpen, onClose, onProcessPayment, totalAmount }) {
  const [discount, setDiscount] = useState({ type: 'fixed', value: 0 });

  if (!isOpen) {
    return null;
  }

  const calculateDiscountedTotal = () => {
    const discountValue =
      discount.type === 'fixed'
        ? discount.value
        : (discount.value / 100) * totalAmount;
    return Math.max(totalAmount - discountValue, 0); // Ensure total doesn't go below 0
  };

  const discountedTotal = calculateDiscountedTotal();

  return (
    <div className="modal-overlay">
      <div className="modal-content payment-modal-content">
        <h2>Process Payment</h2>
        <h3>Total Due: ₱{discountedTotal.toFixed(2)}</h3>
        <div className="payment-options">
          <button onClick={() => onProcessPayment('Cash', discountedTotal)}>
            Pay with Cash
          </button>
          <button onClick={() => onProcessPayment('Card', discountedTotal)}>
            Pay with Card
          </button>
        </div>
        <button onClick={onClose} className="cancel-payment-btn">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default PaymentModal;