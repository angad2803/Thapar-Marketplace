const Report = require("../models/Report");
const Listing = require("../models/Listing");
const User = require("../models/User");

/**
 * @desc    Create a report
 * @route   POST /api/reports
 * @access  Private
 */
exports.createReport = async (req, res, next) => {
  try {
    const { listingId, reason, description } = req.body;
    const reporterId = req.user.id;

    // Check if listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    // Check if user already reported this listing
    const existingReport = await Report.findOne({ listingId, reporterId });
    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: "You have already reported this listing",
      });
    }

    // Create report
    const report = await Report.create({
      reporterId,
      listingId,
      reportedUserId: listing.sellerId,
      reason,
      description,
    });

    const populatedReport = await Report.findById(report._id)
      .populate("reporterId", "name email")
      .populate("listingId", "title price images")
      .populate("reportedUserId", "name email");

    res.status(201).json({
      success: true,
      message: "Report submitted successfully. We will review it shortly.",
      data: populatedReport,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all reports (admin)
 * @route   GET /api/reports
 * @access  Private/Admin
 */
exports.getAllReports = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const reports = await Report.find(query)
      .populate("reporterId", "name email university")
      .populate("listingId", "title price images status")
      .populate("reportedUserId", "name email university")
      .populate("reviewedBy", "name email")
      .sort("-createdAt")
      .skip(skip)
      .limit(Number(limit));

    const total = await Report.countDocuments(query);

    res.status(200).json({
      success: true,
      count: reports.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single report
 * @route   GET /api/reports/:id
 * @access  Private/Admin
 */
exports.getReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate("reporterId", "name email university phoneNumber")
      .populate("listingId")
      .populate("reportedUserId", "name email university phoneNumber")
      .populate("reviewedBy", "name email");

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update report status (admin)
 * @route   PUT /api/reports/:id
 * @access  Private/Admin
 */
exports.updateReport = async (req, res, next) => {
  try {
    const { status, reviewNotes, actionTaken } = req.body;

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    // Update report
    if (status) report.status = status;
    if (reviewNotes) report.reviewNotes = reviewNotes;
    if (actionTaken) report.actionTaken = actionTaken;

    report.reviewedBy = req.user.id;
    report.reviewedAt = new Date();

    await report.save();

    // Take action based on actionTaken
    if (actionTaken === "listing_removed") {
      await Listing.findByIdAndUpdate(report.listingId, { status: "inactive" });
    } else if (
      actionTaken === "user_suspended" ||
      actionTaken === "user_banned"
    ) {
      await User.findByIdAndUpdate(report.reportedUserId, { isActive: false });
    }

    const updatedReport = await Report.findById(report._id)
      .populate("reporterId", "name email")
      .populate("listingId", "title price")
      .populate("reportedUserId", "name email")
      .populate("reviewedBy", "name email");

    res.status(200).json({
      success: true,
      message: "Report updated successfully",
      data: updatedReport,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete report (admin)
 * @route   DELETE /api/reports/:id
 * @access  Private/Admin
 */
exports.deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    await report.deleteOne();

    res.status(200).json({
      success: true,
      message: "Report deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's reports
 * @route   GET /api/reports/my/reports
 * @access  Private
 */
exports.getMyReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ reporterId: req.user.id })
      .populate("listingId", "title price images status")
      .populate("reportedUserId", "name email")
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};
