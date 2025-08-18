import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { BACKEND_URL } from './lib/config';

function GoldLoan() {
  const [loans, setLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showNewLoanForm, setShowNewLoanForm] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [formData, setFormData] = useState({
    customerId: '',
    loanAmount: '',
    interestRate: '12', // Default interest rate
    duration: '12',     // Default duration in months
    items: [{
      itemType: 'Gold',
      description: '',
      weight: '',
      purity: '22',
      marketValue: ''
    }]
  });

  useEffect(() => {
    fetchLoans();
    fetchCustomers();
  }, []);

  const fetchLoans = async () => {
    try {
      const res = await axios.get(BACKEND_URL+'/api/gold-loans');
      setLoans(res.data);
    } catch (err) {
      console.error('Error fetching loans:', err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(BACKEND_URL+'/api/customers');
      setCustomers(res.data);
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  const handleInputChange = (e, index) => {
    const { name, value } = e.target;
    if (name.startsWith('items.')) {
      const field = name.split('.')[1];
      const updatedItems = [...formData.items];
      updatedItems[index][field] = value;
      setFormData({ ...formData, items: updatedItems });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          itemType: 'Gold',
          description: '',
          weight: '',
          purity: '22',
          marketValue: ''
        }
      ]
    });
  };

  const removeItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updatedItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(BACKEND_URL+'/api/gold-loans', formData);
      setLoans([...loans, res.data]);
      setShowNewLoanForm(false);
      resetForm();
    } catch (err) {
      console.error('Error creating loan:', err);
      alert(err.response?.data?.message || 'Error creating loan');
    }
  };

  const handleRepayment = async (loanId, amount) => {
    try {
      await axios.post(BACKEND_URL+`/api/gold-loans/${loanId}/repayment`, {
        amount: parseFloat(amount)
      });
      fetchLoans();
    } catch (err) {
      console.error('Error processing repayment:', err);
      alert(err.response?.data?.message || 'Error processing repayment');
    }
  };

  const resetForm = () => {
    setFormData({
      customerId: '',
      loanAmount: '',
      interestRate: '12',
      duration: '12',
      items: [{
        itemType: 'Gold',
        description: '',
        weight: '',
        purity: '22',
        marketValue: ''
      }]
    });
  };

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = 
      loan.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.loanNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || loan.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-yellow-700">Gold Loan Management</h2>
        <button
          onClick={() => setShowNewLoanForm(true)}
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
        >
          New Loan
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by customer or loan number"
          className="flex-1 border rounded px-3 py-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
          <option value="defaulted">Defaulted</option>
          <option value="renewed">Renewed</option>
        </select>
      </div>

      {/* New Loan Form */}
      {showNewLoanForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">New Gold Loan</h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Customer</label>
                  <select
                    name="customerId"
                    value={formData.customerId}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                    required
                  >
                    <option value="">Select Customer</option>
                    {customers.map(customer => (
                      <option key={customer._id} value={customer._id}>
                        {customer.name} ({customer.mobile})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Loan Amount (₹)</label>
                  <input
                    type="number"
                    name="loanAmount"
                    value={formData.loanAmount}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Interest Rate (%)</label>
                  <input
                    type="number"
                    name="interestRate"
                    value={formData.interestRate}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Duration (months)</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
              </div>

              {/* Items */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Pledged Items</h4>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-yellow-600 hover:text-yellow-700"
                  >
                    + Add Item
                  </button>
                </div>
                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-5 gap-2 mb-2">
                    <select
                      name={`items.itemType`}
                      value={item.itemType}
                      onChange={(e) => handleInputChange(e, index)}
                      className="border rounded px-2 py-1"
                    >
                      <option value="Gold">Gold</option>
                      <option value="Silver">Silver</option>
                      <option value="Diamond">Diamond</option>
                    </select>
                    <input
                      type="text"
                      name={`items.description`}
                      value={item.description}
                      onChange={(e) => handleInputChange(e, index)}
                      placeholder="Description"
                      className="border rounded px-2 py-1"
                    />
                    <input
                      type="number"
                      name={`items.weight`}
                      value={item.weight}
                      onChange={(e) => handleInputChange(e, index)}
                      placeholder="Weight (g)"
                      className="border rounded px-2 py-1"
                      required
                    />
                    <input
                      type="number"
                      name={`items.purity`}
                      value={item.purity}
                      onChange={(e) => handleInputChange(e, index)}
                      placeholder="Purity (K)"
                      className="border rounded px-2 py-1"
                      required
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        name={`items.marketValue`}
                        value={item.marketValue}
                        onChange={(e) => handleInputChange(e, index)}
                        placeholder="Value (₹)"
                        className="border rounded px-2 py-1 flex-1"
                        required
                      />
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-500 hover:text-red-700 px-2"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewLoanForm(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
                >
                  Create Loan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loans List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLoans.map(loan => (
          <div key={loan._id} className="border rounded-lg p-4 bg-white shadow">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold">{loan.customer?.name}</h3>
                <p className="text-sm text-gray-600">{loan.loanNumber}</p>
              </div>
              <span className={`px-2 py-1 rounded text-sm ${
                loan.status === 'active' ? 'bg-green-100 text-green-800' :
                loan.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                loan.status === 'defaulted' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
              </span>
            </div>
            
            <div className="text-sm grid grid-cols-2 gap-2 mb-2">
              <div>Loan Amount: ₹{loan.loanAmount}</div>
              <div>Interest: {loan.interestRate}%</div>
              <div>Duration: {loan.duration} months</div>
              <div>Remaining: ₹{loan.remainingAmount}</div>
            </div>

            <div className="text-sm mb-2">
              <div className="font-medium mb-1">Pledged Items:</div>
              {loan.items.map((item, index) => (
                <div key={index} className="text-gray-600">
                  {item.weight}g {item.itemType} ({item.purity}K) - ₹{item.marketValue}
                </div>
              ))}
            </div>

            {loan.status === 'active' && (
              <div className="mt-2 pt-2 border-t">
                <button
                  onClick={() => {
                    const amount = prompt('Enter repayment amount:');
                    if (amount) handleRepayment(loan._id, amount);
                  }}
                  className="w-full bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded text-sm"
                >
                  Add Repayment
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default GoldLoan;