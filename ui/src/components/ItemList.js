// src/components/ItemList.js

import React, { useState, useEffect } from 'react';
import { getItems } from '../services/itemService';

function ItemList() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    getItems()
      .then(response => setItems(response.data))
      .catch(error => console.error('Error fetching items:', error));
  }, []);

  return (
    <div>
      <h2>Item List</h2>
      {items.length > 0 ? (
        items.map(item => (
          <div key={item.id}>
            <p>{item.name}</p>
            {/* Add more item details as needed */}
          </div>
        ))
      ) : (
        <p>No items available.</p>
      )}
    </div>
  );
}

export default ItemList;
