import axios from "axios"
import toast from "react-hot-toast"

const API_BASE_URL = "https://jwellery-backend-git-dev-amit-patils-projects-e1e3bb9c.vercel.app/api"

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
    },
    withCredentials: true, // This is important for sending/receiving cookies
})

// Request interceptor
api.interceptors.request.use(
    (config) => {
        return config
    },
    (error) => {
        return Promise.reject(error)
    },
)

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            window.location.href = "/login"
            toast.error("Session expired. Please login again.")
        }
        return Promise.reject(error)
    },
)

// Auth API
export const authAPI = {
    login: (credentials) => api.post("/auth/login", credentials),
    verifyToken: () => api.get("/auth/verify"),
    logout: () => api.post("/auth/logout"),
}

// Customer API
export const customerAPI = {
    getAll: (params) => api.get("/customers", { params }),
    getById: (id, history) => api.get(`/customers/${id}?history=${history}`),
    create: (data) => api.post("/customers", data),
    update: (id, data) => api.put(`/customers/${id}`, data),
    delete: (id) => api.delete(`/customers/${id}`),
}

// Inventory API
export const inventoryAPI = {
    getAll: (params) => api.get("/inventory", { params }),
    getById: (id) => api.get(`/inventory/${id}`),
    create: (data) => api.post("/inventory", data),
    update: (id, data) => api.put(`/inventory/${id}`, data),
    delete: (id) => api.delete(`/inventory/${id}`),
}

// Invoice API
export const invoiceAPI = {
    getAll: (params) => api.get("/invoices", { params }),
    getById: (id) => api.get(`/invoices/${id}`),
    create: (data) => api.post("/invoices", data),
    update: (id, data) => api.put(`/invoices/${id}`, data),
    delete: (id) => api.delete(`/invoices/${id}`),
    downloadPDF: (id) => api.get(`/invoices/${id}/pdf`, { responseType: "blob" }),
}

// Gold Loan API
export const goldLoanAPI = {
    getAll: (params) => api.get("/gold-loans", { params }),
    getById: (id) => api.get(`/gold-loans/${id}`),
    create: (data) => api.post("/gold-loans", data),
    update: (id, data) => api.put(`/gold-loans/${id}`, data),
    delete: (id) => api.delete(`/gold-loans/${id}`),
    getRepayments: (id) => api.get(`/gold-loans/${id}/repayments`),
    addRepayment: (id, data) => api.post(`/gold-loans/${id}/repayments`, data),
}
export const bhishiAPI = {
    get: (customerId) => api.get(`/bhishis/${customerId}`),
    deposit: (customerId, data) => api.post(`/bhishis/${customerId}/deposit`, data),
    redeem: (customerId, data) => api.post(`/bhishis/${customerId}/redeem`, data),
}

// Dashboard API
export const dashboardAPI = {
    getStats: () => api.get("/dashboard/stats"),
    getSalesOverview: () => api.get("/dashboard/sales-overview"),
    getStockLevels: () => api.get("/dashboard/stock-levels"),
    getLoanRepayments: () => api.get("/dashboard/loan-repayments"),
}

// Reports API
export const reportsAPI = {
    getInventoryReport: (params) => api.get("/reports/inventory", { params }),
    getInvoiceReport: (params) => api.get("/reports/invoices", { params }),
    getGoldLoanReport: (params) => api.get("/reports/gold-loans", { params }),
    downloadReport: (type, params) =>
        api.get(`/reports/${type}/download`, {
            params,
            responseType: "blob",
        }),
}

export default api
