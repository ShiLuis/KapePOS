import React from 'react';

const TAX_RATE = 0.08; 

function Cart({ cartItems, onRemoveItem, onUpdateQuantity, onProceedToPayment }) { // Add onProceedToPayment prop
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
        .map(([key, value]) => `${value}`) // Just show selected value, key (like "Size") is implicit
        .join(', ');
    }
    if (item.selectedAddons && item.selectedAddons.length > 0) {
      optionsString += (optionsString ? ", " : "") + item.selectedAddons.join(', ');
    }
    return optionsString ? `(${optionsString})` : "";
  };

  const displayItemNotes = (item) => {
    return item.itemNotes ? <div style={{ fontSize: '0.85em', color: '#555' }}><em>Note: {item.itemNotes}</em></div> : null;
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      // item.price should now be the finalPrice including options/addons
      return sum + item.price * item.quantity;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const taxAmount = subtotal * TAX_RATE;
  const total = subtotal + taxAmount;

  return (
    <div className="cart-section">
      <h2>Cart</h2>
      <ul>
        {cartItems.map(item => (
          // Use item.cartItemId as key, as it's unique for product + options combo
          <li key={item.cartItemId} className="cart-item"> 
            <div className="item-info">
              <span>{item.name} {formatOptions(item)}</span>
              {displayItemNotes(item)} {/* Display item notes here */}
            </div>
            <div className="item-price-quantity"> {/* Wrapper for price and actions */}
              <span>₱{(item.price * item.quantity).toFixed(2)}</span>
              <div className="item-actions">
                <button onClick={() => onUpdateQuantity(item.cartItemId, item.quantity - 1)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}>+</button>
                <button onClick={() => onRemoveItem(item.cartItemId)} className="remove-btn">Remove</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="cart-summary">
        <p>Subtotal: <span>₱{subtotal.toFixed(2)}</span></p>
        <p>Tax ({(TAX_RATE * 100).toFixed(0)}%): <span>₱{taxAmount.toFixed(2)}</span></p>
        <h3>Total: <span>₱{total.toFixed(2)}</span></h3>
      </div>
      {cartItems.length > 0 && (
        <button 
          onClick={() => onProceedToPayment(total)} 
          className="proceed-to-payment-btn"
        >
          Proceed to Payment
        </button>
      )}
    </div>
  );
}

export default Cart;