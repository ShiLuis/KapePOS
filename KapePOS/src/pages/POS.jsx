import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Cart from '../components/Cart';
import ProductOptionsModal from '../components/ProductOptionsModal';
import PaymentModal from '../components/PaymentModal';
import ReceiptModal from '../components/ReceiptModal';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const API_URL = 'http://localhost:5000/api/menu-items';

  useEffect(() => {
    // Fetch menu items from API
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_URL);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const menuData = await response.json();
        
        // Only show available items in POS
        const availableItems = menuData.filter(item => item.available);
        
        // Transform API data to match your current products structure
        const categorizedProducts = transformMenuItemsToCategories(availableItems);
        setProducts(categorizedProducts);
        
        setError(null);
      } catch (err) {
        setError('Failed to fetch menu items: ' + err.message);
        console.error('Error fetching menu items:', err);
        // Fallback to local data if API fails
        import('../data/products.json').then(data => {
          console.log('Falling back to local product data');
          setProducts(data.default);
        });
      } finally {
        setLoading(false);
      }
    };
    
    // Function to transform flat API data to categorized format
    const transformMenuItemsToCategories = (items) => {
      const categoryMap = {
        'coffee': 'Hot Coffees',
        'tea': 'Teas',
        'pastry': 'Pastries',
        'sandwich': 'Sandwiches',
        'other': 'Other Items'
      };
      
      // Group by category
      const groupedByCategory = items.reduce((acc, item) => {
        const categoryName = categoryMap[item.category] || 'Other Items';
        
        if (!acc[categoryName]) {
          acc[categoryName] = [];
        }
        
        // Transform to match your product structure
        const transformedItem = {
          id: item._id, // MongoDB id as product id
          name: item.name,
          price: item.price,
          stock: item.productDetails?.stock || 0,
          options: item.productDetails?.options || [],
          addons: item.productDetails?.addons || [],
          description: item.description || ''
        };
        
        acc[categoryName].push(transformedItem);
        return acc;
      }, {});
      
      // Convert to array format that matches your current products structure
      return Object.entries(groupedByCategory).map(([category, items]) => ({
        category,
        items
      }));
    };
    
    fetchMenuItems();
    
    // Load saved cart from localStorage
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
    
    // Calculate subtotal and tax
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.12; // 12% tax
    const total = subtotal + tax;
    
    // Format order data for API
    const orderData = {
      items: cartItems.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        selectedOptions: item.selectedOptions || {},
        selectedAddons: item.selectedAddons || [],
        itemNotes: item.itemNotes || ''
      })),
      subtotal: subtotal,
      tax: tax,
      totalAmount: total,
      paymentMethod: paymentMethod,
      date: new Date().toISOString(),
      createdBy: user.username
    };
    
    // Save order history to the server
    const saveOrder = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData),
        });
        
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        
        const savedOrder = await response.json();
        console.log('Order saved to database:', savedOrder);
        
        // Use the saved order from the database for the receipt
        setCurrentReceipt({
          ...savedOrder,
          id: savedOrder.orderNumber // Map database order number to id for compatibility
        });
      } catch (err) {
        console.error('Failed to save order:', err);
        // Fall back to local receipt if server save fails
        const fallbackReceipt = {
          id: `order-${Date.now()}`,
          items: [...cartItems],
          subtotal: subtotal,
          tax: tax,
          totalAmount: total,
          paymentMethod: paymentMethod,
          date: new Date().toISOString(),
        };
        setCurrentReceipt(fallbackReceipt);
      }
    };
    
    saveOrder();
    
    // Clear cart and close payment modal
    setCartItems([]);
    setIsPaymentModalOpen(false);
    setIsReceiptModalOpen(true);
  };

  const handleCloseReceiptModal = () => {
    setIsReceiptModalOpen(false);
    setCurrentReceipt(null);
  };

  if (loading) {
    return (
      <div className="pos-system loading">
        <div className="loading-spinner">
          Loading menu items...
        </div>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="pos-system error">
        <div className="error-message">
          <h3>Error loading menu items</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="pos-system">
      <div className="main-controls">
        <h3>Welcome, {user.username}!</h3>
        {error && <div className="api-error-banner">{error}</div>}
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