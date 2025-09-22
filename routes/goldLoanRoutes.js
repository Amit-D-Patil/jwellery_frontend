import express from 'express';
import GoldLoan from '../models/GoldLoan.js';
import Customer from '../models/Customer.js';

const router = express.Router();

// POST: Create new gold loan
router.post('/', async (req, res) => {
  try {
    const { customerId, loanAmount, interestRate, tenure, collateralType, purity, weight, marketValue, emi } = req.body;
    const collateralDetails = {
      collateralType,
      purity,
      weight,
      marketValue
    }
    // Verify customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(400).json({ message: 'Customer not found' });
    }

    // Validate loan amount against items value (typically 60-80% of total value)
    const maxLoanAmount = marketValue * 0.8; // 80% of total value
    if (loanAmount > maxLoanAmount) {
      return res.status(400).json({
        message: `Loan amount exceeds maximum allowed value (${maxLoanAmount})`
      });
    }

    const loan = new GoldLoan({
      customer: customerId,
      loanAmount,
      interestRate,
      tenure,
      remainingAmount: loanAmount + (loanAmount * interestRate * (tenure / 12)) / 100, // Principal + Simple Interest
      collateralDetails,
      emi
    });

    const savedLoan = await loan.save();
    const populatedLoan = await GoldLoan.findById(savedLoan._id).populate('customer');
    res.status(201).json(populatedLoan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// GET: Fetch all loans or filter by customer
router.get("/", async (req, res) => {
  try {
    const { customerId, status } = req.query;
    const query = {};

    if (customerId) query.customer = customerId;
    if (status) query.status = status;

    const loans = await GoldLoan.find(query)
      .populate("customer")
      .sort({ createdAt: -1 })
      .lean();

    const safeLoans = loans.map(loan => ({
      ...loan,
      customer: loan.customer || {
        name: "Deleted User",
        mobile: "Deleted User",
        email: "Deleted User",
      },
    }));

    res.json(safeLoans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET: Get a single loan by ID
router.get('/:id', async (req, res) => {
  try {
    const loan = await GoldLoan.findById(req.params.id).populate('customer');
    if (!loan) return res.status(404).json({ message: 'Loan not found' });
    const totalRepaid = loan.repayments.reduce((sum, r) => sum + r.amount, 0);

    res.json({ ...loan.toObject(), totalRepaid });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST: Add a repayment
router.post('/:id/repayments', async (req, res) => {
  try {
    const { amount, date = new Date() } = req.body;
    const loan = await GoldLoan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    if (loan.status !== 'active') {
      return res.status(400).json({ message: `Cannot add repayment to ${loan.status} loan` });
    }

    // --- Round helper ---
    const round2 = (num) => Math.round(num * 100) / 100;

    // Just reduce repayment from remaining balance
    let remainingBalance = round2(loan.remainingAmount - amount);
    if (remainingBalance < 0.01) remainingBalance = 0;

    // Add repayment record
    loan.repayments.push({
      date,
      amount: round2(amount),
      interestPaid: 0,      // not tracked in simple EMI
      principalPaid: 0,     // not tracked
      remainingBalance
    });

    // Update loan
    loan.remainingAmount = remainingBalance;
    if (remainingBalance === 0) {
      loan.status = 'closed';
    }

    // Set next payment due date
    loan.nextPaymentDue = new Date(date);
    loan.nextPaymentDue.setMonth(loan.nextPaymentDue.getMonth() + 1);

    const updatedLoan = await loan.save();
    res.json(updatedLoan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});




// PUT: Update loan status (for renewal or default)
router.put('/:id/status', async (req, res) => {
  try {
    const { status, reason } = req.body;
    const loan = await GoldLoan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    if (!['active', 'closed', 'defaulted', 'renewed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    loan.status = status;
    loan.updatedAt = new Date();

    const updatedLoan = await loan.save();
    res.json(updatedLoan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const loan = await GoldLoan.findByIdAndDelete(req.params.id);
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }
    res.json({ message: 'Loan deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;