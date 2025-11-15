const User = require("../models/User");

/**
 * @desc    Follow a user
 * @route   POST /api/users/:userId/follow
 * @access  Private
 */
const followUser = async (req, res, next) => {
  try {
    const userToFollow = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent self-follow
    if (req.params.userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself",
      });
    }

    // Check if already following
    if (currentUser.following.includes(req.params.userId)) {
      return res.status(400).json({
        success: false,
        message: "You are already following this user",
      });
    }

    // Add to following list
    currentUser.following.push(req.params.userId);
    await currentUser.save();

    // Add to followers list
    userToFollow.followers.push(req.user.id);
    await userToFollow.save();

    res.status(200).json({
      success: true,
      message: "User followed successfully",
      data: {
        followingCount: currentUser.following.length,
        followersCount: userToFollow.followers.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Unfollow a user
 * @route   DELETE /api/users/:userId/follow
 * @access  Private
 */
const unfollowUser = async (req, res, next) => {
  try {
    const userToUnfollow = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.user.id);

    if (!userToUnfollow) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if following
    if (!currentUser.following.includes(req.params.userId)) {
      return res.status(400).json({
        success: false,
        message: "You are not following this user",
      });
    }

    // Remove from following list
    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== req.params.userId
    );
    await currentUser.save();

    // Remove from followers list
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (id) => id.toString() !== req.user.id
    );
    await userToUnfollow.save();

    res.status(200).json({
      success: true,
      message: "User unfollowed successfully",
      data: {
        followingCount: currentUser.following.length,
        followersCount: userToUnfollow.followers.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's followers
 * @route   GET /api/users/:userId/followers
 * @access  Public
 */
const getFollowers = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).populate(
      "followers",
      "name email profileImage averageRating totalReviews hostel"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      count: user.followers.length,
      data: user.followers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's following
 * @route   GET /api/users/:userId/following
 * @access  Public
 */
const getFollowing = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).populate(
      "following",
      "name email profileImage averageRating totalReviews hostel"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      count: user.following.length,
      data: user.following,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user profile with stats
 * @route   GET /api/users/:userId/profile
 * @access  Public
 */
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).select(
      "-password -publicKey"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if current user is following this user
    let isFollowing = false;
    if (req.user) {
      const currentUser = await User.findById(req.user.id);
      isFollowing = currentUser.following.includes(req.params.userId);
    }

    res.status(200).json({
      success: true,
      data: {
        ...user.toJSON(),
        followersCount: user.followers.length,
        followingCount: user.following.length,
        isFollowing,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getUserProfile,
};
