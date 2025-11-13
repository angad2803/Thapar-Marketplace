require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Listing = require("../models/Listing");

/**
 * Seed Database with Dummy Data
 * Run: npm run seed
 */

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb://localhost:27017/university_marketplace"
    );
    console.log("✓ Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Listing.deleteMany({});
    console.log("✓ Cleared existing data");

    // Create admin user
    const admin = await User.create({
      name: "Admin User",
      email: "admin@university.edu",
      password: "admin123",
      university: "University of Technology",
      role: "admin",
      isVerified: true,
      isActive: true,
    });
    console.log("✓ Created admin user");

    // Create regular users
    const users = await User.create([
      {
        name: "John Smith",
        email: "john.smith@university.edu",
        password: "password123",
        university: "University of Technology",
        phoneNumber: "+1234567890",
        studentId: "STU001",
        isVerified: true,
      },
      {
        name: "Emma Johnson",
        email: "emma.j@university.edu",
        password: "password123",
        university: "University of Technology",
        phoneNumber: "+1234567891",
        studentId: "STU002",
        isVerified: true,
      },
      {
        name: "Michael Brown",
        email: "michael.b@university.edu",
        password: "password123",
        university: "University of Technology",
        phoneNumber: "+1234567892",
        studentId: "STU003",
        isVerified: true,
      },
    ]);
    console.log(`✓ Created ${users.length} users`);

    // Create sample listings
    const listings = await Listing.create([
      {
        title: "MacBook Pro 2021 M1",
        description:
          "Excellent condition MacBook Pro with M1 chip. 16GB RAM, 512GB SSD. Barely used, still under warranty.",
        price: 1200,
        category: "Electronics",
        condition: "Like New",
        images: ["/uploads/macbook.jpg"],
        sellerId: users[0]._id,
        status: "available",
        location: "Engineering Building",
        tags: ["laptop", "apple", "macbook"],
      },
      {
        title: "Calculus Textbook - 10th Edition",
        description:
          "Calculus textbook in great condition. No highlighting or writing inside.",
        price: 50,
        category: "Books",
        condition: "Good",
        images: ["/uploads/textbook.jpg"],
        sellerId: users[1]._id,
        status: "available",
        location: "Library",
        tags: ["textbook", "math", "calculus"],
      },
      {
        title: "Study Desk and Chair Set",
        description:
          "Sturdy wooden desk and comfortable office chair. Perfect for dorm room.",
        price: 80,
        category: "Furniture",
        condition: "Good",
        images: ["/uploads/desk.jpg"],
        sellerId: users[0]._id,
        status: "available",
        location: "North Campus",
        tags: ["desk", "chair", "furniture", "study"],
      },
      {
        title: "Bicycle - Mountain Bike",
        description:
          "21-speed mountain bike in excellent condition. Recently serviced.",
        price: 150,
        category: "Vehicles",
        condition: "Like New",
        images: ["/uploads/bike.jpg"],
        sellerId: users[2]._id,
        status: "available",
        location: "Sports Complex",
        tags: ["bicycle", "bike", "transport"],
      },
      {
        title: "Winter Jacket - North Face",
        description:
          "Brand new North Face winter jacket, size M. Never worn, still has tags.",
        price: 120,
        category: "Clothing",
        condition: "New",
        images: ["/uploads/jacket.jpg"],
        sellerId: users[1]._id,
        status: "available",
        location: "Student Center",
        tags: ["jacket", "winter", "clothing", "northface"],
      },
      {
        title: "Scientific Calculator - TI-84",
        description:
          "Texas Instruments TI-84 Plus graphing calculator. Great for engineering courses.",
        price: 60,
        category: "Stationery",
        condition: "Good",
        images: ["/uploads/calculator.jpg"],
        sellerId: users[2]._id,
        status: "available",
        location: "Engineering Building",
        tags: ["calculator", "ti-84", "stationery"],
      },
    ]);
    console.log(`✓ Created ${listings.length} listings`);

    console.log("\n✅ Database seeded successfully!");
    console.log("\n📝 Login Credentials:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Admin:");
    console.log("  Email: admin@university.edu");
    console.log("  Password: admin123");
    console.log("\nRegular Users:");
    console.log("  Email: john.smith@university.edu");
    console.log("  Password: password123");
    console.log("\n  Email: emma.j@university.edu");
    console.log("  Password: password123");
    console.log("\n  Email: michael.b@university.edu");
    console.log("  Password: password123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    process.exit(0);
  } catch (error) {
    console.error("✗ Error seeding database:", error);
    process.exit(1);
  }
};

// Run seeder
seedData();
