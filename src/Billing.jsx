// Updated Billing.jsx
import React, { useEffect, useState } from 'react';
import CreateInvoice from './CreateInvoice';
import axios from 'axios';
import { BACKEND_URL } from './lib/config';

function Billing() {
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [invoiceList, setInvoiceList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [customDate, setCustomDate] = useState('');

  const today = new Date().toISOString().slice(0, 10);
  const currentMonth = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await axios.get(BACKEND_URL +'/api/invoices');
      setInvoiceList(res.data);
    } catch (err) {
      console.error('Error fetching invoices:', err);
    }
  };

  const handleSaveInvoice = (newInvoice) => {
    setInvoiceList([...invoiceList, newInvoice]);
    setShowCreateInvoice(false);
  };

  const filteredInvoices = invoiceList.filter((inv) => {
    const date = inv.date?.slice(0, 10) || today;
    if (filterType === 'daily') return date === today;
    if (filterType === 'monthly') return date.slice(0, 7) === currentMonth;
    if (filterType === 'custom') return date === customDate;
    return true;
  }).filter((inv) =>
    inv.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.customer?.mobile?.includes(searchTerm) ||
    inv._id?.includes(searchTerm)
  );

  const totalAmount = filteredInvoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0);
  const totalDue = filteredInvoices.reduce((sum, i) => sum + (i.dueAmount || 0), 0);

  return (
    <div className="p-6 bg-white shadow rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-yellow-700">Billing & Invoices</h2>
        <button
          onClick={() => setShowCreateInvoice(true)}
          className="bg-yellow-700 hover:bg-yellow-800 text-white px-4 py-2 rounded shadow"
        >
          ➕ Create New Invoice
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name, mobile or invoice ID"
          className="border border-yellow-300 rounded px-3 py-2 text-sm flex-1 min-w-[220px]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border border-yellow-300 rounded px-2 py-1 text-sm"
        >
          <option value="all">All Invoices</option>
          <option value="daily">Today</option>
          <option value="monthly">This Month</option>
          <option value="custom">Custom Date</option>
        </select>
        {filterType === 'custom' && (
          <input
            type="date"
            className="border border-yellow-300 rounded px-2 py-1 text-sm"
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
          />
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 text-sm text-yellow-800 font-semibold">
        <div className="bg-yellow-100 border border-yellow-300 p-3 rounded shadow-sm">
          Total Invoices: {filteredInvoices.length}
        </div>
        <div className="bg-yellow-100 border border-yellow-300 p-3 rounded shadow-sm">
          Total Amount: ₹{totalAmount.toFixed(2)}
        </div>
        <div className="bg-yellow-100 border border-yellow-300 p-3 rounded shadow-sm">
          Total Due: ₹{totalDue.toFixed(2)}
        </div>
      </div>

      <div className="overflow-auto">
        <table className="w-full text-sm border border-yellow-300 rounded">
          <thead className="bg-yellow-200 text-yellow-900">
            <tr>
              <th className="p-2 border">Invoice ID</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Customer</th>
              <th className="p-2 border">Mobile</th>
              <th className="p-2 border">Total</th>
              <th className="p-2 border">Paid</th>
              <th className="p-2 border">Due</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center p-4 text-zinc-500">No invoices found.</td>
              </tr>
            ) : (
              filteredInvoices.map((inv) => (
                <tr key={inv._id} className="hover:bg-yellow-50">
                  <td className="p-2 border text-center">{inv._id}</td>
                  <td className="p-2 border">{inv.date?.slice(0, 10)}</td>
                  <td className="p-2 border">{inv.customer?.name}</td>
                  <td className="p-2 border">{inv.customer?.mobile}</td>
                  <td className="p-2 border">₹{inv.totalAmount?.toFixed(2)}</td>
                  <td className="p-2 border text-green-700">₹{inv.paidAmount?.toFixed(2)}</td>
                  <td className="p-2 border text-red-600">₹{inv.dueAmount?.toFixed(2)}</td>
                  <td className="p-2 border text-center">
                    <button className="text-blue-600 hover:underline text-sm">View</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showCreateInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-3xl">
            <CreateInvoice
              onClose={() => setShowCreateInvoice(false)}
              onSave={handleSaveInvoice}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Billing;
