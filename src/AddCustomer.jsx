import React, { useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_URL } from "./lib/config";

function AddCustomer({ onClose, onSave, existingCustomer }) {
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    address: "",
    dob: "",
    gender: "",
    notes: ""
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (existingCustomer) {
      setForm({
        name: existingCustomer.name || "",
        mobile: existingCustomer.mobile || "",
        email: existingCustomer.email || "",
        address: existingCustomer.address || "",
        dob: existingCustomer.dob ? existingCustomer.dob.slice(0, 10) : "",
        gender: existingCustomer.gender || "",
        notes: existingCustomer.notes || ""
      });
    }
  }, [existingCustomer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = async () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.mobile.trim()) {
      errs.mobile = "Mobile number is required";
    } else if (!/^\d{10}$/.test(form.mobile.trim())) {
      errs.mobile = "Enter a valid 10-digit mobile number";
    } else if (!existingCustomer) {
      try {
        const res = await axios.get(BACKEND_URL+"/api/customers");
        const exists = res.data.find((c) => c.mobile === form.mobile.trim());
        if (exists) errs.mobile = "Mobile number already exists";
      } catch (err) {
        console.error("Mobile check error:", err);
      }
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = await validate();
    setErrors(errs);

    if (Object.keys(errs).length === 0) {
      try {
        const formData = {
          ...form,
          dob: form.dob || undefined
        };

        let response;
        if (existingCustomer) {
          response = await axios.put(
            BACKEND_URL+`/api/customers/${existingCustomer._id}`,
            formData
          );
        } else {
          response = await axios.post(BACKEND_URL+"/api/customers", formData);
        }

        console.log("✅ Customer saved:", response.data);
        if (onSave) {
          try {
            onSave(response.data);
          } catch (err) {
            console.error("❌ Error in onSave:", err);
          }
        }
        if (onClose) onClose();
      } catch (error) {
        console.error("❌ Error saving customer:", error);
        console.log("🔍 Axios Response:", error.response);
        setErrors({
          submit: error.response?.data?.message || "Failed to save customer. Please try again."
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="relative w-full max-w-lg mx-4 sm:mx-auto bg-white rounded-lg shadow-lg overflow-y-auto max-h-[90vh]">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl font-bold focus:outline-none"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <form className="p-6" onSubmit={handleSubmit} autoComplete="off">
          <h2 className="text-2xl font-semibold mb-4 text-center">
            {existingCustomer ? "Edit Customer" : "Customer Registration"}
          </h2>

          {errors.submit && <p className="text-red-500 text-sm mb-3">{errors.submit}</p>}

          {/* Name */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Name<span className="text-red-500">*</span></label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${errors.name ? "border-red-500" : "border-gray-300"}`}
              placeholder="Enter customer name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Mobile */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Mobile Number<span className="text-red-500">*</span></label>
            <input
              type="tel"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${errors.mobile ? "border-red-500" : "border-gray-300"}`}
              placeholder="10-digit mobile number"
              maxLength={10}
            />
            {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring"
              placeholder="Enter email address"
            />
          </div>

          {/* Address */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Address</label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring"
              placeholder="Enter address"
              rows={2}
            />
          </div>

          {/* DOB + Gender */}
          <div className="mb-4 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={form.dob}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring"
              />
            </div>
            <div className="flex-1">
              <label className="block text-gray-700 mb-1">Gender</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring"
              placeholder="Additional notes"
              rows={2}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              {existingCustomer ? "Save Changes" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddCustomer;
