const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Listing = require('../models/Listing');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendOrderConfirmationEmail, sendNewOrderNotificationToSeller, sendDeliveryConfirmationRequest, sendOrderCompletedEmail } = require('../utils/emailService');

/**
 * @desc    Create order from cart
 * @route   POST /api/orders
 * @access  Private
 */
exports.createOrder = async (req, res, next) => {
  try {
    const { paymentMethod, deliveryDetails } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ userId: req.user.id })
      .populate('items.listingId');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Validate all listings are still available
    const unavailableItems = cart.items.filter(
      item => !item.listingId || item.listingId.status !== 'available'
    );

    if (unavailableItems.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some items in your cart are no longer available'
      });
    }

    // Get buyer details
    const buyer = await User.findById(req.user.id);

    // Prepare order items
    const orderItems = cart.items.map(item => ({
      listingId: item.listingId._id,
      sellerId: item.listingId.sellerId,
      title: item.listingId.title,
      price: item.price,
      quantity: item.quantity,
      images: item.listingId.images
    }));

    // Create order
    const order = await Order.create({
      buyerId: req.user.id,
      items: orderItems,
      totalAmount: cart.totalAmount,
      paymentMethod: paymentMethod || 'cash',
      deliveryDetails: {
        ...deliveryDetails,
        buyerHostel: buyer.hostel
      }
    });

    // Update listing status to pending
    const listingIds = orderItems.map(item => item.listingId);
    await Listing.updateMany(
      { _id: { $in: listingIds } },
      { status: 'pending' }
    );

    // Clear cart
    cart.items = [];
    await cart.save();

    // Create notifications for sellers and send emails
    const sellerIds = [...new Set(orderItems.map(item => item.sellerId.toString()))];
    
    for (const sellerId of sellerIds) {
      const seller = await User.findById(sellerId);
      const sellerItems = orderItems.filter(item => item.sellerId.toString() === sellerId);
      
      // Create notification
      await Notification.create({
        userId: sellerId,
        type: 'order_placed',
        title: 'New Order Received',
        message: `You received an order for ${sellerItems.length} item(s). Order #${order.orderNumber}`,
        relatedId: order._id,
        relatedModel: 'Order',
        priority: 'high'
      });

      // Send email to seller
      await sendNewOrderNotificationToSeller(order, seller, sellerItems);
    }

    // Create notification for buyer
    await Notification.create({
      userId: req.user.id,
      type: 'order_placed',
      title: 'Order Placed Successfully',
      message: `Your order #${order.orderNumber} has been placed. Total: ₹${order.totalAmount}`,
      relatedId: order._id,
      relatedModel: 'Order',
      priority: 'high'
    });

    // Send confirmation email to buyer
    await sendOrderConfirmationEmail(order, buyer);

    // Populate order details
    await order.populate([
      { path: 'buyerId', select: 'name email hostel profileImage' },
      { path: 'items.sellerId', select: 'name email hostel profileImage' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's orders (as buyer)
 * @route   GET /api/orders/my-orders
 * @access  Private
 */
exports.getMyOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = { buyerId: req.user.id };
    if (status) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const orders = await Order.find(query)
      .populate('items.sellerId', 'name email hostel profileImage')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get orders where user is seller
 * @route   GET /api/orders/selling
 * @access  Private
 */
exports.getSellingOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = { 'items.sellerId': req.user.id };
    if (status) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const orders = await Order.find(query)
      .populate('buyerId', 'name email hostel profileImage')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyerId', 'name email hostel profileImage phone')
      .populate('items.sellerId', 'name email hostel profileImage phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is buyer or seller
    const isBuyer = order.buyerId._id.toString() === req.user.id;
    const isSeller = order.items.some(item => 
      item.sellerId._id.toString() === req.user.id
    );

    if (!isBuyer && !isSeller && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Confirm order delivery (buyer or seller)
 * @route   PUT /api/orders/:id/confirm
 * @access  Private
 */
exports.confirmOrderDelivery = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyerId', 'name email')
      .populate('items.sellerId', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const isBuyer = order.buyerId._id.toString() === req.user.id;
    const isSeller = order.items.some(item => 
      item.sellerId._id.toString() === req.user.id
    );

    if (!isBuyer && !isSeller) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to confirm this order'
      });
    }

    // Update confirmation status
    if (isBuyer) {
      order.confirmation.buyerConfirmed = true;
      order.confirmation.buyerConfirmedAt = new Date();
      
      // Notify sellers
      const sellerIds = [...new Set(order.items.map(item => item.sellerId._id.toString()))];
      for (const sellerId of sellerIds) {
        await Notification.create({
          userId: sellerId,
          type: 'order_confirmed',
          title: 'Buyer Confirmed Delivery',
          message: `Buyer confirmed delivery for order #${order.orderNumber}`,
          relatedId: order._id,
          relatedModel: 'Order',
          priority: 'high'
        });
      }
    }

    if (isSeller) {
      order.confirmation.sellerConfirmed = true;
      order.confirmation.sellerConfirmedAt = new Date();
      
      // Notify buyer
      await Notification.create({
        userId: order.buyerId._id,
        type: 'order_confirmed',
        title: 'Seller Confirmed Delivery',
        message: `Seller confirmed delivery for order #${order.orderNumber}`,
        relatedId: order._id,
        relatedModel: 'Order',
        priority: 'high'
      });

      // Send email to buyer for confirmation
      await sendDeliveryConfirmationRequest(order, order.buyerId, 'buyer');
    }

    // If both confirmed, mark as delivered
    if (order.confirmation.buyerConfirmed && order.confirmation.sellerConfirmed) {
      order.status = 'delivered';
      
      // Update listings to sold
      const listingIds = order.items.map(item => item.listingId);
      await Listing.updateMany(
        { _id: { $in: listingIds } },
        { status: 'sold' }
      );
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Delivery confirmed',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Complete order (after both parties confirm)
 * @route   PUT /api/orders/:id/complete
 * @access  Private
 */
exports.completeOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyerId', 'name email')
      .populate('items.sellerId', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Order must be delivered before completing'
      });
    }

    const isBuyer = order.buyerId._id.toString() === req.user.id;
    
    if (!isBuyer && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only buyer or admin can complete the order'
      });
    }

    order.status = 'completed';
    order.completedAt = new Date();
    order.paymentStatus = 'paid';
    await order.save();

    // Notify all parties
    await Notification.create({
      userId: order.buyerId._id,
      type: 'order_completed',
      title: 'Order Completed',
      message: `Order #${order.orderNumber} has been completed. Thank you!`,
      relatedId: order._id,
      relatedModel: 'Order',
      priority: 'medium'
    });

    const sellerIds = [...new Set(order.items.map(item => item.sellerId._id.toString()))];
    for (const sellerId of sellerIds) {
      const seller = await User.findById(sellerId);
      
      await Notification.create({
        userId: sellerId,
        type: 'order_completed',
        title: 'Order Completed',
        message: `Order #${order.orderNumber} has been completed successfully`,
        relatedId: order._id,
        relatedModel: 'Order',
        priority: 'medium'
      });

      // Send email
      await sendOrderCompletedEmail(order, seller);
    }

    // Send email to buyer
    await sendOrderCompletedEmail(order, order.buyerId);

    res.status(200).json({
      success: true,
      message: 'Order completed successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel order
 * @route   PUT /api/orders/:id/cancel
 * @access  Private
 */
exports.cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;
    
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status === 'completed' || order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel ${order.status} order`
      });
    }

    const isBuyer = order.buyerId.toString() === req.user.id;
    const isSeller = order.items.some(item => 
      item.sellerId.toString() === req.user.id
    );

    if (!isBuyer && !isSeller && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = reason;
    await order.save();

    // Make listings available again
    const listingIds = order.items.map(item => item.listingId);
    await Listing.updateMany(
      { _id: { $in: listingIds } },
      { status: 'available' }
    );

    // Notify all parties
    await Notification.create({
      userId: order.buyerId,
      type: 'order_cancelled',
      title: 'Order Cancelled',
      message: `Order #${order.orderNumber} has been cancelled`,
      relatedId: order._id,
      relatedModel: 'Order',
      priority: 'high'
    });

    const sellerIds = [...new Set(order.items.map(item => item.sellerId.toString()))];
    for (const sellerId of sellerIds) {
      await Notification.create({
        userId: sellerId,
        type: 'order_cancelled',
        title: 'Order Cancelled',
        message: `Order #${order.orderNumber} has been cancelled`,
        relatedId: order._id,
        relatedModel: 'Order',
        priority: 'high'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};
