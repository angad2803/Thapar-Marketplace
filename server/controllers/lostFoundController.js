const LostFound = require("../models/lostFound");

// Create lost/found item (Admin only)
const createItem = async (req, res) => {
  try {
    const {
      itemName,
      description,
      category,
      type,
      location,
      foundDate,
      contactInfo,
    } = req.body;

    // Validate required fields
    if (
      !itemName ||
      !description ||
      !category ||
      !type ||
      !location ||
      !foundDate
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // Get image paths
    const images = req.files
      ? req.files.map((file) => `/uploads/${file.filename}`)
      : [];

    const lostFoundItem = new LostFound({
      itemName,
      description,
      category,
      type,
      location,
      foundDate,
      images,
      reportedBy: req.user.id,
      contactInfo: contactInfo || "Contact Admin Office - Extension 2500",
    });

    await lostFoundItem.save();

    res.status(201).json({
      success: true,
      message: "Lost & Found item posted successfully",
      data: lostFoundItem,
    });
  } catch (error) {
    console.error("Error creating lost/found item:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create lost/found item",
    });
  }
};

// Get all lost/found items
const getAllItems = async (req, res) => {
  try {
    const { type, category, status } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (status) filter.status = status;

    const items = await LostFound.find(filter)
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    console.error("Error fetching lost/found items:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch lost/found items",
    });
  }
};

// Get single lost/found item
const getItemById = async (req, res) => {
  try {
    const item = await LostFound.findById(req.params.id).populate(
      "reportedBy",
      "name email"
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error("Error fetching lost/found item:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch item",
    });
  }
};

// Update item status (Admin only)
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["active", "claimed", "returned"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const item = await LostFound.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: item,
    });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update status",
    });
  }
};

// Delete item (Admin only)
const deleteItem = async (req, res) => {
  try {
    const item = await LostFound.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Item deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete item",
    });
  }
};

module.exports = {
  createItem,
  getAllItems,
  getItemById,
  updateStatus,
  deleteItem,
};
