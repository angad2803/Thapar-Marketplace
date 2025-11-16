const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getSellingOrders,
  getOrder,
  confirmOrderDelivery,
  completeOrder,
  cancelOrder
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// All order routes require authentication
router.use(protect);

router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/selling', getSellingOrders);
router.get('/:id', getOrder);
router.put('/:id/confirm', confirmOrderDelivery);
router.put('/:id/complete', completeOrder);
router.put('/:id/cancel', cancelOrder);

module.exports = router;
