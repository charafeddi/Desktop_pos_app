const mongoose = require('mongoose');
const Return = require('../models/Return');
const SaleItem = require('../models/SaleItem');
const Product = require('../models/Product');
const Sale = require('../models/Sale');

// @desc    Get all returns
// @route   GET /api/returns
// @access  Private
exports.getReturns = async (req, res) => {
  try {
    const returns = await Return.find()
      .populate({
        path: 'sale_item_id',
        populate: [
          {
            path: 'product_id',
            select: 'product_code designation'
          },
          {
            path: 'sale_id',
            select: 'client_id createdAt',
            populate: {
              path: 'client_id',
              select: 'name email phone'
            }
          }
        ]
      });

    res.json({
      success: true,
      count: returns.length,
      data: returns
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching returns',
      error: error.message
    });
  }
};

// @desc    Get single return
// @route   GET /api/returns/:id
// @access  Private
exports.getReturn = async (req, res) => {
  try {
    const return_ = await Return.findById(req.params.id)
      .populate({
        path: 'sale_item_id',
        populate: [
          {
            path: 'product_id',
            select: 'product_code designation prix_vente'
          },
          {
            path: 'sale_id',
            select: 'client_id total_amount createdAt',
            populate: {
              path: 'client_id',
              select: 'name email phone'
            }
          }
        ]
      });

    if (!return_) {
      return res.status(404).json({
        success: false,
        message: 'Return not found'
      });
    }

    res.json({
      success: true,
      data: return_
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching return',
      error: error.message
    });
  }
};

// @desc    Create return
// @route   POST /api/returns
// @access  Private
exports.createReturn = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { sale_item_id, quantity_returned, reason } = req.body;

    // Check if sale item exists and can be returned
    const saleItem = await SaleItem.findById(sale_item_id)
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
        message: 'This item has already been returned'
      });
    }

    if (quantity_returned > saleItem.quantity) {
      return res.status(400).json({
        success: false,
        message: 'Return quantity cannot exceed original quantity'
      });
    }

    // Create return record
    const return_ = await Return.create([{
      sale_item_id,
      quantity_returned,
      reason
    }], { session });

    // Update product stock
    saleItem.product_id.quantity += quantity_returned;
    await saleItem.product_id.save({ session });

    // Update sale item status
    saleItem.is_returned = true;
    await saleItem.save({ session });

    // Update sale total
    const returnAmount = quantity_returned * saleItem.unit_price;
    const sale = saleItem.sale_id;
    sale.total_amount -= returnAmount;
    await sale.save({ session });

    await session.commitTransaction();

    // Fetch complete return data
    const completeReturn = await Return.findById(return_[0]._id)
      .populate({
        path: 'sale_item_id',
        populate: [
          {
            path: 'product_id',
            select: 'product_code designation'
          },
          {
            path: 'sale_id',
            select: 'client_id total_amount',
            populate: {
              path: 'client_id',
              select: 'name email'
            }
          }
        ]
      });

    res.status(201).json({
      success: true,
      data: {
        return: completeReturn,
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

// @desc    Update return
// @route   PUT /api/returns/:id
// @access  Private
exports.updateReturn = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { quantity_returned, reason } = req.body;
    const return_ = await Return.findById(req.params.id)
      .populate({
        path: 'sale_item_id',
        populate: ['product_id', 'sale_id']
      });

    if (!return_) {
      return res.status(404).json({
        success: false,
        message: 'Return not found'
      });
    }

    const saleItem = return_.sale_item_id;

    // Validate new quantity
    if (quantity_returned > saleItem.quantity) {
      return res.status(400).json({
        success: false,
        message: 'Return quantity cannot exceed original quantity'
      });
    }

    // Update product stock
    const quantityDiff = quantity_returned - return_.quantity_returned;
    saleItem.product_id.quantity += quantityDiff;
    await saleItem.product_id.save({ session });

    // Update sale total
    const returnAmountDiff = quantityDiff * saleItem.unit_price;
    saleItem.sale_id.total_amount -= returnAmountDiff;
    await saleItem.sale_id.save({ session });

    // Update return
    return_.quantity_returned = quantity_returned;
    if (reason) return_.reason = reason;
    await return_.save({ session });

    await session.commitTransaction();

    res.json({
      success: true,
      data: return_
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({
      success: false,
      message: 'Error updating return',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

// @desc    Get returns by date range
// @route   GET /api/returns/date-range
// @access  Private
exports.getReturnsByDateRange = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const returns = await Return.find({
      createdAt: {
        $gte: new Date(start_date),
        $lte: new Date(end_date)
      }
    }).populate({
      path: 'sale_item_id',
      populate: [
        {
          path: 'product_id',
          select: 'product_code designation'
        },
        {
          path: 'sale_id',
          select: 'client_id createdAt',
          populate: {
            path: 'client_id',
            select: 'name'
          }
        }
      ]
    });

    res.json({
      success: true,
      count: returns.length,
      data: returns
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching returns by date range',
      error: error.message
    });
  }
};

// @desc    Get return statistics
// @route   GET /api/returns/stats
// @access  Private
exports.getReturnStats = async (req, res) => {
  try {
    const stats = await Return.aggregate([
      {
        $lookup: {
          from: 'saleitems',
          localField: 'sale_item_id',
          foreignField: '_id',
          as: 'saleItem'
        }
      },
      {
        $unwind: '$saleItem'
      },
      {
        $lookup: {
          from: 'products',
          localField: 'saleItem.product_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $group: {
          _id: '$product._id',
          product_code: { $first: '$product.product_code' },
          designation: { $first: '$product.designation' },
          total_returns: { $sum: 1 },
          total_quantity: { $sum: '$quantity_returned' },
          total_amount: { $sum: { $multiply: ['$quantity_returned', '$saleItem.unit_price'] } }
        }
      },
      {
        $sort: { total_returns: -1 }
      }
    ]);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching return statistics',
      error: error.message
    });
  }
}; 