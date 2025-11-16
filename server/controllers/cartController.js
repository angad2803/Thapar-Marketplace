const Cart = require('../models/Cart');
const Listing = require('../models/Listing');

/**
 * @desc    Get user's cart
 * @route   GET /api/cart
 * @access  Private
 */
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id })
      .populate({
        path: 'items.listingId',
        select: 'title price images status sellerId category',
        populate: {
          path: 'sellerId',
          select: 'name email hostel'
        }
      });

    if (!cart) {
      cart = await Cart.create({ userId: req.user.id, items: [] });
    }

    // Filter out unavailable listings
    const validItems = cart.items.filter(item => 
      item.listingId && item.listingId.status === 'available'
    );

    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add item to cart
 * @route   POST /api/cart
 * @access  Private
 */
exports.addToCart = async (req, res, next) => {
  try {
    const { listingId, quantity = 1 } = req.body;

    // Check if listing exists and is available
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    if (listing.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'This listing is not available'
      });
    }

    // Can't add own listing to cart
    if (listing.sellerId.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot add your own listing to cart'
      });
    }

    let cart = await Cart.findOne({ userId: req.user.id });
    
    if (!cart) {
      cart = await Cart.create({ userId: req.user.id, items: [] });
    }

    // Check if item already in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.listingId.toString() === listingId
    );

    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        listingId,
        quantity,
        price: listing.price
      });
    }

    await cart.save();
    await cart.populate({
      path: 'items.listingId',
      select: 'title price images status sellerId',
      populate: {
        path: 'sellerId',
        select: 'name email hostel'
      }
    });

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/cart/:listingId
 * @access  Private
 */
exports.updateCartItem = async (req, res, next) => {
  try {
    const { listingId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    const cart = await Cart.findOne({ userId: req.user.id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const itemIndex = cart.items.findIndex(
      item => item.listingId.toString() === listingId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    await cart.populate({
      path: 'items.listingId',
      select: 'title price images status sellerId',
      populate: {
        path: 'sellerId',
        select: 'name email hostel'
      }
    });

    res.status(200).json({
      success: true,
      message: 'Cart updated',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/:listingId
 * @access  Private
 */
exports.removeFromCart = async (req, res, next) => {
  try {
    const { listingId } = req.params;

    const cart = await Cart.findOne({ userId: req.user.id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = cart.items.filter(
      item => item.listingId.toString() !== listingId
    );

    await cart.save();
    await cart.populate({
      path: 'items.listingId',
      select: 'title price images status sellerId',
      populate: {
        path: 'sellerId',
        select: 'name email hostel'
      }
    });

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Clear cart
 * @route   DELETE /api/cart
 * @access  Private
 */
exports.clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};
