const Product = require('../models/product.model');
const Category = require('../models/category.model');

// @desc    Get all products
// @route   GET /api/products
// @access  Private
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('product_type_id', 'type')
      .populate('supplier_id', 'name')
      .populate('product_unit_id', 'unit');

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('product_type_id', 'type')
      .populate('supplier_id', 'name')
      .populate('product_unit_id', 'unit');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private
exports.createProduct = async (req, res) => {
  try {
    const {
      name, description, sku, barcode, category_id, supplier_id,
      product_type_id, product_unit_id, purchase_price, selling_price,
      tax_rate, min_stock_level, max_stock_level, is_active = 1
    } = req.body;

    // Validate required fields
    if (!name || !purchase_price || !selling_price || !product_unit_id) {
      return res.status(400).json({
        success: false,
        message: 'Name, purchase price, selling price, and product unit are required'
      });
    }

    // Check if category exists if provided
    if (category_id) {
      const category = await Category.findById(category_id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
    }

    // Check if SKU is unique
    if (sku) {
      const existingSku = await Product.findBySku(sku);
      if (existingSku) {
        return res.status(400).json({
          success: false,
          message: 'SKU already exists'
        });
      }
    }

    // Check if barcode is unique
    if (barcode) {
      const existingBarcode = await Product.findByBarcode(barcode);
      if (existingBarcode) {
        return res.status(400).json({
          success: false,
          message: 'Barcode already exists'
        });
      }
    }

    // Create product
    const productId = await Product.create({
      name,
      description,
      sku,
      barcode,
      category_id,
      supplier_id,
      product_type_id,
      product_unit_id,
      purchase_price,
      selling_price,
      tax_rate,
      min_stock_level,
      max_stock_level,
      is_active
    });

    // Get the created product with all relationships
    const product = await Product.findById(productId);

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product'
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, description, sku, barcode, category_id, supplier_id,
      product_type_id, product_unit_id, purchase_price, selling_price,
      tax_rate, min_stock_level, max_stock_level, is_active
    } = req.body;

    // Check if product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if category exists if provided
    if (category_id) {
      const category = await Category.findById(category_id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
    }

    // Check if SKU is unique (if changed)
    if (sku && sku !== existingProduct.sku) {
      const existingSku = await Product.findBySku(sku);
      if (existingSku) {
        return res.status(400).json({
          success: false,
          message: 'SKU already exists'
        });
      }
    }

    // Check if barcode is unique (if changed)
    if (barcode && barcode !== existingProduct.barcode) {
      const existingBarcode = await Product.findByBarcode(barcode);
      if (existingBarcode) {
        return res.status(400).json({
          success: false,
          message: 'Barcode already exists'
        });
      }
    }

    // Update product
    await Product.update(id, {
      name,
      description,
      sku,
      barcode,
      category_id,
      supplier_id,
      product_type_id,
      product_unit_id,
      purchase_price,
      selling_price,
      tax_rate,
      min_stock_level,
      max_stock_level,
      is_active
    });

    // Get the updated product
    const updatedProduct = await Product.findById(id);

    res.json({
      success: true,
      data: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product'
    });
  }
};

// @desc    Delete product (soft delete)
// @route   DELETE /api/products/:id
// @access  Private
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete product
    await Product.delete(id);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product'
    });
  }
};

// @desc    Search products
// @route   GET /api/products/search
// @access  Private
exports.searchProducts = async (req, res) => {
  try {
    const { query } = req.query;
    const products = await Product.find({
      $or: [
        { product_code: { $regex: query, $options: 'i' } },
        { designation: { $regex: query, $options: 'i' } }
      ]
    })
      .populate('product_type_id', 'type')
      .populate('supplier_id', 'name')
      .populate('product_unit_id', 'unit');

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching products',
      error: error.message
    });
  }
};

// @desc    Get low stock products
// @route   GET /api/products/low-stock
// @access  Private
exports.getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.getLowStock();
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error getting low stock products:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting low stock products'
    });
  }
};

// @desc Get product stock
// @route Get/api/products/product-stock
// @access Provate
exports.getProductStock = async (req, res) => {
  try {
    const { id } = req.params;

    // check if product exist
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Error this product doesn't exist"
      });
    }

    const productStock = await Product.getProductStock(id);
    res.status(200).json({
      success: true,
      data: productStock
    });
  } catch (error) {
    console.error(" Error getting product stock: ", error);
    res.status(500).json({
      success: false,
      message: "Error getting product stock"
    });
  }
};

// @desc    Get popular products
// @route   GET /api/products/popular
// @access  Private
exports.getPopularProducts = async (req, res) => {
  try {
    const { limit = 10, period } = req.query;
    
    // Validate limit parameter
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be a number between 1 and 100'
      });
    }

    // Validate period parameter if provided
    const validPeriods = ['today', 'week', 'month', 'year'];
    if (period && !validPeriods.includes(period.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Period must be one of: today, week, month, year'
      });
    }

    const products = await Product.getPopularProducts(limitNum, period);
    
    res.json({
      success: true,
      count: products.length,
      data: products,
      filters: {
        limit: limitNum,
        period: period || 'all-time'
      }
    });
  } catch (error) {
    console.error('Error getting popular products:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting popular products'
    });
  }
}; 