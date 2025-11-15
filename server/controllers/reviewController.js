const Review = require("../models/Review");
const User = require("../models/User");
const Listing = require("../models/Listing");

/**
 * @desc    Create a review for a user
 * @route   POST /api/reviews
 * @access  Private
 */
const createReview = async (req, res, next) => {
  try {
    const { reviewedUserId, listingId, rating, comment, transaction } =
      req.body;

    // Check if listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    // Prevent self-review
    if (reviewedUserId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot review yourself",
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      reviewer: req.user.id,
      reviewedUser: reviewedUserId,
      listing: listingId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this transaction",
      });
    }

    const review = await Review.create({
      reviewer: req.user.id,
      reviewedUser: reviewedUserId,
      listing: listingId,
      rating,
      comment,
      transaction,
    });

    const populatedReview = await Review.findById(review._id)
      .populate("reviewer", "name profileImage")
      .populate("listing", "title");

    // Update user badges based on rating
    await updateUserBadges(reviewedUserId);

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: populatedReview,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get reviews for a user
 * @route   GET /api/reviews/user/:userId
 * @access  Public
 */
const getUserReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const reviews = await Review.find({ reviewedUser: req.params.userId })
      .populate("reviewer", "name profileImage averageRating")
      .populate("listing", "title images")
      .sort("-createdAt")
      .skip(skip)
      .limit(Number(limit));

    const total = await Review.countDocuments({
      reviewedUser: req.params.userId,
    });

    const user = await User.findById(req.params.userId).select(
      "averageRating totalReviews"
    );

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      averageRating: user?.averageRating || 0,
      totalReviews: user?.totalReviews || 0,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get my reviews given to others
 * @route   GET /api/reviews/my-reviews
 * @access  Private
 */
const getMyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ reviewer: req.user.id })
      .populate("reviewedUser", "name profileImage")
      .populate("listing", "title images")
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a review
 * @route   PUT /api/reviews/:id
 * @access  Private
 */
const updateReview = async (req, res, next) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Check ownership
    if (review.reviewer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this review",
      });
    }

    const { rating, comment } = req.body;

    review = await Review.findByIdAndUpdate(
      req.params.id,
      { rating, comment },
      { new: true, runValidators: true }
    )
      .populate("reviewer", "name profileImage")
      .populate("listing", "title");

    // Recalculate average rating
    await Review.calculateAverageRating(review.reviewedUser);

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a review
 * @route   DELETE /api/reviews/:id
 * @access  Private
 */
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Check ownership or admin
    if (
      review.reviewer.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this review",
      });
    }

    const reviewedUserId = review.reviewedUser;
    await review.deleteOne();

    // Recalculate average rating
    await Review.calculateAverageRating(reviewedUserId);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to update user badges
 */
async function updateUserBadges(userId) {
  const user = await User.findById(userId);

  // Top Rated badge: 4.5+ rating with at least 5 reviews
  if (user.averageRating >= 4.5 && user.totalReviews >= 5) {
    user.badges.topRated = true;
  }

  // Trusted Seller badge: 10+ sales with 4+ rating
  if (user.stats.totalSales >= 10 && user.averageRating >= 4.0) {
    user.badges.trustedSeller = true;
  }

  await user.save();
}

module.exports = {
  createReview,
  getUserReviews,
  getMyReviews,
  updateReview,
  deleteReview,
};
