import React, { useState } from 'react';
import CreateInvoice from '../components/CreateInvoice'; // adjust the path as needed

function Dashboard() {
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const handleSaveInvoice = (data) => {
    console.log("Invoice saved:", data);
    // Later: save to server or show in a table
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gold Shop Dashboard</h1>

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={() => setShowInvoiceModal(true)}
      >
        Create Invoice
      </button>

      {showInvoiceModal && (
        <CreateInvoice
          onClose={() => setShowInvoiceModal(false)}
          onSave={handleSaveInvoice}
        />
      )}
    </div>
  );
}

export default Dashboard;
