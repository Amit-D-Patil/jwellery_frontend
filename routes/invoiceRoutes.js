import express from 'express';
import Invoice from '../models/Invoice.js';
import Customer from '../models/Customer.js';
import PDFDocument from 'pdfkit';
import { fileURLToPath } from 'url';
import path from 'path';
import Inventory from '../models/Inventory.js';
import { ToWords } from 'to-words';

const router = express.Router();

/**
 * @route   POST /api/invoices
 * @desc    Create a new invoice and update customer history
 */
router.post("/", async (req, res) => {
  try {
    const {
      customer,
      items,
      dueDate,
      paymentMethod = "cash",
      notes = "",
      gst,
      paidAmount = 0,
      date = new Date(),
      amountPaid
    } = req.body;

    // Validate customer
    const customerObj = await Customer.findById(customer);
    if (!customerObj) {
      return res.status(400).json({ message: "Customer not found" });
    }

    // Calculate items & totals
    const itemsWithTotal = items.map((item) => ({
      itemId: item.itemId,
      quantity: item.quantity,
      weight: item.weight,
      pricePerGram: item.pricePerGram,
      makingCharge: item.makingCharge || 0,
      totalPrice: item.weight * item.pricePerGram + (item.makingCharge || 0),
    }));

    const subtotal = itemsWithTotal.reduce((sum, item) => sum + item.totalPrice, 0);
    const gstAmount = (subtotal * gst) / 100;
    const totalAmount = subtotal + gstAmount;
    const dueAmount = totalAmount - paidAmount;
    if (amountPaid > totalAmount) {
      return res.status(400).json({
        message: "Paid amount cannot be greater than the total amount.",
      });
    }

    // Create invoice
    const invoice = new Invoice({
      customer,
      items: itemsWithTotal,
      subtotal,
      gst,
      gstAmount,
      totalAmount,
      paidAmount,
      dueAmount,
      paymentMethod,
      notes,
      date,
      dueDate,
    });

    const savedInvoice = await invoice.save();

    // Update customer history & dues
    await Customer.findByIdAndUpdate(customer, {
      $push: {
        history: {
          invoiceId: savedInvoice._id,
          date: savedInvoice.date,
          totalAmount,
          paidAmount,
          dueAmount,
        },
      },
      $inc: {
        totalDue: dueAmount,
        loyaltyPoints: Math.floor(paidAmount / 100),
      },
    });

    // Populate invoice response
    const populatedInvoice = await Invoice.findById(savedInvoice._id)
      .populate("customer", "name phone email")
      .populate("items.itemId", "name category");

    res.status(201).json(populatedInvoice);
  } catch (err) {
    console.error("Error saving invoice:", err);
    res.status(500).json({ message: "Failed to create invoice", error: err.message });
  }
});

/**
 * @route   GET /api/invoices
 * @desc    Get all invoices with customer data
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search?.trim() || '';

    const query = {};

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      console.log('Search regex:', searchRegex);
      // Step 1: find customers matching name or phone
      const matchingCustomers = await Customer.find({
        $or: [
          { name: searchRegex },
          { mobile: searchRegex },   // adjust field name if it's "mobile"
        ]
      }).select('_id');

      const customerIds = matchingCustomers.map(c => c._id);

      // Step 2: build invoice query
      const orConditions = [
        { notes: { $regex: search, $options: 'i' } },
        { customer: { $in: customerIds } }
      ];

      // Step 3: check if search is a number → match invoiceNumber
      const numberSearch = Number(search);
      if (!isNaN(numberSearch)) {
        orConditions.push({ invoiceNumber: numberSearch });
      }

      query.$or = orConditions;
    }

    const total = await Invoice.countDocuments(query);
    const invoices = await Invoice.find(query)
      .populate('customer', 'name mobile email')
      .populate('items.itemId', 'name category')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      invoices,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error('Error fetching invoices:', err);
    res.status(500).json({ message: 'Failed to fetch invoices', error: err.message });
  }
});


/**
 * @route   GET /api/invoices/:id
 * @desc    Get invoice by ID with customer data
 */
router.get('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer', 'name mobile email')
      .populate('items.itemId', 'name category');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (err) {
    console.error('Error fetching invoice:', err);
    res.status(500).json({ message: 'Failed to fetch invoice', error: err.message });
  }
});

