const Listing = require("../models/Listing");
const User = require("../models/User");

/**
 * @desc    Get all listings with filters and pagination
 * @route   GET /api/listings
 * @access  Public
 */
exports.getListings = async (req, res, next) => {
  try {
    const {
      category,
      condition,
      minPrice,
      maxPrice,
      search,
      status = "available",
      sort = "-createdAt",
      page = 1,
      limit = 20,
    } = req.query;

    // Build query
    const query = { status };

    if (category) {
      query.category = category;
    }

    if (condition) {
      query.condition = condition;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Execute query with pagination
    const skip = (Number(page) - 1) * Number(limit);

    const listings = await Listing.find(query)
      .populate("sellerId", "name email university profileImage")
      .sort(sort)
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
 * @desc    Get single listing by ID
 * @route   GET /api/listings/:id
 * @access  Public
 */
exports.getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id).populate(
      "sellerId",
      "name email university profileImage phoneNumber"
    );

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    // Increment views
    await listing.incrementViews();

    res.status(200).json({
      success: true,
      data: listing,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new listing
 * @route   POST /api/listings
 * @access  Private
 */
exports.createListing = async (req, res, next) => {
  try {
    const {
      title,
      description,
      price,
      category,
      condition,
      location,
      isNegotiable,
      tags,
    } = req.body;

    // Handle image uploads
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => `/uploads/${file.filename}`);
    } else {
      return res.status(400).json({
        success: false,
        message: "Please upload at least one image",
      });
    }

    const listing = await Listing.create({
      title,
      description,
      price,
      category,
      condition,
      location,
      isNegotiable,
      tags,
      images,
      sellerId: req.user.id,
    });

    const populatedListing = await Listing.findById(listing._id).populate(
      "sellerId",
      "name email university"
    );

    res.status(201).json({
      success: true,
      message: "Listing created successfully",
      data: populatedListing,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update listing
 * @route   PUT /api/listings/:id
 * @access  Private
 */
exports.updateListing = async (req, res, next) => {
  try {
    let listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    // Check ownership
    if (
      listing.sellerId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this listing",
      });
    }

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => `/uploads/${file.filename}`);
      req.body.images = [...(listing.images || []), ...newImages];
    }

    listing = await Listing.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("sellerId", "name email university");

    res.status(200).json({
      success: true,
      message: "Listing updated successfully",
      data: listing,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete listing
 * @route   DELETE /api/listings/:id
 * @access  Private
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

    // Check ownership
    if (
      listing.sellerId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this listing",
      });
    }

    await listing.deleteOne();

    res.status(200).json({
      success: true,
      message: "Listing deleted successfully",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's own listings
 * @route   GET /api/listings/my/listings
 * @access  Private
 */
exports.getMyListings = async (req, res, next) => {
  try {
    const listings = await Listing.find({ sellerId: req.user.id }).sort(
      "-createdAt"
    );

    res.status(200).json({
      success: true,
      count: listings.length,
      data: listings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add listing to wishlist
 * @route   POST /api/listings/:id/wishlist
 * @access  Private
 */
exports.addToWishlist = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    const user = await User.findById(req.user.id);

    // Check if already in wishlist
    if (user.wishlist.includes(listing._id)) {
      return res.status(400).json({
        success: false,
        message: "Listing already in wishlist",
      });
    }

    user.wishlist.push(listing._id);
    await user.save();

    // Add user to listing's wishlistedBy
    if (!listing.wishlistedBy.includes(user._id)) {
      listing.wishlistedBy.push(user._id);
      await listing.save();
    }

    res.status(200).json({
      success: true,
      message: "Listing added to wishlist",
      data: user.wishlist,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove listing from wishlist
 * @route   DELETE /api/listings/:id/wishlist
 * @access  Private
 */
exports.removeFromWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== req.params.id
    );
    await user.save();

    // Remove user from listing's wishlistedBy
    const listing = await Listing.findById(req.params.id);
    if (listing) {
      listing.wishlistedBy = listing.wishlistedBy.filter(
        (id) => id.toString() !== user._id.toString()
      );
      await listing.save();
    }

    res.status(200).json({
      success: true,
      message: "Listing removed from wishlist",
      data: user.wishlist,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's wishlist
 * @route   GET /api/listings/wishlist
 * @access  Private
 */
exports.getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "wishlist",
      populate: { path: "sellerId", select: "name email university" },
    });

    res.status(200).json({
      success: true,
      count: user.wishlist.length,
      data: user.wishlist,
    });
  } catch (error) {
    next(error);
  }
};
