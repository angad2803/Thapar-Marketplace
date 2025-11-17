const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/emailService");
const User = require("../models/User");
const firebase = require("../config/firebase");

/**
 * Generate JWT Token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });
};

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, university, phoneNumber, studentId } =
      req.body;

    // Validate university email
    if (!firebase.validateUniversityEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please use a valid university email address",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      university,
      phoneNumber,
      studentId,
      isVerified: true, // Set to true for now, implement email verification later
    });

    // Generate token
    const token = generateToken(user._id);

    // Send registration email
    try {
      await sendEmail({
        to: user.email,
        subject: "Welcome to Thapar Marketplace!",
        text: `Hi ${user.name},\n\nThank you for registering at Thapar Marketplace. You can now buy and sell items with your campus community!`,
      });
    } catch (err) {
      console.error("Failed to send registration email:", err);
    }

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          university: user.university,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Please contact support.",
      });
    }

    // Verify password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          university: user.university,
          role: user.role,
          profileImage: user.profileImage,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate(
      "wishlist",
      "title price images status"
    );

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phoneNumber, profileImage } = req.body;

    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (phoneNumber) fieldsToUpdate.phoneNumber = phoneNumber;
    if (profileImage) fieldsToUpdate.profileImage = profileImage;

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/password
 * @access  Private
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select("+password");

    // Verify current password
    const isPasswordMatch = await user.comparePassword(currentPassword);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = async (req, res, next) => {
  try {
    // In a real application, you might want to blacklist the token
    // For now, just send a success response
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Google OAuth callback
 * @route   GET /api/auth/google/callback
 * @access  Public
 */
exports.googleCallback = async (req, res, next) => {
  try {
    // Generate JWT token
    const token = generateToken(req.user._id);

    // Send welcome email if first login (profileCompleted is false)
    if (!req.user.profileCompleted) {
      try {
        const { sendEmail } = require("../utils/emailService");
        await sendEmail({
          to: req.user.email,
          subject: "Welcome to Thapar Marketplace!",
          text: `Hi ${req.user.name},\n\nThank you for registering at Thapar Marketplace. You can now buy and sell items with your campus community!`,
        });
      } catch (err) {
        console.error("Failed to send OAuth registration email:", err);
      }
    }

    // Check if profile is completed
    const profileCompleted = req.user.profileCompleted;

    // Redirect to frontend with token and profile status
    const frontendURL = process.env.FRONTEND_URL || "http://localhost:8080";

    if (!profileCompleted) {
      // Redirect to complete profile page
      res.redirect(`${frontendURL}/complete-profile?token=${token}`);
    } else {
      // Redirect to dashboard
      res.redirect(`${frontendURL}/auth/callback?token=${token}`);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Complete user profile (hostel info)
 * @route   PUT /api/auth/complete-profile
 * @access  Private
 */
exports.completeProfile = async (req, res, next) => {
  try {
    const { hostel, roomNumber, phoneNumber, upiId } = req.body;

    if (!hostel) {
      return res.status(400).json({
        success: false,
        message: "Hostel information is required",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update profile
    user.hostel = hostel;
    user.roomNumber = roomNumber || null;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.upiId = upiId || user.upiId;
    user.profileCompleted = true;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile completed successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          hostel: user.hostel,
          roomNumber: user.roomNumber,
          phoneNumber: user.phoneNumber,
          upiId: user.upiId,
          profileCompleted: user.profileCompleted,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user's public key for E2EE
 * @route   PUT /api/auth/public-key
 * @access  Private
 */
exports.updatePublicKey = async (req, res, next) => {
  try {
    const { publicKey } = req.body;

    if (!publicKey) {
      return res.status(400).json({
        success: false,
        message: "Public key is required",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.publicKey = publicKey;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Public key updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's public key
 * @route   GET /api/auth/public-key/:userId
 * @access  Private
 */
exports.getPublicKey = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).select(
      "publicKey name"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        publicKey: user.publicKey,
        name: user.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Google OAuth failure
 * @route   GET /api/auth/google/failure
 * @access  Public
 */
exports.googleFailure = async (req, res, next) => {
  try {
    const frontendURL = process.env.FRONTEND_URL || "http://localhost:8080";
    res.redirect(
      `${frontendURL}/login?error=Only Thapar University emails are allowed`
    );
  } catch (error) {
    next(error);
  }
};
