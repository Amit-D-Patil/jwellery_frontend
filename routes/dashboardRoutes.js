
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Customer from '../models/Customer.js';
import Invoice from '../models/Invoice.js';
import GoldLoan from '../models/GoldLoan.js';
import Inventory from '../models/Inventory.js'; // Import Inventory model

const router = express.Router();

// @route   GET api/dashboard/stats
// @desc    Get dashboard stats
// @access  Private
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        const totalCustomers = await Customer.countDocuments();
        const totalInvoices = await Invoice.countDocuments();

        const pendingDues = await Invoice.aggregate([
            { $match: { status: { $ne: 'paid' } } },
            { $group: { _id: null, total: { $sum: '$dueAmount' } } },
        ]);

        const goldLoanSummary = await GoldLoan.aggregate([
            { $match: { status: 'active' } },
            { $group: { _id: null, total: { $sum: '$remainingAmount' } } },
        ]);

        res.json({
            totalCustomers,
            totalInvoices,
            pendingDues: pendingDues.length > 0 ? pendingDues[0].total : 0,
            goldLoanSummary: goldLoanSummary.length > 0 ? goldLoanSummary[0].total : 0,
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/dashboard/sales-overview
// @desc    Get sales overview
// @access  Private
router.get('/sales-overview', authenticateToken, async (req, res) => {
    try {
        const salesData = await Invoice.aggregate([
            {
                $group: {
                    _id: { $month: '$date' },
                    sales: { $sum: '$totalAmount' },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const formattedSalesData = salesData.map(item => ({
            month: monthNames[item._id - 1],
            sales: item.sales,
        }));

        res.json(formattedSalesData);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/dashboard/stock-levels
// @desc    Get stock levels by item type
// @access  Private
router.get('/stock-levels', authenticateToken, async (req, res) => {
    try {
        const stockData = await Inventory.aggregate([
            {
                $group: {
                    _id: '$itemType',
                    totalQuantity: { $sum: '$quantity' },
                },
            },
        ]);

        const totalStock = stockData.reduce((acc, item) => acc + item.totalQuantity, 0);

        if (totalStock === 0) {
            return res.json([]);
        }

        // Define a consistent color map for the pie chart
        const colorMap = {
            Gold: '#FFD700',
            Silver: '#C0C0C0',
            Diamond: '#B9F2FF',
            Platinum: '#E5E4E2',
            Other: '#FF6B6B',
        };

        const formattedStockData = stockData.map(item => ({
            name: item._id,
            value: parseFloat(((item.totalQuantity / totalStock) * 100).toFixed(2)),
            color: colorMap[item._id] || colorMap['Other'],
        }));

        res.json(formattedStockData);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/dashboard/loan-repayments
// @desc    Get loan repayments
// @access  Private
router.get('/loan-repayments', authenticateToken, async (req, res) => {
    try {
        const loanData = await GoldLoan.aggregate([
            { $unwind: '$repayments' },
            {
                $group: {
                    _id: { $month: '$repayments.date' },
                    repayments: { $sum: '$repayments.amount' },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const formattedLoanData = loanData.map(item => ({
            month: monthNames[item._id - 1],
            repayments: item.repayments,
        }));

        res.json(formattedLoanData);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

export default router;
