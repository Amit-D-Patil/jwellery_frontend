import express from 'express';
import mongoose from 'mongoose';
import Bhishi from '../models/Bhishi.js';
import Customer from '../models/Customer.js';


const router = express.Router();

// Create a new Bhishi account for a customer
router.post('/', async (req, res) => {
  try {
    const { customerId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ message: 'Invalid customer ID' });
    }

    // Check if the customer already has a Bhishi account
    const existingBhishi = await Bhishi.findOne({ customer: customerId });
    if (existingBhishi) {
      return res.status(400).json({ message: 'Customer already has a Bhishi account' });
    }

    // Create and save the new Bhishi account
    const newBhishi = new Bhishi({ customer: customerId, balance: 0, transactions: [] });
    await newBhishi.save();

    res.status(201).json(newBhishi);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating Bhishi account', error: error.message });
  }
});


// Get all Bhishis with search and pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      const customers = await Customer.find({ name: { $regex: search, $options: 'i' } }).select('_id');
      const customerIds = customers.map(c => c._id);
      query = { customer: { $in: customerIds } };
    }

    const bhishis = await Bhishi.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'customers',
          localField: 'customer',
          foreignField: '_id',
          as: 'customer',
        },
      },
      { $unwind: '$customer' },
      {
        $project: {
          _id: 1,
          'customer.name': 1,
          'customer._id': 1, // Include customer ID
          balance: 1, // Use the actual balance field
          createdAt: 1, // Use the actual createdAt field
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) },
    ]);

    const totalBhishis = await Bhishi.countDocuments(query);
    const totalPages = Math.ceil(totalBhishis / limit);

    res.json({
      data: bhishis.map(b => ({ ...b, status: b.balance > 0 ? 'Active' : 'Inactive' })), // Dynamically add status
      totalPages,
      currentPage: parseInt(page),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching Bhishis', error: error.message });
  }
});

// Get Bhishi details for a customer
router.get('/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ message: 'Invalid customer ID' });
    }

    let bhishi = await Bhishi.findOne({ customer: customerId }).populate('customer', 'name');

    if (!bhishi) {
      return res.status(404).json({ message: 'Bhishi account not found for this customer.' });
    }

    // Sort transactions by date in descending order
    bhishi.transactions.sort((a, b) => b.date - a.date);

    res.json(bhishi);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching Bhishi details', error: error.message });
  }
});

// Deposit into Bhishi account
router.post('/:customerId/deposit', async (req, res) => {
  try {
    const { customerId } = req.params;
    const { amount, notes } = req.body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ message: 'Valid deposit amount is required' });
    }
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ message: 'Invalid customer ID' });
    }

    let bhishi = await Bhishi.findOne({ customer: customerId });

    if (!bhishi) {
      return res.status(404).json({ message: 'Bhishi account not found' });
    }

    bhishi.balance += amount;
    bhishi.transactions.push({
      type: 'deposit',
      amount,
      notes,
      date: new Date(),
    });

    await bhishi.save();
    res.status(201).json(bhishi);
  } catch (error) {
    res.status(500).json({ message: 'Server error processing deposit', error: error.message });
  }
});

// Redeem from Bhishi account
router.post('/:customerId/redeem', async (req, res) => {
  try {
    const { customerId } = req.params;
    const { amount, notes } = req.body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ message: 'Valid redeem amount is required' });
    }
     if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ message: 'Invalid customer ID' });
    }

    const bhishi = await Bhishi.findOne({ customer: customerId });

    if (!bhishi) {
      return res.status(404).json({ message: 'Bhishi account not found for this customer' });
    }

    if (bhishi.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance for redemption' });
    }

    bhishi.balance -= amount;
    bhishi.transactions.push({
      type: 'redeem',
      amount,
      notes,
      date: new Date(),
    });

    await bhishi.save();
    res.json(bhishi);
  } catch (error) {
    res.status(500).json({ message: 'Server error processing redemption', error: error.message });
  }
});

export default router;
