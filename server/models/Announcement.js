const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Please provide content'],
    trim: true,
    maxlength: [2000, 'Content cannot exceed 2000 characters']
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'alert', 'maintenance', 'update'],
    default: 'info'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    default: null
  },
  targetAudience: {
    type: String,
    enum: ['all', 'buyers', 'sellers', 'new_users'],
    default: 'all'
  },
  viewedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Indexes
announcementSchema.index({ isActive: 1, createdAt: -1 });
announcementSchema.index({ expiresAt: 1 });
announcementSchema.index({ priority: 1, isActive: 1 });

// Auto-deactivate expired announcements
announcementSchema.pre('find', function() {
  const now = new Date();
  this.where({
    $or: [
      { expiresAt: null },
      { expiresAt: { $gt: now } }
    ]
  });
});

module.exports = mongoose.model('Announcement', announcementSchema);
