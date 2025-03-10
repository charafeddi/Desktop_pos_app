const Client = require('../models/Client');

// @desc    Get all clients
// @route   GET /api/clients
// @access  Private
exports.getClients = async (req, res) => {
  try {
    const clients = await Client.find()
      .populate('user_id', 'name')
      .populate('sales', 'total_amount paid createdAt');

    res.json({
      success: true,
      count: clients.length,
      data: clients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching clients',
      error: error.message
    });
  }
};

// @desc    Get single client
// @route   GET /api/clients/:id
// @access  Private
exports.getClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)
      .populate('user_id', 'name')
      .populate({
        path: 'sales',
        select: 'total_amount amount_paid paid createdAt',
        populate: {
          path: 'saleItems',
          populate: {
            path: 'product_id',
            select: 'product_code designation'
          }
        }
      });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.json({
      success: true,
      data: client
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching client',
      error: error.message
    });
  }
};

// @desc    Create client
// @route   POST /api/clients
// @access  Private
exports.createClient = async (req, res) => {
  try {
    // Add user to request body
    req.body.user_id = req.user.id;

    const client = await Client.create(req.body);

    res.status(201).json({
      success: true,
      data: client
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating client',
      error: error.message
    });
  }
};

// @desc    Update client
// @route   PUT /api/clients/:id
// @access  Private
exports.updateClient = async (req, res) => {
  try {
    let client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Make sure user is client owner or admin
    if (client.user_id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this client'
      });
    }

    client = await Client.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: client
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating client',
      error: error.message
    });
  }
};

// @desc    Delete client (soft delete)
// @route   DELETE /api/clients/:id
// @access  Private
exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Make sure user is client owner or admin
    if (client.user_id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this client'
      });
    }

    // Soft delete
    client.deleted_at = new Date();
    await client.save();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error deleting client',
      error: error.message
    });
  }
};

// @desc    Search clients
// @route   GET /api/clients/search
// @access  Private
exports.searchClients = async (req, res) => {
  try {
    const { query } = req.query;
    const clients = await Client.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } }
      ]
    }).populate('user_id', 'name');

    res.json({
      success: true,
      count: clients.length,
      data: clients
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching clients',
      error: error.message
    });
  }
};

// @desc    Get client statistics
// @route   GET /api/clients/stats
// @access  Private
exports.getClientStats = async (req, res) => {
  try {
    const stats = await Client.aggregate([
      {
        $match: {
          deleted_at: null
        }
      },
      {
        $lookup: {
          from: 'sales',
          localField: '_id',
          foreignField: 'client_id',
          as: 'sales'
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          phone: 1,
          totalSales: { $size: '$sales' },
          totalAmount: { $sum: '$sales.total_amount' },
          totalPaid: { $sum: '$sales.amount_paid' },
          lastPurchase: { $max: '$sales.createdAt' }
        }
      },
      {
        $sort: { totalAmount: -1 }
      }
    ]);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching client statistics',
      error: error.message
    });
  }
};

// @desc    Get client balance
// @route   GET /api/clients/:id/balance
// @access  Private
exports.getClientBalance = async (req, res) => {
  try {
    const sales = await Sale.find({
      client_id: req.params.id,
      deleted_at: null
    });

    const balance = sales.reduce((acc, sale) => {
      return acc + (sale.total_amount - sale.amount_paid);
    }, 0);

    res.json({
      success: true,
      data: {
        balance,
        totalSales: sales.length,
        totalAmount: sales.reduce((acc, sale) => acc + sale.total_amount, 0),
        totalPaid: sales.reduce((acc, sale) => acc + sale.amount_paid, 0)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching client balance',
      error: error.message
    });
  }
}; 