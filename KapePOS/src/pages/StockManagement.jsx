import React, { useState, useEffect } from 'react';
import './StockManagement.css';

function StockManagement() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState({});
  const [stockChanges, setStockChanges] = useState({});
  const [saveStatus, setSaveStatus] = useState({ success: false, message: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState({});
  const [bulkValue, setBulkValue] = useState('');

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/menu-items');
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setMenuItems(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch menu items: ' + err.message);
      console.error('Error fetching menu items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = (itemId) => {
    setEditMode(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
    
    // Initialize or reset the stock change for this item
    if (!editMode[itemId]) {
      const item = menuItems.find(item => item._id === itemId);
      // Access productDetails.stock safely
      const currentStock = item.productDetails?.stock || 0;
      setStockChanges(prev => ({
        ...prev,
        [itemId]: currentStock
      }));
    }
  };

  const handleStockChange = (itemId, value) => {
    // Ensure value is a non-negative number
    const stockValue = Math.max(0, parseInt(value) || 0);
    setStockChanges(prev => ({
      ...prev,
      [itemId]: stockValue
    }));
  };

  const handleSaveStock = async (itemId) => {
    try {
      const newStock = stockChanges[itemId];
      
      console.log(`Updating stock for item ${itemId} to ${newStock}`);
      
      const response = await fetch(`http://localhost:5000/api/menu-items/${itemId}/stock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          stock: newStock 
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`Error: ${response.status}`);
      }
      
      const updatedItem = await response.json();
      console.log('Updated item:', updatedItem);
      
      // Update the menu items state
      setMenuItems(prevItems =>
        prevItems.map(item => 
          item._id === itemId 
            ? { 
                ...item, 
                productDetails: { 
                  ...item.productDetails,
                  stock: newStock 
                } 
              }
            : item
        )
      );
      
      // Exit edit mode
      setEditMode(prev => ({
        ...prev,
        [itemId]: false
      }));
      
      // Show success message
      setSaveStatus({
        success: true,
        message: `Stock updated successfully for ${updatedItem.name}`
      });
      
      // Clear the message after 3 seconds
      setTimeout(() => {
        setSaveStatus({ success: false, message: '' });
      }, 3000);
      
    } catch (err) {
      console.error('Error updating stock:', err);
      setSaveStatus({
        success: false,
        message: `Error updating stock: ${err.message}`
      });
      
      // Clear the error message after 3 seconds
      setTimeout(() => {
        setSaveStatus({ success: false, message: '' });
      }, 3000);
    }
  };

  const handleBulkToggle = () => {
    setBulkMode(!bulkMode);
    setSelectedItems({});
    setBulkValue('');
  };

  const handleItemSelect = (itemId) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleSelectAll = (items) => {
    const newSelectedItems = {};
    const allSelected = items.every(item => selectedItems[item._id]);
    
    items.forEach(item => {
      newSelectedItems[item._id] = !allSelected;
    });
    
    setSelectedItems(newSelectedItems);
  };

  const handleBulkUpdate = async () => {
    const selectedIds = Object.entries(selectedItems)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => id);
      
    if (selectedIds.length === 0 || !bulkValue) {
      setSaveStatus({
        success: false,
        message: "Please select items and enter a stock value"
      });
      return;
    }

    const stockValue = parseInt(bulkValue);
    if (isNaN(stockValue) || stockValue < 0) {
      setSaveStatus({
        success: false,
        message: "Please enter a valid stock value"
      });
      return;
    }

    try {
      setLoading(true);
      
      // Update each selected item
      const updatePromises = selectedIds.map(id => 
        fetch(`http://localhost:5000/api/menu-items/${id}/stock`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stock: stockValue })
        })
      );
      
      const results = await Promise.allSettled(updatePromises);
      const allSuccessful = results.every(result => result.status === 'fulfilled' && result.value.ok);
      
      // Refetch menu items to get updated data
      await fetchMenuItems();
      
      // Exit bulk mode
      setBulkMode(false);
      setSelectedItems({});
      setBulkValue('');
      
      setSaveStatus({
        success: allSuccessful,
        message: allSuccessful 
          ? `Successfully updated stock for ${selectedIds.length} item(s)` 
          : "Some items could not be updated"
      });
    } catch (err) {
      console.error('Bulk update failed:', err);
      setSaveStatus({
        success: false,
        message: `Bulk update failed: ${err.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    // Create CSV content
    let csvContent = "Item Name,Category,Price,Stock,Status\n";
    
    menuItems.forEach(item => {
      const stock = item.productDetails?.stock || 0;
      const status = stock <= 10 ? 'Low Stock' : 'In Stock';
      
      csvContent += `"${item.name}","${item.category}",${item.price},${stock},"${status}"\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `stock_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter and sort items
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const stock = item.productDetails?.stock || 0;
    
    let matchesStockFilter = true;
    if (stockFilter === 'low') {
      matchesStockFilter = stock <= 10;
    } else if (stockFilter === 'out') {
      matchesStockFilter = stock === 0;
    }
    
    return matchesSearch && matchesCategory && matchesStockFilter;
  });

  // Group filtered items by category
  const itemsByCategory = filteredItems.reduce((acc, item) => {
    const category = item.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  // Get unique categories for filter dropdown
  const categories = ['all', ...new Set(menuItems.map(item => item.category))];

  if (loading) {
    return <div className="stock-management loading">Loading stock data...</div>;
  }

  if (error) {
    return (
      <div className="stock-management">
        <div className="error-container">
          <h2>Error loading stock data</h2>
          <p>{error}</p>
          <button onClick={fetchMenuItems} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Calculate stock statistics
  const totalItems = menuItems.length;
  const totalStock = menuItems.reduce((sum, item) => sum + (item.productDetails?.stock || 0), 0);
  const lowStockItems = menuItems.filter(item => (item.productDetails?.stock || 0) <= 10).length;
  const outOfStockItems = menuItems.filter(item => (item.productDetails?.stock || 0) === 0).length;

  return (
    <div className="stock-management">
      <h1>Stock Management</h1>
      
      {/* Stock Statistics */}
      <div className="stock-stats">
        <div className="stat-card">
          <h3>Total Items</h3>
          <p>{totalItems}</p>
        </div>
        <div className="stat-card">
          <h3>Total Stock</h3>
          <p>{totalStock} units</p>
        </div>
        <div className="stat-card">
          <h3>Low Stock Items</h3>
          <p>{lowStockItems}</p>
        </div>
        <div className="stat-card">
          <h3>Out of Stock</h3>
          <p>{outOfStockItems}</p>
        </div>
      </div>
      
      {saveStatus.message && (
        <div className={`status-message ${saveStatus.success ? 'success' : 'error'}`}>
          {saveStatus.message}
        </div>
      )}
      
      {/* Filter Controls */}
      <div className="filter-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-dropdowns">
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            {categories.filter(c => c !== 'all').map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
          
          <select 
            value={stockFilter} 
            onChange={(e) => setStockFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Stock Levels</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
        
        <div className="action-buttons">
          <button onClick={handleBulkToggle} className="bulk-btn">
            {bulkMode ? 'Cancel Bulk Update' : 'Bulk Update'}
          </button>
          <button onClick={handleExportCSV} className="export-btn">
            Export CSV
          </button>
        </div>
      </div>
      
      {/* Bulk Update Controls - Show only in bulk mode */}
      {bulkMode && (
        <div className="bulk-controls">
          <input
            type="number"
            placeholder="Enter stock quantity"
            value={bulkValue}
            onChange={(e) => setBulkValue(e.target.value)}
            min="0"
            className="bulk-input"
          />
          <button onClick={handleBulkUpdate} className="bulk-update-btn">
            Update Selected Items
          </button>
        </div>
      )}
      
      {Object.entries(itemsByCategory).map(([category, items]) => (
        <div key={category} className="category-section">
          <h2>
            {category.charAt(0).toUpperCase() + category.slice(1)}
            {bulkMode && (
              <button 
                onClick={() => handleSelectAll(items)} 
                className="select-all-btn"
              >
                {items.every(item => selectedItems[item._id]) ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </h2>
          <table className="stock-table">
            <thead>
              <tr>
                {bulkMode && <th className="checkbox-column">Select</th>}
                <th>Item</th>
                <th>Price</th>
                <th>Current Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const stock = item.productDetails?.stock || 0;
                const isInEditMode = !!editMode[item._id];
                
                return (
                  <tr 
                    key={item._id} 
                    className={stock <= 10 ? 'low-stock' : ''}
                  >
                    {bulkMode && (
                      <td className="checkbox-column">
                        <input 
                          type="checkbox" 
                          checked={!!selectedItems[item._id]} 
                          onChange={() => handleItemSelect(item._id)}
                          className="item-checkbox"
                        />
                      </td>
                    )}
                    <td>{item.name}</td>
                    <td>₱{item.price.toFixed(2)}</td>
                    <td>
                      {isInEditMode ? (
                        <input
                          type="number"
                          value={stockChanges[item._id]}
                          onChange={(e) => handleStockChange(item._id, e.target.value)}
                          min="0"
                          className="stock-input"
                        />
                      ) : (
                        stock
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${stock <= 10 ? (stock === 0 ? 'out-of-stock' : 'low-stock') : 'in-stock'}`}>
                        {stock === 0 ? 'Out of Stock' : (stock <= 10 ? 'Low Stock' : 'In Stock')}
                      </span>
                    </td>
                    <td>
                      {bulkMode ? (
                        <span className="bulk-mode-msg">Bulk mode active</span>
                      ) : isInEditMode ? (
                        <>
                          <button 
                            onClick={() => handleSaveStock(item._id)}
                            className="save-btn"
                          >
                            Save
                          </button>
                          <button 
                            onClick={() => handleEditToggle(item._id)}
                            className="cancel-btn"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => handleEditToggle(item._id)}
                          className="edit-btn"
                        >
                          Update Stock
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}
      
      {/* Show message when no items match filters */}
      {Object.keys(itemsByCategory).length === 0 && (
        <div className="no-items-message">
          <p>No items match your search criteria.</p>
          <button 
            onClick={() => {
              setSearchQuery('');
              setCategoryFilter('all');
              setStockFilter('all');
            }}
            className="clear-filters-btn"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default StockManagement;