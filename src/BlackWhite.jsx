import React, { useState } from 'react';

const BlackWhite = () => {
  const [stock, setStock] = useState([
    { id: 1, type: "white", item: "Necklace", weight: 50, date: "2025-06-18" },
    { id: 2, type: "black", item: "Bangle", weight: 30, date: "2025-06-17" }
  ]);
  const [form, setForm] = useState({ item: '', weight: '', type: 'white' });
  const [history, setHistory] = useState([]);

  const handleAddStock = () => {
    if (!form.item || !form.weight) return alert("Please enter item and weight");
    const newEntry = {
      id: Date.now(),
      type: form.type,
      item: form.item,
      weight: parseFloat(form.weight),
      date: new Date().toISOString().split('T')[0]
    };
    setStock([...stock, newEntry]);
    setForm({ item: '', weight: '', type: 'white' });
  };

  const convertStock = (id) => {
    const updated = stock.map(s => {
      if (s.id === id) {
        const newType = s.type === 'black' ? 'white' : 'black';
        setHistory([...history, {
          date: new Date().toLocaleDateString(),
          action: `Converted ${s.item} (${s.weight}g) from ${s.type} to ${newType}`
        }]);
        return { ...s, type: newType, date: new Date().toISOString().split('T')[0] };
      }
      return s;
    });
    setStock(updated);
  };

  const totalWeight = (type) => stock.filter(s => s.type === type)
    .reduce((sum, item) => sum + item.weight, 0);

  return (
    <div className="bg-white p-6 rounded shadow-md w-full">
      <h2 className="text-xl font-bold mb-4 text-yellow-700">⚫⚪ Black & White Stock Management</h2>

      {/* Add New Item */}
      <div className="bg-yellow-50 border rounded p-4 mb-6">
        <h4 className="font-semibold mb-2">Add New Stock Entry</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Item Name"
            value={form.item}
            onChange={(e) => setForm({ ...form, item: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="number"
            placeholder="Weight (g)"
            value={form.weight}
            onChange={(e) => setForm({ ...form, weight: e.target.value })}
            className="border p-2 rounded"
          />
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="border p-2 rounded"
          >
            <option value="white">White</option>
            <option value="black">Black</option>
          </select>
          <button className="bg-yellow-700 text-white px-4 py-2 rounded" onClick={handleAddStock}>
            ➕ Add Stock
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border rounded shadow p-4">
          <h4 className="font-semibold mb-2 text-green-700">White Stock</h4>
          <ul className="text-sm space-y-1">
            {stock.filter(s => s.type === 'white').map(item => (
              <li key={item.id} className="flex justify-between">
                <span>{item.item} ({item.weight}g)</span>
                <button className="text-blue-600 hover:underline text-xs" onClick={() => convertStock(item.id)}>Convert</button>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-gray-500">Total: {totalWeight('white')}g</p>
        </div>

        <div className="bg-white border rounded shadow p-4">
          <h4 className="font-semibold mb-2 text-red-700">Black Stock</h4>
          <ul className="text-sm space-y-1">
            {stock.filter(s => s.type === 'black').map(item => (
              <li key={item.id} className="flex justify-between">
                <span>{item.item} ({item.weight}g)</span>
                <button className="text-blue-600 hover:underline text-xs" onClick={() => convertStock(item.id)}>Convert</button>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-gray-500">Total: {totalWeight('black')}g</p>
        </div>
      </div>

      {/* Conversion History */}
      {history.length > 0 && (
        <div className="bg-yellow-100 border rounded p-4">
          <h4 className="font-semibold mb-2">Conversion History</h4>
          <ul className="list-disc text-sm ml-6">
            {history.map((h, i) => <li key={i}>{h.date} - {h.action}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BlackWhite;
