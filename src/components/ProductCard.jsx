import React from 'react';

function ProductCard({ product, onProductSelect }) { // Changed prop name
  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>₱{product.price.toFixed(2)}</p>
      <button onClick={() => onProductSelect(product)}> {/* Call onProductSelect */}
        { (product.options && product.options.length > 0) || (product.addons && product.addons.length > 0)
          ? "Customize"
          : "Add to Cart" }
      </button>
    </div>
  );
}

export default ProductCard;