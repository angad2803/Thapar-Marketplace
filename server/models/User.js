const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: false, // Not required for Google OAuth users
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: null,
    },
    profileImage: {
      type: String,
      default: null,
    },
    university: {
      type: String,
      default: "Thapar Institute of Engineering and Technology",
      trim: true,
    },
    studentId: {
      type: String,
      trim: true,
      default: null,
    },
    hostel: {
      type: String,
      enum: [
        "Agira Hall (Hostel-A)",
        "Amritam Hall (Hostel-B)",
        "Prithvi Hall (Hostel-C)",
        "Neeram Hall (Hostel-D)",
        "Vyan Hall (Hostel-H)",
        "Tejas Hall (Hostel-J)",
        "Ambaram Hall (Hostel-K)",
        "Viyat Hall (Hostel-L)",
        "Anantam Hall (Hostel-M)",
        "Vyom Hall (Hostel-O)",
        "Vasudha Hall - Block E (Hostel-E)",
        "Vasudha Hall - Block G (Hostel-G)",
        "Ira Hall (Hostel-I)",
        "Ananta Hall (Hostel-N)",
        "Dhriti Hall (Hostel-PG)",
        "Vahni Hall (Hostel-Q)",
        "Hostel-FRF/G",
        "Day Scholar",
        "Off Campus",
      ],
      default: null,
    },
    roomNumber: {
      type: String,
      trim: true,
      default: null,
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    firebaseUid: {
      type: String,
    },
    googleId: {
      type: String,
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Listing",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ firebaseUid: 1 }, { unique: true, sparse: true });
userSchema.index({ googleId: 1 }, { unique: true, sparse: true });
userSchema.index({ university: 1 });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.virtual("listings", {
  ref: "Listing",
  localField: "_id",
  foreignField: "sellerId",
  justOne: false,
});

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

module.exports = mongoose.model("User", userSchema);
