import React, { useRef, useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import axios from 'axios';
import { BACKEND_URL } from './lib/config';

function CreateInvoice({ onClose, onSave }) {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [dueAmount, setDueAmount] = useState(0);
  const [form, setForm] = useState({
    customerName: '',
    mobile: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    gst: 3,
    paidAmount: '',
    items: [{ name: '', weight: '', rate: '', makingCharge: '' }],
  });

  const invoiceRef = useRef();

  useEffect(() => {
    axios.get(BACKEND_URL+'/api/customers')
      .then(res => setCustomers(res.data))
      .catch(err => console.error('Failed to fetch customers', err));
  }, []);

  const handleMobileSearch = async (mobile) => {
    try {
      const res = await axios.get(BACKEND_URL + `/api/customers?mobile=${mobile}`);
      if (res.data.length > 0) {
        const customer = res.data[0];
        setSelectedCustomerId(customer._id);
        setForm(prev => ({
          ...prev,
          customerName: customer.name,
          mobile: customer.mobile
        }));
        const totalDue = customer.history?.reduce((acc, h) => acc + (h.dueAmount || 0), 0) || 0;
        setDueAmount(totalDue);
      } else {
        setSelectedCustomerId('');
        setDueAmount(0);
      }
    } catch (err) {
      console.error('Error searching customer:', err);
    }
  };

  useEffect(() => {
    const customer = customers.find(c => c._id === selectedCustomerId);
    if (customer) {
      const totalDue = customer.history?.reduce((acc, h) => acc + (h.dueAmount || 0), 0) || 0;
      setForm(prev => ({
        ...prev,
        customerName: customer.name || '',
        mobile: customer.mobile || ''
      }));
      setDueAmount(totalDue);
    }
  }, [selectedCustomerId]);

  const handleChange = (e, idx = null) => {
    const { name, value } = e.target;
    if (idx !== null) {
      const newItems = [...form.items];
      newItems[idx][name] = value;
      setForm(prev => ({ ...prev, items: newItems }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const addItem = () => {
    setForm(prev => ({
      ...prev,
      items: [...prev.items, { name: '', weight: '', rate: '', makingCharge: '' }]
    }));
  };

  const removeItem = (idx) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx)
    }));
  };

  const calculateTotals = () => {
    const subtotal = form.items.reduce((total, item) => {
      const weight = parseFloat(item.weight) || 0;
      const rate = parseFloat(item.rate) || 0;
      const making = parseFloat(item.makingCharge) || 0;
      return total + weight * rate + making;
    }, 0);
    const gstAmount = subtotal * (form.gst / 100);
    const total = subtotal + gstAmount;
    return { subtotal, gstAmount, total };
  };

  const { subtotal, gstAmount, total } = calculateTotals();

  const handleSave = async () => {
    if (!selectedCustomerId) {
      alert("Please select an existing customer first.");
      return;
    }

    if (form.items.some(item => !item.name || !item.weight || !item.rate)) {
      alert("Please fill in all item details (name, weight, and rate).");
      return;
    }

    try {
      const invoiceData = {
        customerId: selectedCustomerId,
        items: form.items.map(item => ({
          name: item.name,
          weight: parseFloat(item.weight),
          rate: parseFloat(item.rate),
          makingCharge: parseFloat(item.makingCharge) || 0
        })),
        totalAmount: total,
        paidAmount: parseFloat(form.paidAmount || 0),
        gst: parseFloat(form.gst)
      };

      const response = await axios.post(BACKEND_URL+'/api/invoices', invoiceData);
      alert('✅ Invoice saved successfully!');
      if (onSave) onSave(response.data);
      onClose();
    } catch (err) {
      console.error('Error saving invoice:', err);
      const errorMessage = err.response?.data?.message || 'Failed to save invoice';
      alert(`❌ Error: ${errorMessage}`);
    }
  };

  const handleDownload = () => {
    const opt = {
      margin: 0.5,
      filename: `Invoice_${form.mobile}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(invoiceRef.current).save();
  };

  const handlePrint = () => {
    const newWin = window.open('', '_blank');
    newWin.document.write(`<html><head><title>Invoice</title></head><body>${invoiceRef.current.innerHTML}</body></html>`);
    newWin.document.close();
    newWin.print();
    newWin.close();
  };

  const handleWhatsApp = () => {
    const message = `Hello, here’s your invoice from Renuka Jewels. Total: ₹${total.toFixed(2)}. Thank you!`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 space-y-4 overflow-auto max-h-[95vh]">
        <h2 className="text-2xl font-bold text-center">Create Invoice</h2>

        {/* Select Customer */}
        <select
          value={selectedCustomerId}
          onChange={(e) => setSelectedCustomerId(e.target.value)}
          className="border p-2 rounded w-full mb-4"
        >
          <option value="">Select Existing Customer</option>
          {customers.map(c => (
            <option key={c._id} value={c._id}>
              {c.name} - {c.mobile}
            </option>
          ))}
        </select>

        <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            name="customerName"
            placeholder="Customer Name"
            value={form.customerName}
            onChange={handleChange}
            className="border px-3 py-2 rounded"
          />
          <input
            name="mobile"
            placeholder="Mobile Number"
            value={form.mobile}
            onChange={(e) => {
              handleChange(e);
              if (e.target.value.length === 10) {
                handleMobileSearch(e.target.value);
              }
            }}
            maxLength={10}
            className="border px-3 py-2 rounded"
          />
          <input
            type="date"
            name="invoiceDate"
            value={form.invoiceDate}
            onChange={handleChange}
            className="border px-3 py-2 rounded"
          />
          <input
            type="number"
            name="gst"
            placeholder="GST %"
            value={form.gst}
            onChange={handleChange}
            className="border px-3 py-2 rounded"
            min={0}
          />
          <input
            type="number"
            name="paidAmount"
            placeholder="Paid Amount"
            value={form.paidAmount || ''}
            onChange={handleChange}
            className="border px-3 py-2 rounded"
          />
        </form>

        {dueAmount > 0 && (
          <p className="text-red-600 text-sm mt-2">📌 Previous Dues: ₹{dueAmount.toFixed(2)}</p>
        )}

        <h3 className="text-lg font-semibold mt-4">Items</h3>
        {form.items.map((item, idx) => (
          <div key={idx} className="grid grid-cols-1 sm:grid-cols-5 gap-2 mb-2">
            <input name="name" value={item.name || ''} placeholder="Item" onChange={(e) => handleChange(e, idx)} className="border px-2 py-1 rounded" />
            <input name="weight" value={item.weight || ''} placeholder="Weight" type="number" onChange={(e) => handleChange(e, idx)} className="border px-2 py-1 rounded" />
            <input name="rate" value={item.rate || ''} placeholder="Rate" type="number" onChange={(e) => handleChange(e, idx)} className="border px-2 py-1 rounded" />
            <input name="makingCharge" value={item.makingCharge || ''} placeholder="Making" type="number" onChange={(e) => handleChange(e, idx)} className="border px-2 py-1 rounded" />
            <button type="button" onClick={() => removeItem(idx)} className="text-red-600">❌</button>
          </div>
        ))}
        <button type="button" onClick={addItem} className="bg-green-600 text-white px-3 py-1 rounded">➕ Add Item</button>

        {/* Preview */}
        <div className="border p-4 rounded bg-gray-100 text-sm mt-4" ref={invoiceRef}>
          <div className="text-center">
            <h2 className="text-xl font-bold">Renuka Jewels</h2>
            <p><b>GST No : 50EYPPB2240J1ZJ</b> </p>
            <p>Customer: {form.customerName} | Mobile: {form.mobile}</p>
            <p>Invoice Date: {form.invoiceDate}</p>
          </div>
          <table className="w-full border mt-4 text-left">
            <thead className="bg-gray-200">
              <tr>
                <th className="border px-2">Item</th>
                <th className="border px-2">Weight</th>
                <th className="border px-2">Rate</th>
                <th className="border px-2">Making</th>
                <th className="border px-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {form.items.map((item, i) => {
                const amt = (parseFloat(item.weight || 0) * parseFloat(item.rate || 0)) + parseFloat(item.makingCharge || 0);
                return (
                  <tr key={i}>
                    <td className="border px-2">{item.name}</td>
                    <td className="border px-2">{item.weight}</td>
                    <td className="border px-2">₹{item.rate}</td>
                    <td className="border px-2">₹{item.makingCharge}</td>
                    <td className="border px-2 font-semibold">₹{amt.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="text-right mt-4">
            <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
            <p>GST ({form.gst}%): ₹{gstAmount.toFixed(2)}</p>
            <p className="text-lg font-bold">Total: ₹{total.toFixed(2)}</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded">Close</button>
          <button onClick={handlePrint} className="bg-purple-600 text-white px-4 py-2 rounded">🖨️ Print</button>
          <button onClick={handleDownload} className="bg-blue-600 text-white px-4 py-2 rounded">⬇️ Download</button>
          <button onClick={handleWhatsApp} className="bg-green-600 text-white px-4 py-2 rounded">📤 WhatsApp</button>
          <button onClick={handleSave} className="bg-yellow-700 text-white px-4 py-2 rounded">💾 Save Invoice</button>
        </div>
      </div>
    </div>
  );
}

export default CreateInvoice;
