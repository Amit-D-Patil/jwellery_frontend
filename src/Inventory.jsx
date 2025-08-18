import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BACKEND_URL } from './lib/config';

const Inventory = () => {
  const [activeTab, setActiveTab] = useState('stock');
  const [items, setItems] = useState([]);
  const [showNewItemForm, setShowNewItemForm] = useState(false);
  const [stats, setStats] = useState({
    totalItems: 0,
    totalValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0
  });

  const [filters, setFilters] = useState({
    search: '',
    itemType: '',
    category: '',
    status: ''
  });

  const [formData, setFormData] = useState({
    itemType: 'Gold',
    category: 'Ornament',
    name: '',
    description: '',
    weight: '',
    unit: 'gram',
    purity: '',
    purchasePrice: '',
    sellingPrice: '',
    makingCharges: '',
    quantity: '',
    reorderLevel: '',
    location: '',
    supplier: {
      name: '',
      contact: '',
      invoiceNumber: ''
    }
  });

  useEffect(() => {
    fetchItems();
    fetchStats();
  }, []);

  const fetchItems = async () => {
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.itemType) params.itemType = filters.itemType;
      if (filters.category) params.category = filters.category;
      if (filters.status) params.status = filters.status;

      const res = await axios.get(BACKEND_URL+'/api/inventory', { params });
      setItems(res.data);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(BACKEND_URL+'/api/inventory/stats/overview');
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('supplier.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        supplier: { ...formData.supplier, [field]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  useEffect(() => {
    fetchItems();
  }, [filters]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(BACKEND_URL+'/api/inventory', formData);
      setItems([...items, res.data]);
      setShowNewItemForm(false);
      resetForm();
      fetchStats();
    } catch (err) {
      console.error('Error adding item:', err);
      alert(err.response?.data?.message || 'Error adding item');
    }
  };

  const handleTransaction = async (itemId, type, quantity, price) => {
    try {
      await axios.post(BACKEND_URL+`/api/inventory/${itemId}/transaction`, {
        type,
        quantity: parseFloat(quantity),
        price: parseFloat(price)
      });
      fetchItems();
      fetchStats();
    } catch (err) {
      console.error('Error processing transaction:', err);
      alert(err.response?.data?.message || 'Error processing transaction');
    }
  };

  const resetForm = () => {
    setFormData({
      itemType: 'Gold',
      category: 'Ornament',
      name: '',
      description: '',
      weight: '',
      unit: 'gram',
      purity: '',
      purchasePrice: '',
      sellingPrice: '',
      makingCharges: '',
      quantity: '',
      reorderLevel: '',
      location: '',
      supplier: {
        name: '',
        contact: '',
        invoiceNumber: ''
      }
    });
  };

  const inventoryTabs = [
    { key: 'stock', label: '🔍 View Live Stock' },
    { key: 'addPurchase', label: '➕ Add New Purchase' },
    { key: 'convert', label: '🔁 Quantity Conversion' },
    { key: 'sold', label: '📤 Sold Stock' },
    { key: 'alerts', label: '⚠️ Low Stock Alerts' },
    { key: 'summary', label: '📊 Inventory Summary' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'stock':
        return (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Live Inventory Stock</h3>
              <button
                onClick={() => setShowNewItemForm(true)}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
              >
                Add New Item
              </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <input
                type="text"
                name="search"
                placeholder="Search items..."
                className="border rounded px-3 py-2"
                value={filters.search}
                onChange={handleFilterChange}
              />
              <select
                name="itemType"
                className="border rounded px-3 py-2"
                value={filters.itemType}
                onChange={handleFilterChange}
              >
                <option value="">All Types</option>
                <option value="Gold">Gold</option>
                <option value="Silver">Silver</option>
                <option value="Diamond">Diamond</option>
                <option value="Platinum">Platinum</option>
              </select>
              <select
                name="category"
                className="border rounded px-3 py-2"
                value={filters.category}
                onChange={handleFilterChange}
              >
                <option value="">All Categories</option>
                <option value="Ornament">Ornament</option>
                <option value="Bullion">Bullion</option>
                <option value="Loose Stone">Loose Stone</option>
                <option value="Raw Material">Raw Material</option>
              </select>
              <select
                name="status"
                className="border rounded px-3 py-2"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="">All Status</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map(item => (
                <div key={item._id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.itemCode}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-sm ${
                      item.status === 'in-stock' ? 'bg-green-100 text-green-800' :
                      item.status === 'low-stock' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {item.status.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </span>
                  </div>

                  <div className="text-sm grid grid-cols-2 gap-2 mb-2">
                    <div>Type: {item.itemType}</div>
                    <div>Category: {item.category}</div>
                    <div>Weight: {item.weight} {item.unit}</div>
                    <div>Purity: {item.purity}</div>
                    <div>Quantity: {item.quantity}</div>
                    <div>Reorder Level: {item.reorderLevel}</div>
                  </div>

                  <div className="text-sm mb-2">
                    <div>Purchase Price: ₹{item.purchasePrice}</div>
                    <div>Selling Price: ₹{item.sellingPrice}</div>
                    {item.makingCharges > 0 && (
                      <div>Making Charges: ₹{item.makingCharges}</div>
                    )}
                  </div>

                  {item.alerts?.length > 0 && (
                    <div className="mt-2 mb-2">
                      {item.alerts.map((alert, index) => (
                        <div
                          key={index}
                          className={`text-sm px-2 py-1 rounded ${
                            alert.type === 'warning' ? 'bg-yellow-50 text-yellow-800' :
                            'bg-red-50 text-red-800'
                          }`}
                        >
                          {alert.message}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-2 pt-2 border-t flex gap-2">
                    <button
                      onClick={() => {
                        const quantity = prompt('Enter purchase quantity:');
                        const price = prompt('Enter purchase price per unit:');
                        if (quantity && price) {
                          handleTransaction(item._id, 'purchase', quantity, price);
                        }
                      }}
                      className="flex-1 bg-green-100 hover:bg-green-200 text-green-800 px-2 py-1 rounded text-sm"
                    >
                      Purchase
                    </button>
                    <button
                      onClick={() => {
                        const quantity = prompt('Enter sale quantity:');
                        const price = prompt('Enter sale price per unit:');
                        if (quantity && price) {
                          handleTransaction(item._id, 'sale', quantity, price);
                        }
                      }}
                      className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded text-sm"
                      disabled={item.quantity <= 0}
                    >
                      Sale
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'addPurchase':
        return (
          <div>
            <h3 className="text-xl font-semibold mb-4">Add New Purchase</h3>
            <form onSubmit={handleSubmit} className="max-w-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Item Type</label>
                  <select
                    name="itemType"
                    value={formData.itemType}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                    required
                  >
                    <option value="Gold">Gold</option>
                    <option value="Silver">Silver</option>
                    <option value="Diamond">Diamond</option>
                    <option value="Platinum">Platinum</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                    required
                  >
                    <option value="Ornament">Ornament</option>
                    <option value="Bullion">Bullion</option>
                    <option value="Loose Stone">Loose Stone</option>
                    <option value="Raw Material">Raw Material</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Item Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Weight</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                    required
                    step="0.001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Unit</label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                    required
                  >
                    <option value="gram">Gram</option>
                    <option value="carat">Carat</option>
                    <option value="kilogram">Kilogram</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Purity</label>
                  <input
                    type="text"
                    name="purity"
                    value={formData.purity}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                    required
                    placeholder="e.g., 24K, 92.5%"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Purchase Price</label>
                  <input
                    type="number"
                    name="purchasePrice"
                    value={formData.purchasePrice}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                    required
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Selling Price</label>
                  <input
                    type="number"
                    name="sellingPrice"
                    value={formData.sellingPrice}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                    required
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Making Charges</label>
                  <input
                    type="number"
                    name="makingCharges"
                    value={formData.makingCharges}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                    required
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Reorder Level</label>
                  <input
                    type="number"
                    name="reorderLevel"
                    value={formData.reorderLevel}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                    required
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                    placeholder="e.g., Safe 1, Shelf A"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Supplier Name</label>
                  <input
                    type="text"
                    name="supplier.name"
                    value={formData.supplier.name}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Supplier Contact</label>
                  <input
                    type="text"
                    name="supplier.contact"
                    value={formData.supplier.contact}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Supplier Invoice</label>
                  <input
                    type="text"
                    name="supplier.invoiceNumber"
                    value={formData.supplier.invoiceNumber}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-4">
                <button
                  type="submit"
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded"
                >
                  Add Item
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="border border-gray-300 hover:bg-gray-50 px-6 py-2 rounded"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        );
      case 'convert':
        return (
          <div>
            <h3 className="text-xl font-semibold mb-4">Convert Quantity</h3>
            <div className="max-w-lg bg-white rounded-lg shadow p-6">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">From Unit</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="gram">Gram</option>
                    <option value="kilogram">Kilogram</option>
                    <option value="carat">Carat</option>
                    <option value="ounce">Troy Ounce</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">To Unit</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="gram">Gram</option>
                    <option value="kilogram">Kilogram</option>
                    <option value="carat">Carat</option>
                    <option value="ounce">Troy Ounce</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Value</label>
                  <input
                    type="number"
                    className="w-full border rounded px-3 py-2"
                    placeholder="Enter value to convert"
                    step="0.001"
                  />
                </div>

                <div className="pt-4">
                  <div className="text-lg font-semibold">Result:</div>
                  <div className="text-2xl text-yellow-600">0.00</div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'sold':
        return (
          <div>
            <h3 className="text-xl font-semibold mb-4">Sold Stock</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sale Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {/* Add sold items data here */}
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">No sold items to display</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'alerts':
        return (
          <div>
            <h3 className="text-xl font-semibold mb-4">Low Stock Alerts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items
                .filter(item => item.status === 'low-stock' || item.status === 'out-of-stock')
                .map(item => (
                  <div key={item._id} className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold">{item.name}</h3>
                        <p className="text-sm text-gray-600">{item.itemCode}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-sm ${
                        item.status === 'low-stock' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.status === 'low-stock' ? 'Low Stock' : 'Out of Stock'}
                      </span>
                    </div>
                    <div className="text-sm">
                      <div>Current Quantity: {item.quantity}</div>
                      <div>Reorder Level: {item.reorderLevel}</div>
                      <div className="mt-2 text-gray-600">
                        Type: {item.itemType} | Category: {item.category}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const quantity = prompt('Enter purchase quantity:');
                        const price = prompt('Enter purchase price per unit:');
                        if (quantity && price) {
                          handleTransaction(item._id, 'purchase', quantity, price);
                        }
                      }}
                      className="mt-3 w-full bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-4 py-2 rounded text-sm"
                    >
                      Purchase Stock
                    </button>
                  </div>
                ))}
            </div>
          </div>
        );
      case 'summary':
        return (
          <div>
            <h3 className="text-xl font-semibold mb-4">Inventory Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-500">Total Items</div>
                <div className="text-2xl font-bold">{stats.totalItems}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-500">Total Value</div>
                <div className="text-2xl font-bold">₹{stats.totalValue.toLocaleString()}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-500">Low Stock Items</div>
                <div className="text-2xl font-bold text-yellow-600">{stats.lowStockItems}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-500">Out of Stock</div>
                <div className="text-2xl font-bold text-red-600">{stats.outOfStockItems}</div>
              </div>
            </div>

            <div className="mt-8">
              <h4 className="text-lg font-semibold mb-4">Stock Distribution</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['Gold', 'Silver', 'Diamond', 'Platinum'].map(type => {
                  const typeItems = items.filter(item => item.itemType === type);
                  const typeValue = typeItems.reduce((sum, item) => 
                    sum + (item.quantity * item.sellingPrice), 0
                  );
                  return (
                    <div key={type} className="bg-white rounded-lg shadow p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-semibold">{type}</div>
                        <div className="text-sm text-gray-500">
                          {typeItems.length} items
                        </div>
                      </div>
                      <div className="text-lg">₹{typeValue.toLocaleString()}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4">
      {/* New Item Form Modal */}
      {showNewItemForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Add New Item</h3>
              <button
                onClick={() => setShowNewItemForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Item Type</label>
                  <select
                    name="itemType"
                    value={formData.itemType}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                    required
                  >
                    <option value="Gold">Gold</option>
                    <option value="Silver">Silver</option>
                    <option value="Diamond">Diamond</option>
                    <option value="Platinum">Platinum</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                    required
                  >
                    <option value="Ornament">Ornament</option>
                    <option value="Bullion">Bullion</option>
                    <option value="Loose Stone">Loose Stone</option>
                    <option value="Raw Material">Raw Material</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Item Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Weight</label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                    required
                    step="0.001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Unit</label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                    required
                  >
                    <option value="gram">Gram</option>
                    <option value="carat">Carat</option>
                    <option value="kilogram">Kilogram</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Purity</label>
                  <input
                    type="text"
                    name="purity"
                    value={formData.purity}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                    required
                    placeholder="e.g., 24K, 92.5%"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Purchase Price</label>
                  <input
                    type="number"
                    name="purchasePrice"
                    value={formData.purchasePrice}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                    required
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Selling Price</label>
                  <input
                    type="number"
                    name="sellingPrice"
                    value={formData.sellingPrice}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                    required
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Making Charges</label>
                  <input
                    type="number"
                    name="makingCharges"
                    value={formData.makingCharges}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                    required
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Reorder Level</label>
                  <input
                    type="number"
                    name="reorderLevel"
                    value={formData.reorderLevel}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                    required
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                    placeholder="e.g., Safe 1, Shelf A"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Supplier Name</label>
                  <input
                    type="text"
                    name="supplier.name"
                    value={formData.supplier.name}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Supplier Contact</label>
                  <input
                    type="text"
                    name="supplier.contact"
                    value={formData.supplier.contact}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Supplier Invoice</label>
                  <input
                    type="text"
                    name="supplier.invoiceNumber"
                    value={formData.supplier.invoiceNumber}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded"
                >
                  Add Item
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowNewItemForm(false);
                  }}
                  className="border border-gray-300 hover:bg-gray-50 px-6 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Total Items</div>
          <div className="text-2xl font-bold">{stats.totalItems}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Total Value</div>
          <div className="text-2xl font-bold">₹{stats.totalValue.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Low Stock Items</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.lowStockItems}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Out of Stock</div>
          <div className="text-2xl font-bold text-red-600">{stats.outOfStockItems}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        {inventoryTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded ${activeTab === tab.key ? 'bg-yellow-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {renderTabContent()}
    </div>
  );
};

export default Inventory;
