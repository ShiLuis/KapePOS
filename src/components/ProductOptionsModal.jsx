import React, { useState, useEffect } from 'react';
import './ProductOptionsModal.css'; // We'll create this CSS file next

function ProductOptionsModal({ product, isOpen, onClose, onAddToCartWithOptions }) {
  const [selectedOptions, setSelectedOptions] = useState({});
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(product ? product.price : 0);
  const [itemNotes, setItemNotes] = useState(''); // New state for item notes

  useEffect(() => {
    if (product) {
      const initialOptions = {};
      if (product.options) {
        product.options.forEach(option => {
          if (option.values && option.values.length > 0) {
            initialOptions[option.name] = option.values[0].name; // Default to first option
          }
        });
      }
      setSelectedOptions(initialOptions);
      setSelectedAddons([]);
      setItemNotes(''); // Reset notes when product changes
    }
  }, [product]);

  useEffect(() => {
    if (!product) return;

    let price = product.price;
    // Add price from selected options
    if (product.options) {
      product.options.forEach(option => {
        const selectedValueName = selectedOptions[option.name];
        const value = option.values.find(v => v.name === selectedValueName);
        if (value && value.price_modifier) {
          price += value.price_modifier;
        }
      });
    }
    // Add price from selected addons
    if (product.addons) {
      selectedAddons.forEach(addonName => {
        const addon = product.addons.find(a => a.name === addonName);
        if (addon) {
          price += addon.price;
        }
      });
    }
    setCurrentPrice(price);
  }, [product, selectedOptions, selectedAddons]);

  if (!isOpen || !product) {
    return null;
  }

  const handleOptionChange = (optionName, valueName) => {
    setSelectedOptions(prev => ({ ...prev, [optionName]: valueName }));
  };

  const handleAddonChange = (addonName) => {
    setSelectedAddons(prev =>
      prev.includes(addonName)
        ? prev.filter(a => a !== addonName)
        : [...prev, addonName]
    );
  };

  const handleSubmit = () => {
    const itemWithOptions = {
      ...product,
      finalPrice: currentPrice,
      selectedOptions: { ...selectedOptions },
      selectedAddons: [...selectedAddons],
      itemNotes: itemNotes, // Add item notes
      // Create a unique ID for the cart item based on product ID and selections
      // This helps differentiate between, e.g., a small latte and a large latte in the cart
      cartItemId: `${product.id}-${JSON.stringify(selectedOptions)}-${JSON.stringify(selectedAddons)}-${itemNotes}` // Include notes in ID for uniqueness
    };
    onAddToCartWithOptions(itemWithOptions);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Customize {product.name}</h2>
        
        {product.options && product.options.map(option => (
          <div key={option.name} className="option-group">
            <h4>{option.name}</h4>
            <div className="option-buttons"> {/* Wrapper for button layout */}
              {option.values.map(value => (
                <button
                  key={value.name}
                  type="button" // Important for buttons not submitting forms
                  className={`option-button ${selectedOptions[option.name] === value.name ? 'active' : ''}`}
                  onClick={() => handleOptionChange(option.name, value.name)}
                >
                  {value.name} {value.price_modifier ? `(+₱${value.price_modifier.toFixed(2)})` : ''}
                </button>
              ))}
            </div>
          </div>
        ))}

        {product.addons && product.addons.length > 0 && (
          <div className="option-group">
            <h4>Add-ons</h4>
            {product.addons.map(addon => (
              <label key={addon.name} className="addon-label"> {/* Keep checkboxes for addons */}
                <input
                  type="checkbox"
                  checked={selectedAddons.includes(addon.name)}
                  onChange={() => handleAddonChange(addon.name)}
                />
                {addon.name} (+₱{addon.price.toFixed(2)})
              </label>
            ))}
          </div>
        )}

        <div className="option-group"> {/* Group for notes */}
          <h4>Notes (Optional)</h4>
          <textarea
            value={itemNotes}
            onChange={(e) => setItemNotes(e.target.value)}
            placeholder="e.g., extra hot, no sugar"
            rows="3"
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', borderColor: '#ccc' }}
          />
        </div>

        <div className="modal-footer">
          <h3>Price: ₱{currentPrice.toFixed(2)}</h3>
          <button onClick={handleSubmit}>Add to Cart</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default ProductOptionsModal;