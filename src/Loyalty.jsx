import React, { useState } from 'react';

const dummyCustomers = [
  { id: 1, name: "Amit Patil", points: 120, totalPurchase: 150000, lastUpdated: "2025-06-18" },
  { id: 2, name: "Sneha Joshi", points: 300, totalPurchase: 250000, lastUpdated: "2025-06-12" },
  { id: 3, name: "Rajesh Kulkarni", points: 90, totalPurchase: 85000, lastUpdated: "2025-06-10" }
];

const Loyalty = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [history, setHistory] = useState([]);

  const handleSearch = () => {
    const found = dummyCustomers.find(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toString() === searchTerm
    );
    setSelectedCustomer(found || null);
  };

  const addPoints = (type) => {
    if (!selectedCustomer) return;
    let pointsToAdd = 0;

    if (type === 'purchase') pointsToAdd = 50;
    else if (type === 'loan') pointsToAdd = 30;
    else if (type === 'bishi') pointsToAdd = 20;

    const updatedCustomer = {
      ...selectedCustomer,
      points: selectedCustomer.points + pointsToAdd,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    setSelectedCustomer(updatedCustomer);
    setHistory([...history, { type: `+${pointsToAdd}`, desc: `${type} reward`, date: new Date().toLocaleDateString() }]);
  };

  const redeemPoints = () => {
    if (!selectedCustomer || selectedCustomer.points < 50) return alert("Minimum 50 points required to redeem.");
    const updatedCustomer = {
      ...selectedCustomer,
      points: selectedCustomer.points - 50,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    setSelectedCustomer(updatedCustomer);
    setHistory([...history, { type: `-50`, desc: "Redeemed", date: new Date().toLocaleDateString() }]);
  };

  return (
    <div className="bg-white p-6 rounded shadow-md w-full">
      <h2 className="text-xl font-bold mb-4 text-yellow-700">🎁 Loyalty Program</h2>

      {/* Search */}
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Search by name or ID"
          className="border p-2 rounded w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="bg-yellow-700 text-white px-4 py-2 rounded" onClick={handleSearch}>Search</button>
      </div>

      {/* Customer Details */}
      {selectedCustomer ? (
        <div className="border p-4 rounded bg-yellow-50 mb-4">
          <h3 className="font-bold text-lg text-yellow-800">{selectedCustomer.name}</h3>
          <p className="text-sm">Customer ID: {selectedCustomer.id}</p>
          <p className="text-sm">Total Purchase: ₹{selectedCustomer.totalPurchase.toLocaleString()}</p>
          <p className="text-sm">Current Points: {selectedCustomer.points}</p>
          <p className="text-sm mb-2">Last Updated: {selectedCustomer.lastUpdated}</p>

          {/* Actions */}
          <div className="flex gap-2">
            <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded" onClick={() => addPoints('purchase')}>Add for Purchase</button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded" onClick={() => addPoints('loan')}>Add for Loan Repayment</button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded" onClick={() => addPoints('bishi')}>Add for Bishi</button>
            <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded" onClick={redeemPoints}>Redeem 50 Points</button>
          </div>
        </div>
      ) : (
        <p className="text-gray-500 italic">Search to view loyalty info.</p>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold text-sm mb-2 text-yellow-600">Loyalty Point Activity</h4>
          <ul className="list-disc ml-6 text-sm space-y-1">
            {history.map((item, i) => (
              <li key={i}>{item.date} - {item.desc} ({item.type})</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Loyalty;
