const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    rating: {
      type: Number,
      required: [true, "Please provide a rating"],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
    transaction: {
      type: String,
      enum: ["buyer", "seller"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
reviewSchema.index({ reviewedUser: 1, createdAt: -1 });
reviewSchema.index(
  { reviewer: 1, reviewedUser: 1, listing: 1 },
  { unique: true }
);

// Static method to calculate average rating
reviewSchema.statics.calculateAverageRating = async function (userId) {
  const stats = await this.aggregate([
    {
      $match: { reviewedUser: userId },
    },
    {
      $group: {
        _id: "$reviewedUser",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await mongoose.model("User").findByIdAndUpdate(userId, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      totalReviews: stats[0].totalReviews,
    });
  } else {
    await mongoose.model("User").findByIdAndUpdate(userId, {
      averageRating: 0,
      totalReviews: 0,
    });
  }
};

// Update average rating after save
reviewSchema.post("save", function () {
  this.constructor.calculateAverageRating(this.reviewedUser);
});

// Update average rating after remove
reviewSchema.post("remove", function () {
  this.constructor.calculateAverageRating(this.reviewedUser);
});

module.exports = mongoose.model("Review", reviewSchema);
