const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Listing",
    required: true,
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  images: [String],
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "delivered",
        "completed",
        "cancelled",
        "disputed",
      ],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "online", "card", "upi"],
      default: "cash",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },
    deliveryDetails: {
      meetupLocation: {
        type: String,
        trim: true,
      },
      meetupTime: {
        type: Date,
      },
      deliveryMethod: {
        type: String,
        enum: ["pickup", "delivery", "hostel_exchange"],
        default: "hostel_exchange",
      },
      buyerHostel: String,
      notes: String,
    },
    confirmation: {
      buyerConfirmed: {
        type: Boolean,
        default: false,
      },
      buyerConfirmedAt: Date,
      sellerConfirmed: {
        type: Boolean,
        default: false,
      },
      sellerConfirmedAt: Date,
    },
    ratings: {
      buyerRating: {
        type: Number,
        min: 1,
        max: 5,
      },
      sellerRating: {
        type: Number,
        min: 1,
        max: 5,
      },
      buyerReview: {
        type: String,
        maxlength: 500,
      },
      sellerReview: {
        type: String,
        maxlength: 500,
      },
    },
    completedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    cancellationReason: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Generate order number
orderSchema.pre("validate", async function (next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    this.orderNumber = `ORD${timestamp}${random}`;
  }
  next();
});

// Indexes
orderSchema.index({ buyerId: 1, createdAt: -1 });
orderSchema.index({ "items.sellerId": 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model("Order", orderSchema);
