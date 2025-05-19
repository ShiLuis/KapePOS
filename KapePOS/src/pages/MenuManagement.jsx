import { useState, useEffect } from 'react';
import './MenuManagement.css';

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    category: '',
    image: '',
    description: '',
    available: true,
    productDetails: {
      stock: 50,
      options: [],
      addons: []
    }
  });
  const [editingId, setEditingId] = useState(null);
  
  const API_URL = 'http://localhost:5000/api/menu-items';

  useEffect(() => {
    // Fetch menu items from MongoDB through our API
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_URL);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        setMenuItems(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch menu items. ' + err.message);
        console.error('Error fetching menu items:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMenuItems();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'stock') {
      // Handle nested productDetails fields
      setNewItem(prev => ({
        ...prev,
        productDetails: {
          ...prev.productDetails,
          stock: value
        }
      }));
    } else {
      setNewItem(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const addedItem = await response.json();
      setMenuItems(prev => [...prev, addedItem]);
      
      setNewItem({
        name: '',
        price: '',
        category: '',
        image: '',
        description: '',
        available: true,
        productDetails: {
          stock: 50,
          options: [],
          addons: []
        }
      });
      
    } catch (err) {
      setError('Failed to add menu item. ' + err.message);
      console.error('Error adding menu item:', err);
    }
  };

  const handleEditItem = (item) => {
    setNewItem({
      name: item.name,
      price: item.price,
      category: item.category,
      image: item.image || '',
      description: item.description || '',
      available: item.available !== undefined ? item.available : true,
      productDetails: item.productDetails || {
        stock: 50,
        options: [],
        addons: []
      }
    });
    setEditingId(item._id); // MongoDB uses _id
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${API_URL}/${editingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const updatedItem = await response.json();
      setMenuItems(prev => 
        prev.map(item => item._id === editingId ? updatedItem : item)
      );
      
      setNewItem({
        name: '',
        price: '',
        category: '',
        image: '',
        description: '',
        available: true,
        productDetails: {
          stock: 50,
          options: [],
          addons: []
        }
      });
      setEditingId(null);
      
    } catch (err) {
      setError('Failed to update menu item. ' + err.message);
      console.error('Error updating menu item:', err);
    }
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await fetch(`${API_URL}/${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        setMenuItems(prev => prev.filter(item => item._id !== id));
        
      } catch (err) {
        setError('Failed to delete menu item. ' + err.message);
        console.error('Error deleting menu item:', err);
      }
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      const updatedAvailability = !item.available;
      
      const response = await fetch(`${API_URL}/${item._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ available: updatedAvailability }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const updatedItem = await response.json();
      setMenuItems(prev => 
        prev.map(menuItem => menuItem._id === item._id ? updatedItem : menuItem)
      );
      
    } catch (err) {
      setError('Failed to update item availability. ' + err.message);
      console.error('Error updating availability:', err);
    }
  };

  return (
    <div className="admin-menu">
      <h1>Menu Management</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={editingId ? handleUpdateItem : handleAddItem} className="menu-form">
        <h2>{editingId ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
        
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={newItem.name}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="price">Price</label>
          <input
            type="number"
            id="price"
            name="price"
            value={newItem.price}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={newItem.category}
            onChange={handleInputChange}
            required
          >
            <option value="">Select a category</option>
            <option value="coffee">Coffee</option>
            <option value="tea">Tea</option>
            <option value="pastry">Pastry</option>
            <option value="sandwich">Sandwich</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="stock">Stock</label>
          <input
            type="number"
            id="stock"
            name="stock"
            value={newItem.productDetails?.stock || 0}
            onChange={handleInputChange}
            min="0"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="image">Image URL</label>
          <input
            type="text"
            id="image"
            name="image"
            value={newItem.image}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={newItem.description}
            onChange={handleInputChange}
            rows="3"
          ></textarea>
        </div>
        
        <div className="form-group availability-toggle">
          <label className="availability-label">
            <input
              type="checkbox"
              name="available"
              checked={newItem.available}
              onChange={(e) => setNewItem(prev => ({ ...prev, available: e.target.checked }))}
            />
            <span className="toggle-label">Available for sale</span>
            <span className={`status-indicator ${newItem.available ? 'active' : 'inactive'}`}>
              {newItem.available ? 'Available' : 'Unavailable'}
            </span>
          </label>
        </div>
        
        <button type="submit" className="btn-primary">
          {editingId ? 'Update Item' : 'Add Item'}
        </button>
        
        {editingId && (
          <button 
            type="button" 
            className="btn-secondary"
            onClick={() => {
              setNewItem({
                name: '',
                price: '',
                category: '',
                image: '',
                description: '',
                available: true,
                productDetails: {
                  stock: 50,
                  options: [],
                  addons: []
                }
              });
              setEditingId(null);
            }}
          >
            Cancel
          </button>
        )}
      </form>
      
      <div className="menu-items-list">
        <h2>Current Menu Items</h2>
        {loading ? (
          <p>Loading menu items...</p>
        ) : menuItems.length === 0 ? (
          <p>No menu items found. Add some items to get started.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.map(item => (
                <tr key={item._id} className={!item.available ? 'item-unavailable' : ''}>
                  <td>{item.name}</td>
                  <td>₱{parseFloat(item.price).toFixed(2)}</td>
                  <td>{item.category}</td>
                  <td>{item.productDetails?.stock || 0}</td>
                  <td>
                    <span className={`status-badge ${item.available ? 'available' : 'unavailable'}`}>
                      {item.available ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => handleEditItem(item)}
                      className="btn-edit"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleToggleAvailability(item)}
                      className={`btn-toggle ${item.available ? 'btn-disable' : 'btn-enable'}`}
                    >
                      {item.available ? 'Disable' : 'Enable'}
                    </button>
                    <button 
                      onClick={() => handleDeleteItem(item._id)}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MenuManagement;