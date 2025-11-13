const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['initiated', 'completed', 'cancelled', 'disputed'],
    default: 'initiated'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'online', 'card', 'other'],
    default: 'cash'
  },
  meetupLocation: {
    type: String,
    trim: true
  },
  meetupTime: {
    type: Date
  },
  buyerRating: {
    type: Number,
    min: 1,
    max: 5
  },
  sellerRating: {
    type: Number,
    min: 1,
    max: 5
  },
  buyerReview: {
    type: String,
    maxlength: [500, 'Review cannot exceed 500 characters']
  },
  sellerReview: {
    type: String,
    maxlength: [500, 'Review cannot exceed 500 characters']
  },
  completedAt: {
    type: Date
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

// Indexes
transactionSchema.index({ buyerId: 1, createdAt: -1 });
transactionSchema.index({ sellerId: 1, createdAt: -1 });
transactionSchema.index({ listingId: 1 });
transactionSchema.index({ status: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
