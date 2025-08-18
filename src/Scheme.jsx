import React, { useState } from 'react';

function Scheme() {
  const [activeTab, setActiveTab] = useState('bishi');

  const renderRightPanel = () => {
    switch (activeTab) {
      case 'bishi':
        return (
          <div>
            <h2 className="text-xl font-bold mb-2 text-yellow-800">Bishi Scheme (Monthly Investment)</h2>
            <p className="mb-4 text-sm text-zinc-700">Track and manage customer's Bishi scheme investments.</p>
            <div className="space-y-3">
              <input type="text" placeholder="Enter Mobile Number or Customer ID" className="border p-2 rounded w-full" />
              <input type="number" placeholder="Monthly Amount (₹)" className="border p-2 rounded w-full" />
              <button className="bg-yellow-700 text-white px-4 py-2 rounded hover:bg-yellow-800">Submit Investment</button>
            </div>
          </div>
        );
      case 'loan':
        return (
          <div>
            <h2 className="text-xl font-bold mb-2 text-yellow-800">Gold Loan Management</h2>
            <p className="mb-4 text-sm text-zinc-700">Issue, manage, and track gold loans based on registered customers.</p>
            <div className="space-y-3">
              <input type="text" placeholder="Customer Mobile or ID" className="border p-2 rounded w-full" />
              <input type="number" placeholder="Loan Amount (₹)" className="border p-2 rounded w-full" />
              <input type="text" placeholder="Ornament Details (Weight, Type)" className="border p-2 rounded w-full" />
              <button className="bg-yellow-700 text-white px-4 py-2 rounded hover:bg-yellow-800">Issue Loan</button>
            </div>
          </div>
        );
      case 'billing':
        return (
          <div>
            <h2 className="text-xl font-bold mb-2 text-yellow-800">Loan Billing</h2>
            <p className="mb-4 text-sm text-zinc-700">Create and manage gold loan bills with interest and due calculation.</p>
            <div className="space-y-3">
              <input type="text" placeholder="Customer ID" className="border p-2 rounded w-full" />
              <input type="number" placeholder="Payment Amount (₹)" className="border p-2 rounded w-full" />
              <input type="text" placeholder="Remarks" className="border p-2 rounded w-full" />
              <button className="bg-yellow-700 text-white px-4 py-2 rounded hover:bg-yellow-800">Generate Bill</button>
            </div>
          </div>
        );
      case 'dues':
        return (
          <div>
            <h2 className="text-xl font-bold mb-2 text-yellow-800">Pending Dues</h2>
            <p className="mb-4 text-sm text-zinc-700">Check and update dues related to customer's gold loan or bishi schemes.</p>
            <div className="space-y-3">
              <input type="text" placeholder="Customer ID or Mobile" className="border p-2 rounded w-full" />
              <button className="bg-yellow-700 text-white px-4 py-2 rounded hover:bg-yellow-800">Fetch Dues</button>
              {/* Future: Show dues table */}
            </div>
          </div>
        );
      case 'investments':
        return (
          <div>
            <h2 className="text-xl font-bold mb-2 text-yellow-800">Customer Investment Summary</h2>
            <p className="mb-4 text-sm text-zinc-700">Overview of customer's investment and loan history.</p>
            <div className="space-y-3">
              <input type="text" placeholder="Customer ID / Mobile" className="border p-2 rounded w-full" />
              <button className="bg-yellow-700 text-white px-4 py-2 rounded hover:bg-yellow-800">Get Summary</button>
            </div>
          </div>
        );
      default:
        return <div>Select a feature from the left panel.</div>;
    }
  };

  return (
    <div className="flex h-full">
      {/* Left Side Navigation */}
      <aside className="w-64 bg-yellow-200 p-4 border-r border-yellow-300">
        <h3 className="text-lg font-bold mb-4 text-yellow-900">Scheme Module</h3>
        <nav className="flex flex-col gap-3 text-sm font-medium">
          <button onClick={() => setActiveTab('bishi')} className={`p-2 rounded ${activeTab === 'bishi' ? 'bg-yellow-600 text-white' : 'hover:bg-yellow-300'}`}>📅 Bishi Scheme</button>
          <button onClick={() => setActiveTab('loan')} className={`p-2 rounded ${activeTab === 'loan' ? 'bg-yellow-600 text-white' : 'hover:bg-yellow-300'}`}>💰 Gold Loan</button>
          <button onClick={() => setActiveTab('billing')} className={`p-2 rounded ${activeTab === 'billing' ? 'bg-yellow-600 text-white' : 'hover:bg-yellow-300'}`}>🧾 Loan Billing</button>
          <button onClick={() => setActiveTab('dues')} className={`p-2 rounded ${activeTab === 'dues' ? 'bg-yellow-600 text-white' : 'hover:bg-yellow-300'}`}>📄 Pending Dues</button>
          <button onClick={() => setActiveTab('investments')} className={`p-2 rounded ${activeTab === 'investments' ? 'bg-yellow-600 text-white' : 'hover:bg-yellow-300'}`}>📊 Investment Summary</button>
        </nav>
      </aside>

      {/* Right Side Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {renderRightPanel()}
      </main>
    </div>
  );
}

export default Scheme;
