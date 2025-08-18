import React, { useState } from 'react';

function AddNewPurchase({ onClose }) {
  const [purchaseData, setPurchaseData] = useState({
    itemName: '',
    metalType: 'Gold',
    weight: '',
    purity: '22K',
    purchasePricePerGram: '',
    totalCost: '',
    date: new Date().toISOString().split('T')[0],
    vendor: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    const updatedData = {
      ...purchaseData,
      [name]: value,
    };

    // Auto calculate total cost
    if (
      (name === 'weight' || name === 'purchasePricePerGram') &&
      updatedData.weight &&
      updatedData.purchasePricePerGram
    ) {
      updatedData.totalCost = (
        parseFloat(updatedData.weight) * parseFloat(updatedData.purchasePricePerGram)
      ).toFixed(2);
    }

    setPurchaseData(updatedData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Purchase Submitted:', purchaseData);

    // TODO: send to backend / save locally
    alert('Purchase record added!');
    onClose(); // close modal
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold text-yellow-800 mb-4">➕ Add New Purchase</h2>
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Item Name</label>
            <input
              type="text"
              name="itemName"
              value={purchaseData.itemName}
              onChange={handleChange}
              className="w-full border border-yellow-300 px-3 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="e.g. Ring, Necklace"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Metal Type</label>
            <select
              name="metalType"
              value={purchaseData.metalType}
              onChange={handleChange}
              className="w-full border border-yellow-300 px-3 py-2 rounded shadow-sm"
            >
              <option>Gold</option>
              <option>Silver</option>
              <option>Platinum</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Weight (gm)</label>
            <input
              type="number"
              name="weight"
              value={purchaseData.weight}
              onChange={handleChange}
              className="w-full border border-yellow-300 px-3 py-2 rounded shadow-sm"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Purity</label>
            <select
              name="purity"
              value={purchaseData.purity}
              onChange={handleChange}
              className="w-full border border-yellow-300 px-3 py-2 rounded shadow-sm"
            >
              <option>24K</option>
              <option>22K</option>
              <option>18K</option>
              <option>14K</option>
              <option>10K</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Price per Gram (₹)</label>
            <input
              type="number"
              name="purchasePricePerGram"
              value={purchaseData.purchasePricePerGram}
              onChange={handleChange}
              className="w-full border border-yellow-300 px-3 py-2 rounded shadow-sm"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Total Cost (₹)</label>
            <input
              type="text"
              name="totalCost"
              value={purchaseData.totalCost}
              readOnly
              className="w-full bg-yellow-50 border border-yellow-300 px-3 py-2 rounded shadow-sm cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={purchaseData.date}
              onChange={handleChange}
              className="w-full border border-yellow-300 px-3 py-2 rounded shadow-sm"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Vendor / Supplier</label>
            <input
              type="text"
              name="vendor"
              value={purchaseData.vendor}
              onChange={handleChange}
              className="w-full border border-yellow-300 px-3 py-2 rounded shadow-sm"
              placeholder="e.g. Raj Jewellers"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded shadow"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded shadow"
          >
            Save Purchase
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddNewPurchase;
