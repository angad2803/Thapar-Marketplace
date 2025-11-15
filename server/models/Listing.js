const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a title"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Please provide a description"],
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Please provide a price"],
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Please select a category"],
      enum: [
        "Electronics",
        "Books",
        "Furniture",
        "Clothing",
        "Sports",
        "Stationery",
        "Vehicles",
        "Services",
        "Other",
      ],
    },
    condition: {
      type: String,
      required: [true, "Please specify condition"],
      enum: ["New", "Like New", "Good", "Fair", "Poor"],
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "pending", "sold", "inactive"],
      default: "available",
    },
    location: {
      type: String,
      trim: true,
      default: "On Campus",
    },
    sellerHostel: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    wishlistedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    isNegotiable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for efficient queries
listingSchema.index({ sellerId: 1, status: 1 });
listingSchema.index({ category: 1, status: 1 });
listingSchema.index({ sellerHostel: 1, status: 1 });
listingSchema.index({ price: 1 });
listingSchema.index({ createdAt: -1 });
listingSchema.index({ title: "text", description: "text", tags: "text" });

// Virtual for seller details
listingSchema.virtual("seller", {
  ref: "User",
  localField: "sellerId",
  foreignField: "_id",
  justOne: true,
});

// Increment views
listingSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

module.exports = mongoose.model("Listing", listingSchema);
