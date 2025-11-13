const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  reportedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    required: [true, 'Please provide a reason for reporting'],
    enum: [
      'Spam',
      'Inappropriate Content',
      'Misleading Information',
      'Scam/Fraud',
      'Duplicate Listing',
      'Prohibited Item',
      'Other'
    ]
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'resolved', 'dismissed'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Review notes cannot exceed 1000 characters']
  },
  actionTaken: {
    type: String,
    enum: ['none', 'warning', 'listing_removed', 'user_suspended', 'user_banned'],
    default: 'none'
  },
  reviewedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes
reportSchema.index({ listingId: 1, reporterId: 1 }, { unique: true });
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ reportedUserId: 1 });

module.exports = mongoose.model('Report', reportSchema);
