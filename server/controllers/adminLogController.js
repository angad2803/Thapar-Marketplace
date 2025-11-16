const AdminLog = require("../models/AdminLog");
const User = require("../models/User");

/**
 * @desc    Get all admin logs
 * @route   GET /api/admin-logs
 * @access  Private/Admin
 */
exports.getAdminLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, adminId, action, targetType } = req.query;
    const query = {};
    if (adminId) query.adminId = adminId;
    if (action) query.action = action;
    if (targetType) query.targetType = targetType;
    const skip = (Number(page) - 1) * Number(limit);
    const logs = await AdminLog.find(query)
      .populate("adminId", "name email")
      .sort("-createdAt")
      .skip(skip)
      .limit(Number(limit));
    const total = await AdminLog.countDocuments(query);
    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create an admin log entry
 * @route   POST /api/admin-logs
 * @access  Private/Admin
 */
exports.createAdminLog = async (req, res, next) => {
  try {
    const { action, targetType, targetId, details } = req.body;
    const ipAddress =
      req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const log = await AdminLog.create({
      adminId: req.user.id,
      action,
      targetType,
      targetId,
      details,
      ipAddress,
    });
    res.status(201).json({
      success: true,
      data: log,
    });
  } catch (error) {
    next(error);
  }
};
