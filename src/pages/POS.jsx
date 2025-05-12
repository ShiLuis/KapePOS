import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import Cart from '../components/Cart';
import ProductOptionsModal from '../components/ProductOptionsModal';
import PaymentModal from '../components/PaymentModal';
import ReceiptModal from '../components/ReceiptModal';
import OrderHistoryModal from '../components/OrderHistoryModal'; // Import OrderHistoryModal
import productsData from '../data/products.json';
import './POS.css';

function POS() {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [selectedProductForOptions, setSelectedProductForOptions] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false); // State for PaymentModal
  const [currentOrderAmount, setCurrentOrderAmount] = useState(0); // State for total amount at payment
  const [orderHistory, setOrderHistory] = useState([]); // State for order history
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false); // State for ReceiptModal
  const [currentReceipt, setCurrentReceipt] = useState(null); // State for the order to show in receipt
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false); // State for OrderHistoryModal

  useEffect(() => {
    setProducts(productsData);
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
    const savedOrderHistory = localStorage.getItem('orderHistory');
    if (savedOrderHistory) {
      setOrderHistory(JSON.parse(savedOrderHistory));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
  }, [orderHistory]);


  const handleOpenOptionsModal = (product) => {
    setSelectedProductForOptions(product);
    setIsOptionsModalOpen(true);
  };

  const handleCloseOptionsModal = () => {
    setIsOptionsModalOpen(false);
    setSelectedProductForOptions(null);
  };

  const handleAddToCartWithOptions = (productWithOptions) => {
    setCartItems(prevItems => {
      // Use cartItemId to check if the exact same configured item exists
      const itemExists = prevItems.find(item => item.cartItemId === productWithOptions.cartItemId);
      if (itemExists) {
        return prevItems.map(item =>
          item.cartItemId === productWithOptions.cartItemId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      // Add new item with quantity 1, using finalPrice from modal
      return [...prevItems, { ...productWithOptions, price: productWithOptions.finalPrice, quantity: 1 }];
    });
    handleCloseOptionsModal(); // Close modal after adding
  };
  
  const handleProductSelect = (product) => {
    if ((product.options && product.options.length > 0) || (product.addons && product.addons.length > 0)) {
      handleOpenOptionsModal(product);
    } else {
      // Add directly to cart if no options/addons
      // We need a cartItemId even for direct adds for consistency
      const cartItem = {
        ...product,
        finalPrice: product.price,
        selectedOptions: {},
        selectedAddons: [],
        cartItemId: `${product.id}-default`, // Simple cartItemId for non-customized items
        quantity: 1
      };
      setCartItems(prevItems => {
        const itemExists = prevItems.find(item => item.cartItemId === cartItem.cartItemId);
        if (itemExists) {
          return prevItems.map(item =>
            item.cartItemId === cartItem.cartItemId ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return [...prevItems, cartItem];
      });
    }
  };


  const handleRemoveFromCart = (cartItemId) => { // Changed from productId to cartItemId
    setCartItems(prevItems => prevItems.filter(item => item.cartItemId !== cartItemId));
  };

  const handleUpdateQuantity = (cartItemId, newQuantity) => { // Changed from productId to cartItemId
    if (newQuantity <= 0) {
      handleRemoveFromCart(cartItemId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
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
    // Simulate payment processing
    console.log(`Payment processed via ${paymentMethod} for ₱${amountPaid.toFixed(2)}`);
    
    const newOrder = {
      id: `order-${Date.now()}`, // Simple unique ID
      items: [...cartItems], // Copy current cart items
      totalAmount: amountPaid,
      paymentMethod: paymentMethod,
      date: new Date().toISOString(),
    };

    setOrderHistory(prevHistory => [...prevHistory, newOrder]);
    setCartItems([]); // Clear the cart
    setIsPaymentModalOpen(false);
    
    setCurrentReceipt(newOrder); // Set the current order for the receipt
    setIsReceiptModalOpen(true); // Open the receipt modal
  };

  const handleCloseReceiptModal = () => {
    setIsReceiptModalOpen(false);
    setCurrentReceipt(null);
  };

  const handleOpenHistoryModal = () => {
    setIsHistoryModalOpen(true);
  };

  const handleCloseHistoryModal = () => {
    setIsHistoryModalOpen(false);
  };

  return (
    <div className="pos-system">
      <div className="main-controls">
        <button onClick={handleOpenHistoryModal} className="history-btn">
          View Order History
        </button>
      </div>
      <div className="main-content-area"> {/* New wrapper */}
        <div className="product-list">
          {products.map(category => (
            <div key={category.category} className="category-section">
              <h2>{category.category}</h2>
              <div className="items-grid">
                {category.items.map(item => (
                  <ProductCard
                    key={item.id}
                    product={item}
                    onProductSelect={handleProductSelect}
                  />
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
      </div> {/* End of main-content-area */}
      
      {/* Modals remain outside the main content flow */}
      {selectedProductForOptions && (
        <ProductOptionsModal
          product={selectedProductForOptions}
          isOpen={isOptionsModalOpen}
          onClose={handleCloseOptionsModal}
          onAddToCartWithOptions={handleAddToCartWithOptions}
        />
      )}
      {isPaymentModalOpen && ( // Render PaymentModal
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={handleClosePaymentModal}
          onProcessPayment={handleProcessPayment}
          totalAmount={currentOrderAmount}
        />
      )}
      {currentReceipt && ( // Render ReceiptModal
        <ReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={handleCloseReceiptModal}
          order={currentReceipt}
        />
      )}
      {isHistoryModalOpen && ( // Render OrderHistoryModal
        <OrderHistoryModal
          isOpen={isHistoryModalOpen}
          onClose={handleCloseHistoryModal}
          orderHistory={orderHistory}
        />
      )}
    </div>
  );
}

export default POS;