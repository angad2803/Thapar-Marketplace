require("dotenv").config();
const mongoose = require("mongoose");
const Listing = require("../models/Listing");

/**
 * Clear seed data from database
 * Run: node utils/clearSeedData.js
 */

const clearSeedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb://localhost:27017/university_marketplace"
    );
    console.log("✓ Connected to MongoDB");

    // Delete specific seed listings by title
    const seedTitles = [
      "MacBook Pro 2021 M1",
      "Calculus Textbook - 10th Edition",
      "Study Desk and Chair Set",
      "Bicycle - Mountain Bike",
      "Winter Jacket - North Face",
      "Scientific Calculator - TI-84",
    ];

    const result = await Listing.deleteMany({
      title: { $in: seedTitles },
    });

    console.log(`✅ Deleted ${result.deletedCount} seed listings`);

    // Also delete users with dummy emails (optional)
    const User = require("../models/User");
    const userResult = await User.deleteMany({
      email: {
        $in: [
          "admin@university.edu",
          "john.smith@university.edu",
          "emma.j@university.edu",
          "michael.b@university.edu",
        ],
      },
    });

    console.log(`✅ Deleted ${userResult.deletedCount} seed users`);
    console.log("\n✨ All seed data cleared successfully!\n");

    process.exit(0);
  } catch (error) {
    console.error("✗ Error clearing data:", error);
    process.exit(1);
  }
};

clearSeedData();
