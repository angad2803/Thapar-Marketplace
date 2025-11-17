/**
 * @desc    Delete all listings (admin)
 * @route   DELETE /api/admin/listings/all
 * @access  Private/Admin
 */
exports.deleteAllListings = async (req, res, next) => {
  try {
    await Listing.deleteMany({});
    res.status(200).json({
      success: true,
      message: "All listings deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
const User = require("../models/User");
const Listing = require("../models/Listing");
const Report = require("../models/Report");
const Review = require("../models/Review");
const Transaction = require("../models/Transaction");
const Announcement = require("../models/Announcement");

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role, isActive } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { university: { $regex: search, $options: "i" } },
      ];
    }

    if (role) {
      query.role = role;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    const skip = (Number(page) - 1) * Number(limit);

    const users = await User.find(query)
      .select("-password")
      .sort("-createdAt")
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user details
 * @route   GET /api/admin/users/:id
 * @access  Private/Admin
 */
exports.getUserDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("wishlist");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get user's listings
    const listings = await Listing.find({ sellerId: user._id });

    // Get user's transactions
    const transactions = await Transaction.find({
      $or: [{ buyerId: user._id }, { sellerId: user._id }],
    }).limit(10);

    res.status(200).json({
      success: true,
      data: {
        user,
        stats: {
          listingsCount: listings.length,
          transactionsCount: transactions.length,
        },
        recentListings: listings.slice(0, 5),
        recentTransactions: transactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user status
 * @route   PUT /api/admin/users/:id/status
 * @access  Private/Admin
 */
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Don't allow deleting admin users
    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Cannot delete admin users",
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all listings (admin)
 * @route   GET /api/admin/listings
 * @access  Private/Admin
 */
exports.getAllListings = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const listings = await Listing.find(query)
      .populate("sellerId", "name email university")
      .sort("-createdAt")
      .skip(skip)
      .limit(Number(limit));

    const total = await Listing.countDocuments(query);

    res.status(200).json({
      success: true,
      count: listings.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: listings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete listing (admin)
 * @route   DELETE /api/admin/listings/:id
 * @access  Private/Admin
 */
exports.deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    await listing.deleteOne();

    res.status(200).json({
      success: true,
      message: "Listing deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create announcement
 * @route   POST /api/admin/announcements
 * @access  Private/Admin
 */
exports.createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, type, priority, targetAudience, expiresAt } =
      req.body;

    const announcement = await Announcement.create({
      title,
      content,
      type,
      priority,
      targetAudience,
      expiresAt,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Announcement created successfully",
      data: announcement,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all announcements (admin)
 * @route   GET /api/admin/announcements
 * @access  Private/Admin
 */
exports.getAllAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find()
      .populate("createdBy", "name email")
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update announcement
 * @route   PUT /api/admin/announcements/:id
 * @access  Private/Admin
 */
exports.updateAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Announcement updated successfully",
      data: announcement,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete announcement
 * @route   DELETE /api/admin/announcements/:id
 * @access  Private/Admin
 */
exports.deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found",
      });
    }

    await announcement.deleteOne();

    res.status(200).json({
      success: true,
      message: "Announcement deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get dashboard stats
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalListings = await Listing.countDocuments();
    const activeListings = await Listing.countDocuments({
      status: "available",
    });
    const soldListings = await Listing.countDocuments({ status: "sold" });
    const totalReviews = await Review.countDocuments();
    const pendingReports = await Report.countDocuments({ status: "pending" });

    // Top rated users
    const topRatedUsers = await User.find({ totalReviews: { $gte: 1 } })
      .sort("-averageRating -totalReviews")
      .limit(5)
      .select("name email averageRating totalReviews profileImage badges");

    // Top sellers
    const topSellers = await User.find({ "stats.totalSales": { $gte: 1 } })
      .sort("-stats.totalSales")
      .limit(5)
      .select("name email stats.totalSales averageRating profileImage");

    // Recent activity
    const recentUsers = await User.find()
      .sort("-createdAt")
      .limit(5)
      .select("name email createdAt hostel");

    const recentListings = await Listing.find()
      .sort("-createdAt")
      .limit(5)
      .populate("sellerId", "name email");

    const recentReviews = await Review.find()
      .sort("-createdAt")
      .limit(5)
      .populate("reviewer", "name profileImage")
      .populate("reviewedUser", "name profileImage")
      .populate("listing", "title");

    // Category distribution
    const categoryStats = await Listing.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Hostel distribution
    const hostelStats = await User.aggregate([
      { $match: { hostel: { $ne: null } } },
      { $group: { _id: "$hostel", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          activeUsers,
          totalListings,
          activeListings,
          soldListings,
          totalReviews,
          pendingReports,
        },
        topUsers: {
          topRated: topRatedUsers,
          topSellers: topSellers,
        },
        recentActivity: {
          users: recentUsers,
          listings: recentListings,
          reviews: recentReviews,
        },
        distributions: {
          categories: categoryStats,
          hostels: hostelStats,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user role
 * @route   PUT /api/admin/users/:id/role
 * @access  Private/Admin
 */
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user badges
 * @route   PUT /api/admin/users/:id/badges
 * @access  Private/Admin
 */
exports.updateUserBadges = async (req, res, next) => {
  try {
    const { verified, trustedSeller, quickResponder, topRated } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (verified !== undefined) user.badges.verified = verified;
    if (trustedSeller !== undefined) user.badges.trustedSeller = trustedSeller;
    if (quickResponder !== undefined)
      user.badges.quickResponder = quickResponder;
    if (topRated !== undefined) user.badges.topRated = topRated;

    await user.save();

    res.status(200).json({
      success: true,
      message: "User badges updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all reviews (admin)
 * @route   GET /api/admin/reviews
 * @access  Private/Admin
 */
exports.getAllReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, rating } = req.query;

    const query = {};
    if (rating) {
      query.rating = Number(rating);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const reviews = await Review.find(query)
      .populate("reviewer", "name email profileImage")
      .populate("reviewedUser", "name email profileImage")
      .populate("listing", "title images")
      .sort("-createdAt")
      .skip(skip)
      .limit(Number(limit));

    const total = await Review.countDocuments(query);

    // Review stats
    const avgRating = await Review.aggregate([
      { $group: { _id: null, average: { $avg: "$rating" } } },
    ]);

    const ratingDistribution = await Review.aggregate([
      { $group: { _id: "$rating", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      stats: {
        averageRating: avgRating[0]?.average || 0,
        distribution: ratingDistribution,
      },
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete review (admin)
 * @route   DELETE /api/admin/reviews/:id
 * @access  Private/Admin
 */
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
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
 * @desc    Bulk delete listings
 * @route   POST /api/admin/listings/bulk-delete
 * @access  Private/Admin
 */
exports.bulkDeleteListings = async (req, res, next) => {
  try {
    const { listingIds } = req.body;

    if (!Array.isArray(listingIds) || listingIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of listing IDs",
      });
    }

    const result = await Listing.deleteMany({ _id: { $in: listingIds } });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} listings deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Bulk ban users
 * @route   POST /api/admin/users/bulk-ban
 * @access  Private/Admin
 */
exports.bulkBanUsers = async (req, res, next) => {
  try {
    const { userIds } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of user IDs",
      });
    }

    // Don't ban admin users
    const result = await User.updateMany(
      { _id: { $in: userIds }, role: { $ne: "admin" } },
      { isActive: false }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} users banned successfully`,
      bannedCount: result.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get platform analytics
 * @route   GET /api/admin/analytics
 * @access  Private/Admin
 */
exports.getPlatformAnalytics = async (req, res, next) => {
  try {
    const { timeframe = "week" } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;

    switch (timeframe) {
      case "day":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "year":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // New users over time
    const newUsers = await User.countDocuments({
      createdAt: { $gte: startDate },
    });

    // New listings over time
    const newListings = await Listing.countDocuments({
      createdAt: { $gte: startDate },
    });

    // Listings sold
    const listingsSold = await Listing.countDocuments({
      status: "sold",
      updatedAt: { $gte: startDate },
    });

    // New reviews
    const newReviews = await Review.countDocuments({
      createdAt: { $gte: startDate },
    });

    // Most active users (by listings posted)
    const mostActiveUsers = await Listing.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: "$sellerId", listingsPosted: { $sum: 1 } } },
      { $sort: { listingsPosted: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          name: "$user.name",
          email: "$user.email",
          profileImage: "$user.profileImage",
          listingsPosted: 1,
        },
      },
    ]);

    // Popular categories
    const popularCategories = await Listing.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Engagement metrics
    const totalViews = await Listing.aggregate([
      { $group: { _id: null, totalViews: { $sum: "$views" } } },
    ]);

    const totalWishlists = await Listing.aggregate([
      { $project: { wishlistCount: { $size: "$wishlistedBy" } } },
      { $group: { _id: null, total: { $sum: "$wishlistCount" } } },
    ]);

    res.status(200).json({
      success: true,
      timeframe,
      data: {
        growth: {
          newUsers,
          newListings,
          listingsSold,
          newReviews,
        },
        mostActiveUsers,
        popularCategories,
        engagement: {
          totalViews: totalViews[0]?.totalViews || 0,
          totalWishlists: totalWishlists[0]?.total || 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
