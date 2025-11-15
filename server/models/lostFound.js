const mongoose = require("mongoose");

const lostFoundSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Electronics",
        "Books",
        "Clothing",
        "Accessories",
        "ID Cards",
        "Keys",
        "Sports Equipment",
        "Other",
      ],
    },
    type: {
      type: String,
      required: true,
      enum: ["lost", "found"],
    },
    location: {
      type: String,
      required: true,
    },
    foundDate: {
      type: Date,
      required: true,
    },
    images: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ["active", "claimed", "returned"],
      default: "active",
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contactInfo: {
      type: String,
      default: "Contact Admin Office - Extension 2500",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("LostFound", lostFoundSchema);
