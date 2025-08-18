import React, { useState } from 'react';
import Lottie from 'lottie-react';
import axios from 'axios';

import customerLottie from './assets/lotties/customerLottie.json';

import AddCustomer from './AddCustomer';
import CreateInvoice from './CreateInvoice';
import AddNewPurchase from './AddNewPurchase';

import CRM from './CRM';
import Scheme from './Scheme';
import Inventory from './Inventory';
import Billing from './Billing';
import Reports from './Reports';
import Loyalty from './Loyalty';
import BlackWhite from './BlackWhite';
import { BACKEND_URL } from './lib/config';

function App() {
  const [activeModule, setActiveModule] = useState('Dashboard');
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [loginError, setLoginError] = useState('');

  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [showAddPurchase, setShowAddPurchase] = useState(false);

  const menuItems = [
    { label: 'Dashboard', key: 'Dashboard', icon: '🏠' },
    { label: 'CRM', key: 'CRM', icon: '👥' },
    // { label: 'Scheme / Gold Loan', key: 'GoldLoan', icon: '💰' },
    { label: 'Inventory', key: 'Inventory', icon: '📦' },
    { label: 'Billing', key: 'Billing', icon: '🧾' },
    // { label: 'Reports', key: 'Reports', icon: '📊' },
    // { label: 'Loyalty Program', key: 'Loyalty', icon: '🎁' },
    // { label: 'Black & White Mgmt', key: 'BlackWhite', icon: '⚫⚪' },
  ];

  const handleLogin = (role, username, password) => {
    if (role === 'admin' && username === 'admin' && password === 'admin123') {
      setIsLoggedIn(true);
      setUserRole('admin');
      setShowLogin(false);
      setLoginError('');
    } else if (role === 'user' && username === 'user' && password === 'user123') {
      setIsLoggedIn(true);
      setUserRole('user');
      setShowLogin(false);
      setLoginError('');
    } else {
      setLoginError('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole('');
    setActiveModule('Dashboard');
  };

  const handleSaveInvoice = (data) => {
    console.log('Invoice Data:', data);
    setShowCreateInvoice(false);
  };

  const handleSaveCustomer = async (customerData) => {
    try {
      const res = await axios.post(BACKEND_URL+'/api/customers', customerData);
      console.log('✅ Customer saved:', res.data);
      alert('Customer added successfully!');
    } catch (err) {
      console.error('❌ Error saving customer:', err);
      alert('Failed to save customer');
    }
  };

  const renderModuleContent = () => {
    switch (activeModule) {
      case 'CRM':
        return <CRM />;
      case 'GoldLoan':
        return <Scheme />;
      case 'Inventory':
        return <Inventory />;
      case 'Billing':
        return <Billing />;
      case 'Reports':
        return <Reports />;
      case 'Loyalty':
        return <Loyalty />;
      case 'BlackWhite':
        return <BlackWhite />;
      default:
        return (
          <div className="bg-white rounded-xl shadow p-4 flex flex-col md:flex-row items-center gap-6 mb-6">
            <div className="w-40 md:w-60">
              <Lottie animationData={customerLottie} loop={true} />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-yellow-800">Welcome to Renuka Jewels Dashboard</h2>
              <p className="text-sm text-zinc-600 mt-2">
                Manage your gold stock, customer records, and billing seamlessly with our smart dashboard.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gradient-to-br from-yellow-100 via-yellow-50 to-white text-zinc-800 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-yellow-700 to-yellow-600 text-white shadow">
        <div className="flex items-center gap-3">
          <img src="/rj.jpeg" alt="Shop Logo" className="h-10 w-10 rounded-full bg-white p-1" />
          <span className="font-bold text-xl tracking-wide">Renuka Jewels</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-sm font-semibold">{new Date().toLocaleString()}</span>
          {!isLoggedIn ? (
            <button onClick={() => setShowLogin(true)} className="hover:text-yellow-300">Login</button>
          ) : (
            <div className="flex items-center gap-2">
              <span>{userRole === 'admin' ? 'Admin' : 'User'}</span>
              <button onClick={handleLogout} className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 text-xs">
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4">Login</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleLogin(e.target.role.value, e.target.username.value, e.target.password.value);
            }}>
              <select name="role" className="w-full border p-2 mb-3">
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
              <input name="username" placeholder="Username" className="w-full border p-2 mb-3" required />
              <input name="password" type="password" placeholder="Password" className="w-full border p-2 mb-3" required />
              {loginError && <p className="text-red-600">{loginError}</p>}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowLogin(false)} className="bg-gray-300 px-3 py-1 rounded">Cancel</button>
                <button type="submit" className="bg-yellow-700 text-white px-3 py-1 rounded hover:bg-yellow-800">Login</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Body */}
      {!isLoggedIn ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-8 mt-24 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold mb-4 text-yellow-800">Welcome to Renuka Jewels</h2>
            <p className="mb-6 text-zinc-600">Please login as Admin or User to access the dashboard and features.</p>
            <button className="bg-yellow-700 hover:bg-yellow-800 text-white py-2 px-6 rounded shadow" onClick={() => setShowLogin(true)}>
              Login
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside className="w-64 bg-gradient-to-b from-yellow-700 to-yellow-800 text-white py-6 px-4">
            <nav className="space-y-3 text-sm font-medium">
              {menuItems.map(({ label, key, icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveModule(key)}
                  className={`flex items-center w-full gap-3 p-2 rounded transition ${
                    activeModule === key ? 'bg-yellow-500 text-white font-bold' : 'hover:bg-yellow-600'
                  }`}
                >
                  <span>{icon}</span>
                  {label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1 p-6 overflow-y-auto">
            {renderModuleContent()}

            {activeModule === 'Dashboard' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-4 space-y-2 text-sm text-yellow-800 shadow-sm">
                    <div>Total Customers: <span className="float-right font-bold">0</span></div>
                    <div>Total Gold Stock: <span className="float-right font-bold">0 gm</span></div>
                    <div>Today's Sales: <span className="float-right font-bold">₹0</span></div>
                    <div>Outstanding Loans: <span className="float-right font-bold">₹0</span></div>
                    <div>Monthly Revenue: <span className="float-right font-bold">₹0</span></div>
                    <div>Low Stock Alerts: <span className="float-right font-bold">0</span></div>
                  </div>

                  <div className="bg-yellow-100 border border-yellow-200 rounded p-4 space-y-3 shadow-sm">
                    <button className="w-full bg-yellow-700 hover:bg-yellow-800 text-white py-2 px-4 rounded shadow" onClick={() => setShowAddPurchase(true)}>
                      ➕ Add New Purchase
                    </button>
                    <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded shadow">
                      🔁 Convert Raw Gold
                    </button>
                    <button className="w-full bg-yellow-700 hover:bg-yellow-800 text-white py-2 px-4 rounded shadow" onClick={() => setShowCreateInvoice(true)}>
                      🧾 Create Invoice
                    </button>
                    <button className="w-full bg-yellow-700 hover:bg-yellow-800 text-white py-2 px-4 rounded shadow" onClick={() => setShowAddCustomer(true)}>
                      🧍 Add Customer
                    </button>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded p-4 shadow-sm">
                    <h3 className="text-sm font-semibold mb-2">Recent Activity</h3>
                    <ul className="list-disc ml-4 space-y-1 text-sm text-yellow-800">
                      <li>Purchases made</li>
                      <li>Stock added/converted</li>
                      <li>Sales recorded</li>
                      <li>Scheme payments received</li>
                      <li>New customers added</li>
                    </ul>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      )}

      {/* Modals */}
      {isLoggedIn && showAddCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg">
            <AddCustomer
              onClose={() => setShowAddCustomer(false)}
              onSave={handleSaveCustomer}
            />
          </div>
        </div>
      )}
      {isLoggedIn && showCreateInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl">
            <CreateInvoice onClose={() => setShowCreateInvoice(false)} onSave={handleSaveInvoice} />
          </div>
        </div>
      )}
      {isLoggedIn && showAddPurchase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg">
            <AddNewPurchase onClose={() => setShowAddPurchase(false)} />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-yellow-700 text-yellow-100 text-xs flex justify-between items-center px-6 py-2">
        <div>📞 +91 9503139127 | 7300791657 | 8623909802</div>
        <div><a href="#terms" className="hover:underline">Terms</a> | <a href="#privacy" className="hover:underline">Privacy</a></div>
        <div>💻 v1.0.0</div>
      </footer>
    </div>
  );
}

export default App;
