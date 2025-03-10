const Sale = require('../models/Sale');
const SaleItem = require('../models/SaleItem');
const Product = require('../models/Product');

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private
exports.getSales = async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate('client_id', 'name email phone')
      .populate('user_id', 'name')
      .populate({
        path: 'saleItems',
        populate: {
          path: 'product_id',
          select: 'product_code designation'
        }
      });

    res.json({
      success: true,
      count: sales.length,
      data: sales
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sales',
      error: error.message
    });
  }
};

// @desc    Get single sale
// @route   GET /api/sales/:id
// @access  Private
exports.getSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('client_id', 'name email phone')
      .populate('user_id', 'name')
      .populate({
        path: 'saleItems',
        populate: {
          path: 'product_id',
          select: 'product_code designation prix_vente'
        }
      });

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    res.json({
      success: true,
      data: sale
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sale',
      error: error.message
    });
  }
};

// @desc    Create sale
// @route   POST /api/sales
// @access  Private
exports.createSale = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { client_id, items } = req.body;

    // Calculate total amount from items
    let total_amount = 0;
    const saleItems = [];

    // Verify and process each item
    for (const item of items) {
      const product = await Product.findById(item.product_id);
      
      if (!product) {
        throw new Error(`Product ${item.product_id} not found`);
      }
      
      if (product.quantity < item.quantity) {
        throw new Error(`Insufficient stock for product ${product.product_code}`);
      }

      const unit_price = item.unit_price || product.prix_vente;
      const subtotal = unit_price * item.quantity;
      total_amount += subtotal;

      // Create sale item
      const saleItem = await SaleItem.create([{
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: unit_price,
        subtotal: subtotal,
        sale_id: null // Will be updated after sale creation
      }], { session });

      saleItems.push(saleItem[0]._id);

      // Update product quantity
      product.quantity -= item.quantity;
      await product.save({ session });
    }

    // Create sale
    const sale = await Sale.create([{
      client_id,
      user_id: req.user.id,
      total_amount,
      amount_paid: req.body.amount_paid || 0,
      paid: req.body.paid || false
    }], { session });

    // Update sale_id in sale items
    await SaleItem.updateMany(
      { _id: { $in: saleItems } },
      { sale_id: sale[0]._id },
      { session }
    );

    await session.commitTransaction();

    // Fetch complete sale with populated fields
    const completeSale = await Sale.findById(sale[0]._id)
      .populate('client_id', 'name email phone')
      .populate('user_id', 'name')
      .populate({
        path: 'saleItems',
        populate: {
          path: 'product_id',
          select: 'product_code designation prix_vente'
        }
      });

    res.status(201).json({
      success: true,
      data: completeSale
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({
      success: false,
      message: 'Error creating sale',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

// @desc    Update sale
// @route   PUT /api/sales/:id
// @access  Private
exports.updateSale = async (req, res) => {
  try {
    const { amount_paid, paid } = req.body;
    let sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    // Only allow updating payment information
    const updateData = {};
    if (amount_paid !== undefined) updateData.amount_paid = amount_paid;
    if (paid !== undefined) updateData.paid = paid;

    sale = await Sale.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    })
      .populate('client_id', 'name email phone')
      .populate('user_id', 'name')
      .populate({
        path: 'saleItems',
        populate: {
          path: 'product_id',
          select: 'product_code designation prix_vente'
        }
      });

    res.json({
      success: true,
      data: sale
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating sale',
      error: error.message
    });
  }
};

// @desc    Delete sale (soft delete)
// @route   DELETE /api/sales/:id
// @access  Private
exports.deleteSale = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    // Soft delete sale and related items
    sale.deleted_at = new Date();
    await sale.save({ session });

    await SaleItem.updateMany(
      { sale_id: sale._id },
      { deleted_at: new Date() },
      { session }
    );

    await session.commitTransaction();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({
      success: false,
      message: 'Error deleting sale',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

// @desc    Get sales by client
// @route   GET /api/sales/client/:clientId
// @access  Private
exports.getClientSales = async (req, res) => {
  try {
    const sales = await Sale.find({ client_id: req.params.clientId })
      .populate('client_id', 'name email phone')
      .populate('user_id', 'name')
      .populate({
        path: 'saleItems',
        populate: {
          path: 'product_id',
          select: 'product_code designation prix_vente'
        }
      });

    res.json({
      success: true,
      count: sales.length,
      data: sales
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching client sales',
      error: error.message
    });
  }
};

// @desc    Get sales statistics
// @route   GET /api/sales/stats
// @access  Private
exports.getSalesStats = async (req, res) => {
  try {
    const stats = await Sale.aggregate([
      {
        $match: {
          deleted_at: null,
          createdAt: {
            $gte: new Date(new Date().setDate(new Date().getDate() - 30)) // Last 30 days
          }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalSales: { $sum: 1 },
          totalAmount: { $sum: "$total_amount" },
          paidAmount: { $sum: "$amount_paid" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sales statistics',
      error: error.message
    });
  }
}; 