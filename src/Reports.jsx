import React, { useState } from 'react';

function Reports() {
  const [selectedReport, setSelectedReport] = useState('sales');

  const renderReport = () => {
    switch (selectedReport) {
      case 'sales':
        return (
          <div>
            <h2 className="text-xl font-bold text-yellow-800 mb-4">📈 Sales Report</h2>
            <table className="w-full table-auto border-collapse text-sm">
              <thead className="bg-yellow-200 text-yellow-900">
                <tr>
                  <th className="border px-2 py-1">Date</th>
                  <th className="border px-2 py-1">Customer</th>
                  <th className="border px-2 py-1">Invoice No</th>
                  <th className="border px-2 py-1">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-2 py-1">2025-06-18</td>
                  <td className="border px-2 py-1">Amit Patil</td>
                  <td className="border px-2 py-1">INV-0012</td>
                  <td className="border px-2 py-1">₹12,500</td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      case 'purchases':
        return (
          <div>
            <h2 className="text-xl font-bold text-yellow-800 mb-4">🛒 Purchase Report</h2>
            <table className="w-full table-auto border-collapse text-sm">
              <thead className="bg-yellow-200 text-yellow-900">
                <tr>
                  <th className="border px-2 py-1">Date</th>
                  <th className="border px-2 py-1">Supplier</th>
                  <th className="border px-2 py-1">Gold (g)</th>
                  <th className="border px-2 py-1">Cost</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-2 py-1">2025-06-17</td>
                  <td className="border px-2 py-1">Raj Traders</td>
                  <td className="border px-2 py-1">100g</td>
                  <td className="border px-2 py-1">₹5,00,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      case 'stock':
        return (
          <div>
            <h2 className="text-xl font-bold text-yellow-800 mb-4">📦 Stock Summary</h2>
            <ul className="text-sm space-y-2 text-yellow-900">
              <li>💎 Gold in Stock: <strong>420g</strong></li>
              <li>💍 Ornaments in Stock: <strong>82 Items</strong></li>
              <li>⚠️ Low Stock Items: <strong>4</strong></li>
            </ul>
          </div>
        );
      case 'loans':
        return (
          <div>
            <h2 className="text-xl font-bold text-yellow-800 mb-4">💰 Gold Loans / Dues</h2>
            <table className="w-full table-auto border-collapse text-sm">
              <thead className="bg-yellow-200 text-yellow-900">
                <tr>
                  <th className="border px-2 py-1">Customer</th>
                  <th className="border px-2 py-1">Loan Amount</th>
                  <th className="border px-2 py-1">Outstanding</th>
                  <th className="border px-2 py-1">Due Date</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-2 py-1">Sneha Kadam</td>
                  <td className="border px-2 py-1">₹40,000</td>
                  <td className="border px-2 py-1">₹10,000</td>
                  <td className="border px-2 py-1">2025-07-05</td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      case 'schemes':
        return (
          <div>
            <h2 className="text-xl font-bold text-yellow-800 mb-4">📊 Bishi / Investment Schemes</h2>
            <table className="w-full table-auto border-collapse text-sm">
              <thead className="bg-yellow-200 text-yellow-900">
                <tr>
                  <th className="border px-2 py-1">Customer</th>
                  <th className="border px-2 py-1">Monthly Amount</th>
                  <th className="border px-2 py-1">Paid Months</th>
                  <th className="border px-2 py-1">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-2 py-1">Manish Rathi</td>
                  <td className="border px-2 py-1">₹2,000</td>
                  <td className="border px-2 py-1">8/12</td>
                  <td className="border px-2 py-1">Active</td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      default:
        return <p>Select a report from the left side panel</p>;
    }
  };

  const reportButtons = [
    { label: 'Sales', key: 'sales' },
    { label: 'Purchases', key: 'purchases' },
    { label: 'Stock', key: 'stock' },
    { label: 'Loans & Dues', key: 'loans' },
    { label: 'Schemes', key: 'schemes' }
  ];

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="w-48 bg-yellow-700 text-white p-4 rounded-l-xl space-y-3">
        {reportButtons.map(({ label, key }) => (
          <button
            key={key}
            onClick={() => setSelectedReport(key)}
            className={`w-full text-left px-3 py-2 rounded ${
              selectedReport === key ? 'bg-yellow-500 font-bold' : 'hover:bg-yellow-600'
            }`}
          >
            {label}
          </button>
        ))}
      </aside>

      {/* Report Content */}
      <main className="flex-1 bg-white p-6 rounded-r-xl shadow-inner overflow-y-auto">
        {renderReport()}
      </main>
    </div>
  );
}

export default Reports;
