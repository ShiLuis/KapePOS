import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Cart from '../components/Cart';
import ProductOptionsModal from '../components/ProductOptionsModal';
import PaymentModal from '../components/PaymentModal';
import ReceiptModal from '../components/ReceiptModal';
import productsData from '../data/products.json';
import './POS.css';

function POS({ user }) {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [selectedProductForOptions, setSelectedProductForOptions] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [currentOrderAmount, setCurrentOrderAmount] = useState(0);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setProducts(productsData);
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const handleOpenOptionsModal = (product) => {
    setSelectedProductForOptions(product);
    setIsOptionsModalOpen(true);
  };

  const handleCloseOptionsModal = () => {
    setIsOptionsModalOpen(false);
    setSelectedProductForOptions(null);
  };

  const handleAddToCartWithOptions = (productWithOptions) => {
    setCartItems((prevItems) => {
      const itemExists = prevItems.find((item) => item.cartItemId === productWithOptions.cartItemId);
      if (itemExists) {
        return prevItems.map((item) =>
          item.cartItemId === productWithOptions.cartItemId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { ...productWithOptions, price: productWithOptions.finalPrice, quantity: 1 }];
    });
    handleCloseOptionsModal();
  };

  const handleProductSelect = (product) => {
    if ((product.options && product.options.length > 0) || (product.addons && product.addons.length > 0)) {
      handleOpenOptionsModal(product);
    } else {
      const cartItem = {
        ...product,
        finalPrice: product.price,
        selectedOptions: {},
        selectedAddons: [],
        cartItemId: `${product.id}-default`,
        quantity: 1,
      };
      setCartItems((prevItems) => {
        const itemExists = prevItems.find((item) => item.cartItemId === cartItem.cartItemId);
        if (itemExists) {
          return prevItems.map((item) =>
            item.cartItemId === cartItem.cartItemId ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return [...prevItems, cartItem];
      });
    }
  };

  const handleRemoveFromCart = (cartItemId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.cartItemId !== cartItemId));
  };

  const handleUpdateQuantity = (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(cartItemId);
    } else {
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const handleProceedToPayment = (totalAmount) => {
    setCurrentOrderAmount(totalAmount);
    setIsPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
  };

  const handleProcessPayment = (paymentMethod, amountPaid) => {
    console.log(`Payment processed via ${paymentMethod} for ₱${amountPaid.toFixed(2)}`);
    const newOrder = {
      id: `order-${Date.now()}`,
      items: [...cartItems],
      totalAmount: amountPaid,
      paymentMethod: paymentMethod,
      date: new Date().toISOString(),
    };
    setCartItems([]);
    setIsPaymentModalOpen(false);
    setCurrentReceipt(newOrder);
    setIsReceiptModalOpen(true);
  };

  const handleCloseReceiptModal = () => {
    setIsReceiptModalOpen(false);
    setCurrentReceipt(null);
  };

  return (
    <div className="pos-system">
      <div className="main-controls">
        <h3>Welcome, {user.username}!</h3>
      </div>
      <div className="main-content-area">
        <div className="product-list">
          {products.map((category) => (
            <div key={category.category} className="category-section">
              <h2>{category.category}</h2>
              <div className="items-grid">
                {category.items.map((item) => (
                  <ProductCard key={item.id} product={item} onProductSelect={handleProductSelect} />
                ))}
              </div>
            </div>
          ))}
        </div>
        <Cart
          cartItems={cartItems}
          onRemoveItem={handleRemoveFromCart}
          onUpdateQuantity={handleUpdateQuantity}
          onProceedToPayment={handleProceedToPayment}
        />
      </div>
      {selectedProductForOptions && (
        <ProductOptionsModal
          product={selectedProductForOptions}
          isOpen={isOptionsModalOpen}
          onClose={handleCloseOptionsModal}
          onAddToCartWithOptions={handleAddToCartWithOptions}
        />
      )}
      {isPaymentModalOpen && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={handleClosePaymentModal}
          onProcessPayment={handleProcessPayment}
          totalAmount={currentOrderAmount}
        />
      )}
      {currentReceipt && (
        <ReceiptModal isOpen={isReceiptModalOpen} onClose={handleCloseReceiptModal} order={currentReceipt} />
      )}
    </div>
  );
}

export default POS;