const User = require("../models/User");
const Listing = require("../models/Listing");
const Report = require("../models/Report");
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
    const totalTransactions = await Transaction.countDocuments();
    const pendingReports = await Report.countDocuments({ status: "pending" });

    // Recent activity
    const recentUsers = await User.find()
      .sort("-createdAt")
      .limit(5)
      .select("name email createdAt");
    const recentListings = await Listing.find()
      .sort("-createdAt")
      .limit(5)
      .populate("sellerId", "name email");

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          activeUsers,
          totalListings,
          activeListings,
          totalTransactions,
          pendingReports,
        },
        recentActivity: {
          users: recentUsers,
          listings: recentListings,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
