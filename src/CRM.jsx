import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from './lib/config';

function CRM() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    address: '',
    dob: '',
    gender: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(BACKEND_URL+'/api/customers');
      setCustomers(res.data);
    } catch (err) {
      console.error('Error fetching customers', err);
    }
  };

  const validate = async () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    if (!formData.mobile.trim()) {
      errs.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobile.trim())) {
      errs.mobile = 'Enter a valid 10-digit mobile number';
    } else {
      const duplicate = customers.find(
        (c) => c.mobile === formData.mobile && c._id !== editingCustomer?._id
      );
      if (duplicate) errs.mobile = 'Mobile number already exists';
    }
    return errs;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const validationErrors = await validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      try {
        if (editingCustomer) {
          await axios.put(BACKEND_URL+`/api/customers/${editingCustomer._id}`, formData);
        } else {
          await axios.post(BACKEND_URL+'/api/customers', formData);
        }
        setFormData({ name: '', mobile: '', email: '', address: '', dob: '', gender: '', notes: '' });
        setEditingCustomer(null);
        setSelectedCustomer(null);
        fetchCustomers();
      } catch (err) {
        console.error('Error saving customer', err);
      }
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({ ...customer });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await axios.delete(BACKEND_URL+`/api/customers/${id}`);
        fetchCustomers();
        setSelectedCustomer(null);
      } catch (err) {
        console.error('Error deleting customer', err);
      }
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.mobile.includes(searchQuery)
  );

  return (
    <div className="flex h-screen">
      <div className="w-1/3 border-r p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Customer Management</h2>
          <button
            onClick={() => {
              setEditingCustomer(null);
              setFormData({ name: '', mobile: '', email: '', address: '', dob: '', gender: '', notes: '' });
              setSelectedCustomer(null);
            }}
            className="bg-green-500 text-white px-2 py-1 rounded"
          >
            + Add
          </button>
        </div>
        <input
          type="text"
          placeholder="Search by name or mobile"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full mb-4 px-3 py-2 border rounded"
        />
        <ul>
          {filteredCustomers.map((c) => (
            <li
              key={c._id}
              className="cursor-pointer p-2 border-b hover:bg-gray-100"
              onClick={() => setSelectedCustomer(c)}
            >
              <strong>{c.name}</strong> - {c.mobile}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {editingCustomer || !selectedCustomer ? (
          <form onSubmit={handleSave} className="space-y-4 max-w-xl">
            <h2 className="text-lg font-bold mb-2">
              {editingCustomer ? 'Edit Customer' : 'Add Customer'}
            </h2>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

            <input
              type="text"
              name="mobile"
              placeholder="Mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
            {errors.mobile && <p className="text-red-500 text-sm">{errors.mobile}</p>}

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
            <textarea
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
            <input
              type="date"
              name="dob"
              value={formData.dob?.slice(0, 10)}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <textarea
              name="notes"
              placeholder="Notes"
              value={formData.notes}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                Save
              </button>
              <button
                type="button"
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => {
                  setEditingCustomer(null);
                  setFormData({ name: '', mobile: '', email: '', address: '', dob: '', gender: '', notes: '' });
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          selectedCustomer && (
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">{selectedCustomer.name}</h2>
              <p><strong>📱 Mobile:</strong> {selectedCustomer.mobile}</p>
              <p><strong>📧 Email:</strong> {selectedCustomer.email}</p>
              <p><strong>🏠 Address:</strong> {selectedCustomer.address}</p>
              <p><strong>🎂 DOB:</strong> {new Date(selectedCustomer.dob).toLocaleDateString()}</p>
              <p><strong>⚧ Gender:</strong> {selectedCustomer.gender}</p>
              <p><strong>📝 Notes:</strong> {selectedCustomer.notes}</p>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEdit(selectedCustomer)}
                  className="bg-yellow-500 text-white px-4 py-2 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(selectedCustomer._id)}
                  className="bg-red-600 text-white px-4 py-2 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default CRM;
