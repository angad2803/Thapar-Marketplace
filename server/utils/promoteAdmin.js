const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const User = require("../models/User");

const promoteToAdmin = async (email) => {
  try {
    // Connect to database
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI not set in environment variables");
    }
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✓ MongoDB connected");

    // Find and update user
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        role: "admin",
        "badges.verified": true,
      },
      { new: true }
    ).select("-password");

    if (!user) {
      console.log(`✗ User with email ${email} not found`);
      console.log(
        "User needs to sign up first before being promoted to admin."
      );
      process.exit(1);
    }

    console.log("\n✅ User promoted to admin successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`Name:     ${user.name}`);
    console.log(`Email:    ${user.email}`);
    console.log(`Role:     ${user.role}`);
    console.log(`Verified: ${user.badges.verified}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("✗ Error:", error.message);
    process.exit(1);
  }
};

// Get email from command line argument
const email = process.argv[2] || "amadhok_be23@thapar.edu";

console.log(`\n🔧 Promoting ${email} to admin...\n`);
promoteToAdmin(email);
