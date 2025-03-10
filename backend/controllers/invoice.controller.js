const mongoose = require('mongoose');
const Invoice = require('../models/Invoice');
const Sale = require('../models/Sale');

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private
exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate({
        path: 'sale_id',
        select: 'total_amount amount_paid client_id createdAt',
        populate: {
          path: 'client_id',
          select: 'name email phone'
        }
      });

    res.json({
      success: true,
      count: invoices.length,
      data: invoices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching invoices',
      error: error.message
    });
  }
};

// @desc    Get single invoice
// @route   GET /api/invoices/:id
// @access  Private
exports.getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate({
        path: 'sale_id',
        populate: [
          {
            path: 'client_id',
            select: 'name email phone address city country postal_code'
          },
          {
            path: 'user_id',
            select: 'name'
          },
          {
            path: 'saleItems',
            populate: {
              path: 'product_id',
              select: 'product_code designation'
            }
          }
        ]
      });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching invoice',
      error: error.message
    });
  }
};

// @desc    Create invoice
// @route   POST /api/invoices
// @access  Private
exports.createInvoice = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { sale_id } = req.body;

    // Check if sale exists
    const sale = await Sale.findById(sale_id);
    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    // Check if invoice already exists for this sale
    const existingInvoice = await Invoice.findOne({ sale_id });
    if (existingInvoice) {
      return res.status(400).json({
        success: false,
        message: 'Invoice already exists for this sale'
      });
    }

    // Create invoice
    const invoice = await Invoice.create([{
      sale_id,
      invoice_status: sale.paid ? 'paid' : 'pending'
    }], { session });

    await session.commitTransaction();

    // Fetch complete invoice data
    const completeInvoice = await Invoice.findById(invoice[0]._id)
      .populate({
        path: 'sale_id',
        populate: [
          {
            path: 'client_id',
            select: 'name email phone address'
          },
          {
            path: 'saleItems',
            populate: {
              path: 'product_id',
              select: 'product_code designation'
            }
          }
        ]
      });

    res.status(201).json({
      success: true,
      data: completeInvoice
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({
      success: false,
      message: 'Error creating invoice',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

// @desc    Update invoice status
// @route   PUT /api/invoices/:id/status
// @access  Private
exports.updateInvoiceStatus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { invoice_status } = req.body;
    const invoice = await Invoice.findById(req.params.id)
      .populate('sale_id');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Update invoice status
    invoice.invoice_status = invoice_status;
    await invoice.save({ session });

    // If marking as paid, update sale
    if (invoice_status === 'paid') {
      invoice.sale_id.paid = true;
      invoice.sale_id.amount_paid = invoice.sale_id.total_amount;
      await invoice.sale_id.save({ session });
    }

    await session.commitTransaction();

    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({
      success: false,
      message: 'Error updating invoice status',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

// @desc    Delete invoice (soft delete)
// @route   DELETE /api/invoices/:id
// @access  Private
exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Soft delete
    invoice.deleted_at = new Date();
    await invoice.save();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error deleting invoice',
      error: error.message
    });
  }
};

// @desc    Get invoices by date range
// @route   GET /api/invoices/date-range
// @access  Private
exports.getInvoicesByDateRange = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const invoices = await Invoice.find({
      createdAt: {
        $gte: new Date(start_date),
        $lte: new Date(end_date)
      }
    }).populate({
      path: 'sale_id',
      select: 'total_amount amount_paid client_id createdAt',
      populate: {
        path: 'client_id',
        select: 'name email'
      }
    });

    res.json({
      success: true,
      count: invoices.length,
      data: invoices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching invoices by date range',
      error: error.message
    });
  }
};

// @desc    Get invoice statistics
// @route   GET /api/invoices/stats
// @access  Private
exports.getInvoiceStats = async (req, res) => {
  try {
    const stats = await Invoice.aggregate([
      {
        $match: {
          deleted_at: null
        }
      },
      {
        $lookup: {
          from: 'sales',
          localField: 'sale_id',
          foreignField: '_id',
          as: 'sale'
        }
      },
      {
        $unwind: '$sale'
      },
      {
        $group: {
          _id: '$invoice_status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$sale.total_amount' },
          paidAmount: { $sum: '$sale.amount_paid' }
        }
      }
    ]);

    // Calculate additional metrics
    const totalInvoices = stats.reduce((acc, stat) => acc + stat.count, 0);
    const totalAmount = stats.reduce((acc, stat) => acc + stat.totalAmount, 0);
    const totalPaid = stats.reduce((acc, stat) => acc + stat.paidAmount, 0);

    res.json({
      success: true,
      data: {
        statusBreakdown: stats,
        summary: {
          totalInvoices,
          totalAmount,
          totalPaid,
          outstanding: totalAmount - totalPaid
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching invoice statistics',
      error: error.message
    });
  }
}; 