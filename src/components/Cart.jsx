import React, { useState } from 'react';
import '../pages/POS.css';

const TAX_RATE = 0.08;

function Cart({ cartItems, onRemoveItem, onUpdateQuantity, onProceedToPayment }) {
  const [totalDiscount, setTotalDiscount] = useState({ type: 'fixed', value: 0 });

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="cart-section">
        <h2>Cart</h2>
        <p>Your cart is empty.</p>
      </div>
    );
  }

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

  const displayItemNotes = (item) => {
    return item.itemNotes ? (
      <div className="item-notes">
        <em>Note: {item.itemNotes}</em>
      </div>
    ) : null;
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const calculateDiscount = (subtotal) => {
    if (totalDiscount.type === 'fixed') {
      return Math.min(totalDiscount.value, subtotal);
    } else if (totalDiscount.type === 'percentage') {
      return (totalDiscount.value / 100) * subtotal;
    }
    return 0;
  };

  const subtotal = calculateSubtotal();
  const discount = calculateDiscount(subtotal);
  const taxAmount = (subtotal - discount) * TAX_RATE;
  const total = subtotal - discount + taxAmount;

  const handleDiscountChange = (type, value) => {
    setTotalDiscount({ type, value: parseFloat(value) || 0 });
  };

  return (
    <div className="cart-section">
      <h2>Cart</h2>
      <ul className="cart-items">
        {cartItems.map((item) => (
          <li key={item.cartItemId} className="cart-item">
            <div className="item-info">
              <span className="item-name">
                {item.name} {formatOptions(item)}
              </span>
              {displayItemNotes(item)}
            </div>
            <div className="item-price-quantity">
              <span className="item-price">₱{(item.price * item.quantity).toFixed(2)}</span>
              <div className="item-actions">
                <button onClick={() => onUpdateQuantity(item.cartItemId, item.quantity - 1)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}>+</button>
                <button onClick={() => onRemoveItem(item.cartItemId)} className="remove-btn">
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="cart-summary">
        <p className="summary-row">
          Subtotal: <span>₱{subtotal.toFixed(2)}</span>
        </p>
        <div className="discount-section">
          <label className="discount-label">Apply Discount:</label>
          <div className="discount-input-group">
            <input
              type="number"
              className="discount-input"
              placeholder="Enter amount or %"
              onChange={(e) => handleDiscountChange(totalDiscount.type, e.target.value)}
            />
            <select
              className="discount-select"
              value={totalDiscount.type}
              onChange={(e) => handleDiscountChange(e.target.value, totalDiscount.value)}
            >
              <option value="fixed">₱</option>
              <option value="percentage">%</option>
            </select>
          </div>
        </div>
        <p className="summary-row">
          Discount: <span>-₱{discount.toFixed(2)}</span>
        </p>
        <p className="summary-row">
          Tax ({(TAX_RATE * 100).toFixed(0)}%): <span>₱{taxAmount.toFixed(2)}</span>
        </p>
        <h3 className="total-row">
          Total: <span>₱{total.toFixed(2)}</span>
        </h3>
      </div>
      <button onClick={() => onProceedToPayment(total)} className="proceed-to-payment-btn">
        Proceed to Payment
      </button>
    </div>
  );
}

export default Cart;