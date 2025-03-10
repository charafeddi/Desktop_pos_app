const mongoose = require('mongoose');
const SaleItem = require('../models/SaleItem');
const Product = require('../models/Product');
const Sale = require('../models/Sale');

// @desc    Get all sale items
// @route   GET /api/sale-items
// @access  Private
exports.getSaleItems = async (req, res) => {
  try {
    const saleItems = await SaleItem.find()
      .populate('product_id', 'product_code designation prix_vente')
      .populate('sale_id', 'client_id total_amount');

    res.json({
      success: true,
      count: saleItems.length,
      data: saleItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sale items',
      error: error.message
    });
  }
};

// @desc    Get single sale item
// @route   GET /api/sale-items/:id
// @access  Private
exports.getSaleItem = async (req, res) => {
  try {
    const saleItem = await SaleItem.findById(req.params.id)
      .populate('product_id', 'product_code designation prix_vente')
      .populate('sale_id', 'client_id total_amount');

    if (!saleItem) {
      return res.status(404).json({
        success: false,
        message: 'Sale item not found'
      });
    }

    res.json({
      success: true,
      data: saleItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sale item',
      error: error.message
    });
  }
};

// @desc    Update sale item quantity
// @route   PUT /api/sale-items/:id/quantity
// @access  Private
exports.updateQuantity = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { quantity } = req.body;
    const saleItem = await SaleItem.findById(req.params.id)
      .populate('product_id')
      .populate('sale_id');

    if (!saleItem) {
      return res.status(404).json({
        success: false,
        message: 'Sale item not found'
      });
    }

    // Calculate quantity difference
    const quantityDiff = quantity - saleItem.quantity;

    // Check if enough stock is available for increase
    if (quantityDiff > 0) {
      if (saleItem.product_id.quantity < quantityDiff) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock for quantity increase'
        });
      }
    }

    // Update product stock
    saleItem.product_id.quantity -= quantityDiff;
    await saleItem.product_id.save({ session });

    // Update sale item
    const oldSubtotal = saleItem.subtotal;
    saleItem.quantity = quantity;
    saleItem.subtotal = quantity * saleItem.unit_price;
    await saleItem.save({ session });

    // Update sale total
    const sale = saleItem.sale_id;
    sale.total_amount = sale.total_amount - oldSubtotal + saleItem.subtotal;
    await sale.save({ session });

    await session.commitTransaction();

    res.json({
      success: true,
      data: saleItem
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({
      success: false,
      message: 'Error updating sale item quantity',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

// @desc    Return sale item
// @route   POST /api/sale-items/:id/return
// @access  Private
exports.returnItem = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { quantity_returned, reason } = req.body;
    const saleItem = await SaleItem.findById(req.params.id)
      .populate('product_id')
      .populate('sale_id');

    if (!saleItem) {
      return res.status(404).json({
        success: false,
        message: 'Sale item not found'
      });
    }

    if (saleItem.is_returned) {
      return res.status(400).json({
        success: false,
        message: 'Item has already been returned'
      });
    }

    if (quantity_returned > saleItem.quantity) {
      return res.status(400).json({
        success: false,
        message: 'Return quantity cannot exceed original quantity'
      });
    }

    // Create return record
    const Return = require('../models/Return');
    await Return.create([{
      sale_item_id: saleItem._id,
      quantity_returned,
      reason
    }], { session });

    // Update product stock
    saleItem.product_id.quantity += quantity_returned;
    await saleItem.product_id.save({ session });

    // Update sale item
    saleItem.is_returned = true;
    await saleItem.save({ session });

    // Update sale total
    const returnAmount = quantity_returned * saleItem.unit_price;
    const sale = saleItem.sale_id;
    sale.total_amount -= returnAmount;
    await sale.save({ session });

    await session.commitTransaction();

    res.json({
      success: true,
      data: {
        saleItem,
        returnAmount
      }
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({
      success: false,
      message: 'Error processing return',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

// @desc    Get items by product
// @route   GET /api/sale-items/product/:productId
// @access  Private
exports.getItemsByProduct = async (req, res) => {
  try {
    const saleItems = await SaleItem.find({ product_id: req.params.productId })
      .populate('sale_id', 'client_id total_amount createdAt')
      .populate({
        path: 'sale_id',
        populate: {
          path: 'client_id',
          select: 'name email'
        }
      });

    res.json({
      success: true,
      count: saleItems.length,
      data: saleItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching items by product',
      error: error.message
    });
  }
};

// @desc    Get sale item statistics
// @route   GET /api/sale-items/stats
// @access  Private
exports.getSaleItemStats = async (req, res) => {
  try {
    const stats = await SaleItem.aggregate([
      {
        $match: {
          deleted_at: null,
          createdAt: {
            $gte: new Date(new Date().setDate(new Date().getDate() - 30))
          }
        }
      },
      {
        $group: {
          _id: '$product_id',
          totalQuantity: { $sum: '$quantity' },
          totalAmount: { $sum: '$subtotal' },
          averagePrice: { $avg: '$unit_price' },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $project: {
          product_code: '$product.product_code',
          designation: '$product.designation',
          totalQuantity: 1,
          totalAmount: 1,
          averagePrice: 1,
          count: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sale item statistics',
      error: error.message
    });
  }
}; 