/**
 * @route   PUT /api/invoices/:id
 * @desc    Update an existing invoice
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      customer,
      items,
      dueDate,
      paymentMethod,
      notes,
      gst,
      paidAmount, // Renamed from paidAmount in frontend to match
    } = req.body;

    // --- Step 1: Find the original invoice to calculate changes later ---
    const originalInvoice = await Invoice.findById(id);
    if (!originalInvoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // --- Step 2: Recalculate all totals based on the new data ---
    // The server should always be the source of truth for calculations.
    const itemsWithTotal = items.map((item) => ({
      ...item,
      totalPrice: item.quantity * (item.weight * item.pricePerGram + item.makingCharge),
    }));

    const newSubtotal = itemsWithTotal.reduce(
      (sum, item) => sum + item.totalPrice,
      0
    );
    const newGstAmount = (newSubtotal * gst) / 100;
    const newTotalAmount = newSubtotal + newGstAmount;



    // --- Step 3: Update the invoice document ---
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      id,
      {
        $set: {
          customer,
          items: itemsWithTotal,
          subtotal: newSubtotal,
          gst,
          gstAmount: newGstAmount,
          totalAmount: newTotalAmount,
          paidAmount,
          paymentMethod,
          notes,
          dueAmount: newTotalAmount - paidAmount,
          status: paidAmount >= newTotalAmount ? "paid" : paidAmount > 0 ? "partial" : "pending",
          dueDate,
        },
      },
      { new: true } // This option returns the modified document
    );

    // --- Step 4: Calculate the change in due amount to update the customer ---
    const dueAmountChange = updatedInvoice.dueAmount - originalInvoice.dueAmount;
    const loyaltyPointsChange = Math.floor(updatedInvoice.paidAmount / 100) - Math.floor(originalInvoice.paidAmount / 100);

    // --- Step 5: Update the corresponding customer's total due and history ---
    await Customer.updateOne(
      // Find the customer and the specific history entry to update
      { _id: customer, "history.invoiceId": id },
      {
        $inc: {
          totalDue: dueAmountChange, // Atomically increment/decrement the total due
          loyaltyPoints: loyaltyPointsChange,
        },
        $set: {
          // Update the values within the specific history array element
          "history.$.date": updatedInvoice.date,
          "history.$.totalAmount": updatedInvoice.totalAmount,
          "history.$.paidAmount": updatedInvoice.paidAmount,
          "history.$.dueAmount": updatedInvoice.dueAmount,
        },
      }
    );

    // --- Step 6: Populate and send the final updated invoice ---
    const populatedInvoice = await Invoice.findById(updatedInvoice._id)
      .populate("customer", "name phone email")
      .populate("items.itemId", "name category");

    res.json(populatedInvoice);
  } catch (err) {
    console.error("Error updating invoice:", err);
    res.status(500).json({ message: "Failed to update invoice", error: err.message });
  }
});

/**
 * @route   GET /api/invoices/:id./pdf
 * @desc    Generate and download invoice PDF
 */
