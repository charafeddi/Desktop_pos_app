const ProductType = require('../models/ProductType');

// @desc    Get all product types
// @route   GET /api/product-types
// @access  Private
exports.getProductTypes = async (req, res) => {
  try {
    const query = { deleted_at: null };
    
    // Filter by active status if specified
    if (req.query.active !== undefined) {
      query.active = req.query.active === 'true';
    }

    const productTypes = await ProductType.find(query)
      .populate('created_by', 'username')
      .populate('updated_by', 'username')
      .sort('name');

    res.json({
      success: true,
      count: productTypes.length,
      data: productTypes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product types',
      error: error.message
    });
  }
};

// @desc    Get single product type
// @route   GET /api/product-types/:id
// @access  Private
exports.getProductType = async (req, res) => {
  try {
    const productType = await ProductType.findOne({
      _id: req.params.id,
      deleted_at: null
    }).populate('created_by', 'username')
      .populate('updated_by', 'username');

    if (!productType) {
      return res.status(404).json({
        success: false,
        message: 'Product type not found'
      });
    }

    res.json({
      success: true,
      data: productType
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product type',
      error: error.message
    });
  }
};

// @desc    Create product type
// @route   POST /api/product-types
// @access  Private
exports.createProductType = async (req, res) => {
  try {
    const { name, description, active } = req.body;

    // Check if product type already exists
    const existingType = await ProductType.findOne({ 
      name: { $regex: new RegExp('^' + name + '$', 'i') },
      deleted_at: null 
    });

    if (existingType) {
      return res.status(400).json({
        success: false,
        message: 'Product type with this name already exists'
      });
    }

    const productType = await ProductType.create({
      name,
      description,
      active,
      created_by: req.user._id
    });

    res.status(201).json({
      success: true,
      data: productType
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating product type',
      error: error.message
    });
  }
};

// @desc    Update product type
// @route   PUT /api/product-types/:id
// @access  Private
exports.updateProductType = async (req, res) => {
  try {
    const { name, description, active } = req.body;

    let productType = await ProductType.findOne({
      _id: req.params.id,
      deleted_at: null
    });

    if (!productType) {
      return res.status(404).json({
        success: false,
        message: 'Product type not found'
      });
    }

    // Check if new name already exists (excluding current product type)
    if (name && name !== productType.name) {
      const existingType = await ProductType.findOne({
        name: { $regex: new RegExp('^' + name + '$', 'i') },
        _id: { $ne: req.params.id },
        deleted_at: null
      });

      if (existingType) {
        return res.status(400).json({
          success: false,
          message: 'Product type with this name already exists'
        });
      }
    }

    productType = await ProductType.findByIdAndUpdate(
      req.params.id,
      {
        name: name || productType.name,
        description: description || productType.description,
        active: active !== undefined ? active : productType.active,
        updated_by: req.user._id
      },
      {
        new: true,
        runValidators: true
      }
    ).populate('created_by', 'username')
     .populate('updated_by', 'username');

    res.json({
      success: true,
      data: productType
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating product type',
      error: error.message
    });
  }
};

// @desc    Delete product type (soft delete)
// @route   DELETE /api/product-types/:id
// @access  Private
exports.deleteProductType = async (req, res) => {
  try {
    const productType = await ProductType.findOne({
      _id: req.params.id,
      deleted_at: null
    });

    if (!productType) {
      return res.status(404).json({
        success: false,
        message: 'Product type not found'
      });
    }

    // Soft delete
    productType.deleted_at = new Date();
    productType.updated_by = req.user._id;
    await productType.save();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error deleting product type',
      error: error.message
    });
  }
}; 