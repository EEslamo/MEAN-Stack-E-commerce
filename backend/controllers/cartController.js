const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Get cart
const getCart = async (req, res, next) => {
  try {
    const { sessionId } = req.query;
    const userId = req.user?._id;

    let cart;
    if (userId) {
      cart = await Cart.findOne({ user: userId }).populate('items.product');
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId }).populate('items.product');
    }

    if (!cart) {
      return res.json({
        success: true,
        data: { items: [], total: 0, totalItems: 0 }
      });
    }

    // Filter out deleted or inactive products and check price changes
    const validItems = [];
    const priceChangedItems = [];

    for (const item of cart.items) {
      if (item.product && item.product.isActive && !item.product.isDeleted) {
        // Check if price has changed
        if (item.priceAtTime !== item.product.price) {
          priceChangedItems.push({
            ...item.toObject(),
            currentPrice: item.product.price,
            priceChanged: true
          });
        } else {
          validItems.push(item);
        }
      }
    }

    // Update cart with valid items only
    cart.items = validItems;
    cart.updatedAt = new Date();
    await cart.save();

    const total = validItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const totalItems = validItems.reduce((sum, item) => sum + item.quantity, 0);

    res.json({
      success: true,
      data: {
        items: validItems,
        priceChangedItems,
        total,
        totalItems
      }
    });
  } catch (error) {
    next(error);
  }
};

// Add item to cart
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity, sessionId } = req.body;
    const userId = req.user?._id;

    // Check product availability
    const product = await Product.findOne({
      _id: productId,
      isDeleted: false,
      isActive: true
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Not enough stock available. Available: ${product.stock}`
      });
    }

    // Find or create cart
    let cart;
    if (userId) {
      cart = await Cart.findOne({ user: userId });
      if (!cart) {
        cart = new Cart({ user: userId, items: [] });
      }
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId });
      if (!cart) {
        cart = new Cart({ sessionId, items: [] });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Session ID or authentication required'
      });
    }

    // Check if product already in cart
    const existingItem = cart.items.find(item => 
      item.product.toString() === productId
    );

    if (existingItem) {
      // Check if adding more would exceed stock
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more items. Available stock: ${product.stock}, already in cart: ${existingItem.quantity}`
        });
      }
      existingItem.quantity = newQuantity;
      existingItem.priceAtTime = product.price; // Update price
    } else {
      cart.items.push({
        product: productId,
        quantity,
        priceAtTime: product.price
      });
    }

    cart.updatedAt = new Date();
    await cart.save();

    await cart.populate('items.product');

    res.json({
      success: true,
      message: 'Item added to cart successfully',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

// Update cart item quantity
const updateCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity, sessionId } = req.body;
    const userId = req.user?._id;

    // Find cart
    let cart;
    if (userId) {
      cart = await Cart.findOne({ user: userId });
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId });
    }

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Find item in cart
    const item = cart.items.find(item => item.product.toString() === productId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    // Check product availability
    const product = await Product.findById(productId);
    if (!product || !product.isActive || product.isDeleted) {
      return res.status(400).json({
        success: false,
        message: 'Product is no longer available'
      });
    }

    if (quantity <= 0) {
      // Remove item from cart
      cart.items = cart.items.filter(item => item.product.toString() !== productId);
    } else {
      // Check stock availability
      if (quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock available. Available: ${product.stock}`
        });
      }
      item.quantity = quantity;
      item.priceAtTime = product.price; // Update price
    }

    cart.updatedAt = new Date();
    await cart.save();

    await cart.populate('items.product');

    res.json({
      success: true,
      message: 'Cart updated successfully',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

// Remove item from cart
const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { sessionId } = req.query;
    const userId = req.user?._id;

    // Find cart
    let cart;
    if (userId) {
      cart = await Cart.findOne({ user: userId });
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId });
    }

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Remove item
    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    cart.updatedAt = new Date();
    await cart.save();

    await cart.populate('items.product');

    res.json({
      success: true,
      message: 'Item removed from cart successfully',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

// Clear cart
const clearCart = async (req, res, next) => {
  try {
    const { sessionId } = req.query;
    const userId = req.user?._id;

    // Find cart
    let cart;
    if (userId) {
      cart = await Cart.findOne({ user: userId });
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId });
    }

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Clear items
    cart.items = [];
    cart.updatedAt = new Date();
    await cart.save();

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

// Merge guest cart with user cart (after login)
const mergeCart = async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user._id;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }

    // Find guest cart
    const guestCart = await Cart.findOne({ sessionId }).populate('items.product');
    if (!guestCart || guestCart.items.length === 0) {
      return res.json({
        success: true,
        message: 'No guest cart to merge',
        data: { items: [], total: 0, totalItems: 0 }
      });
    }

    // Find or create user cart
    let userCart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!userCart) {
      userCart = new Cart({ user: userId, items: [] });
    }

    // Merge items
    for (const guestItem of guestCart.items) {
      if (guestItem.product && guestItem.product.isActive && !guestItem.product.isDeleted) {
        const existingItem = userCart.items.find(item => 
          item.product.toString() === guestItem.product._id.toString()
        );

        if (existingItem) {
          // Update quantity if product is still available
          const newQuantity = existingItem.quantity + guestItem.quantity;
          if (newQuantity <= guestItem.product.stock) {
            existingItem.quantity = newQuantity;
            existingItem.priceAtTime = guestItem.product.price;
          }
        } else {
          // Add new item
          userCart.items.push({
            product: guestItem.product._id,
            quantity: guestItem.quantity,
            priceAtTime: guestItem.product.price
          });
        }
      }
    }

    userCart.updatedAt = new Date();
    await userCart.save();

    // Delete guest cart
    await Cart.deleteOne({ sessionId });

    await userCart.populate('items.product');

    const total = userCart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const totalItems = userCart.items.reduce((sum, item) => sum + item.quantity, 0);

    res.json({
      success: true,
      message: 'Cart merged successfully',
      data: {
        items: userCart.items,
        total,
        totalItems
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  mergeCart
};