router.get("/:id/pdf", async (req, res) => {

  const { id } = req.params;

  const invoice = await Invoice.findById(id)
  const { invoiceNumber, date, customer, items, subtotal, gst, gstAmount, totalAmount, paidAmount, dueAmount } = invoice;
  const customerData = await Customer.findById(customer);
  const customerName = customerData.name;
  const customerPhone = customerData.mobile;
  const itemsDetailed = await Promise.all(invoice.items.map(async (item) => {
    const itemData = await Inventory.findById(item.itemId);
    return {
      name: itemData.name,
      purity: itemData.purity,
    };
  }));

  console.log()
  const formattedDate = new Date(date).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const toWords = new ToWords({
    localeCode: 'en-IN',
    converterOptions: {
      currency: true,
      ignoreDecimal: false,
      ignoreZeroCurrency: false,
      doNotAddOnly: false,
    },
  });
  const totalAmountInWords = toWords.convert(totalAmount);

  const doc = new PDFDocument({ margin: 40, size: "A4" });
  res.setHeader("Content-Disposition", `attachment; filename=invoice_${invoiceNumber}.pdf`);
  res.setHeader("Content-Type", "application/pdf");
  doc.pipe(res);

  // Load Unicode font (supports ₹)
  // const fontPath = path.join(__dirname, "fonts", "NotoSans-Regular.ttf");
  // doc.font(fontPath);

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // -------- HEADER --------
  const logoPath = path.join(__dirname, "../assets", "rj.jpeg");
  doc.image(logoPath, 50, 40, { width: 70 });
  doc.fontSize(22).fillColor("#b8860b").text("Renuka Jewellers", 130, 45);
  doc.fontSize(10).fillColor("black").text("NEAR PANCHAKKI CHAURAHA, Hotel Jatin, Shivpuri, Haldwani, Nainital, Uttarakhand, 263139", 130, 75);
  doc.text("Phone: +91-9876543210 | GSTIN: 05EYPPB2240J1ZJ", 130, 90);

  // -------- INVOICE INFO --------
  doc.rect(50, 120, 500, 80).stroke("#b8860b");
  doc.fontSize(12).fillColor("black")
    .text(`Invoice No: ${invoiceNumber}`, 60, 130)
    .text(`Date: ${formattedDate.split(",")[0]}`, 400, 130)
    .text(`Time: ${formattedDate.split(",")[1]}`, 400, 150)
    .text(`Customer: ${customerName}`, 60, 150)
    .text(`Phone: ${customerPhone}`, 60, 170);

  // -------- TABLE HEADER --------
  function drawTableHeader(y) {
    doc.rect(50, y, 500, 25).fill("#b8860b");
    doc.fillColor("white").fontSize(12)
      .text("Item", 60, y + 7)
      .text("Purity", 160, y + 7)
      .text("Weight (g)", 220, y + 7)
      .text("Rate/gram", 290, y + 7)
      .text("Making Charges", 370, y + 7)
      .text("Amount", 480, y + 7);

    // Bottom line of header
    doc.moveTo(50, y + 25).lineTo(550, y + 25).stroke("#000");
    return y + 30;
  }

  // -------- ITEMS TABLE --------
  let y = 220;
  y = drawTableHeader(y);

  items.forEach((item, i) => {
    if (y > 700) {
      doc.addPage();
      y = 50;
      y = drawTableHeader(y);
    }

    doc.fillColor("black").fontSize(11)
      .text(`${items[i].quantity} x ${itemsDetailed[i].name}`, 60, y + 7)
      .text(itemsDetailed[i].purity, 160, y + 7)
      .text(item.weight.toFixed(2), 220, y + 7)
      .text(`Rs. ${item.pricePerGram.toLocaleString("en-IN")}`, 290, y + 7)
      .text(("Rs. " + item.makingCharge), 370, y + 7)
      .text(`Rs. ${((item.weight * item.pricePerGram) + item.makingCharge).toLocaleString("en-IN")}`, 480, y + 7);

    // Separator line after each row
    doc.moveTo(50, y + 25).lineTo(550, y + 25).stroke("#ccc");
    y += 25;
  });

  // -------- TOTALS (RIGHT-ALIGNED) --------
  if (y > 650) {
    doc.addPage();
    y = 50;
  }
  y += 30;

  doc.fontSize(12).fillColor("black")
    .text(`Subtotal: Rs. ${subtotal.toLocaleString("en-IN")}`, 50, y, { align: "right" })
    .text(`GST (${gst}%): Rs. ${gstAmount.toLocaleString("en-IN")}`, 50, y + 20, { align: "right" })
    .text(`Amount in words: ${totalAmountInWords}`, 60, y + 100, { align: "left" });

  doc.fontSize(13).fillColor("#b8860b")
    .text(`Grand Total: Rs. ${(totalAmount).toLocaleString("en-IN")}`, 50, y + 40, { align: "right" })

  doc.fontSize(12).fillColor("green")
    .text(`Amount Paid: Rs. ${(paidAmount).toLocaleString("en-IN")}`, 50, y + 60, { align: "right" })
  doc.fontSize(12).fillColor("red")
    .text(`Amount Due: Rs. ${(dueAmount).toLocaleString("en-IN")}`, 50, y + 80, { align: "right" });

  // -------- TAX / SUPPLY INFO --------
  y += 130;


  // -------- BANK DETAILS (BOTTOM LEFT) --------
  // y += 80;
  if (y > 650) {
    doc.addPage();
    y = 50;
  }
  doc.fontSize(11).fillColor("black");
  doc.text("Bank Details:", 60, y);
  doc.text("Bank: HDFC Bank", 60, y + 15);
  doc.text("Branch: Kalbadevi", 60, y + 30);
  doc.text("A/C No: 1234567890", 60, y + 45);
  doc.text("IFSC: HDFC0001234", 60, y + 60);

  // -------- FOOTER --------
  doc.moveDown(6);
  doc.fontSize(10).fillColor("gray").text("Thank you for your purchase!", { align: "center" });
  doc.text("Pure Quality • Trusted Service", { align: "center" });

  // Signature line
  doc.moveDown(2);
  doc.fontSize(11).fillColor("black").text("Authorized Signatory", 400, y + 100);
  doc.moveTo(380, y + 95).lineTo(550, y + 95).stroke();

  doc.end();
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedInvoice = await Invoice.findByIdAndDelete(id);

    if (!deletedInvoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.json({
      success: true,
      message: "Invoice deleted successfully",
      invoice: deletedInvoice,
    });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
