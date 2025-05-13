import React from 'react';
import './StockManagement.css';

function StockManagement({ products }) {
  const allItems = products.flatMap((category) => category.items);

  return (
    <div className="stock-management">
      <h1>Stock Management</h1>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Category</th>
            <th>Stock</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {allItems.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{products.find((category) => category.items.includes(item)).category}</td>
              <td>{item.stock || 0}</td>
              <td>{item.stock <= 10 ? 'Low Stock' : 'In Stock'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StockManagement;