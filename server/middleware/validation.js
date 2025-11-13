const { body, param, query, validationResult } = require("express-validator");

/**
 * Validation error handler
 */
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

/**
 * Auth validation rules
 */
exports.registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail()
    .custom((value) => {
      // Check university email domain
      const universityDomains = [".edu", "@university.edu"];
      const isUniversityEmail = universityDomains.some((domain) =>
        value.includes(domain)
      );
      if (!isUniversityEmail) {
        throw new Error("Please use a valid university email address");
      }
      return true;
    }),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("university")
    .trim()
    .notEmpty()
    .withMessage("University name is required"),
];

exports.loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email"),

  body("password").notEmpty().withMessage("Password is required"),
];

/**
 * Listing validation rules
 */
exports.createListingValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters"),

  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isNumeric()
    .withMessage("Price must be a number")
    .isFloat({ min: 0 })
    .withMessage("Price cannot be negative"),

  body("category")
    .notEmpty()
    .withMessage("Category is required")
    .isIn([
      "Electronics",
      "Books",
      "Furniture",
      "Clothing",
      "Sports",
      "Stationery",
      "Vehicles",
      "Services",
      "Other",
    ])
    .withMessage("Invalid category"),

  body("condition")
    .notEmpty()
    .withMessage("Condition is required")
    .isIn(["New", "Like New", "Good", "Fair", "Poor"])
    .withMessage("Invalid condition"),
];

exports.updateListingValidation = [
  param("id").isMongoId().withMessage("Invalid listing ID"),

  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters"),

  body("price")
    .optional()
    .isNumeric()
    .withMessage("Price must be a number")
    .isFloat({ min: 0 })
    .withMessage("Price cannot be negative"),

  body("category")
    .optional()
    .isIn([
      "Electronics",
      "Books",
      "Furniture",
      "Clothing",
      "Sports",
      "Stationery",
      "Vehicles",
      "Services",
      "Other",
    ])
    .withMessage("Invalid category"),

  body("condition")
    .optional()
    .isIn(["New", "Like New", "Good", "Fair", "Poor"])
    .withMessage("Invalid condition"),

  body("status")
    .optional()
    .isIn(["available", "pending", "sold", "inactive"])
    .withMessage("Invalid status"),
];

/**
 * Message validation rules
 */
exports.sendMessageValidation = [
  body("receiverId")
    .notEmpty()
    .withMessage("Receiver ID is required")
    .isMongoId()
    .withMessage("Invalid receiver ID"),

  body("content")
    .trim()
    .notEmpty()
    .withMessage("Message content is required")
    .isLength({ min: 1, max: 1000 })
    .withMessage("Message must be between 1 and 1000 characters"),

  body("listingId").optional().isMongoId().withMessage("Invalid listing ID"),
];

/**
 * Report validation rules
 */
exports.createReportValidation = [
  body("listingId")
    .notEmpty()
    .withMessage("Listing ID is required")
    .isMongoId()
    .withMessage("Invalid listing ID"),

  body("reason")
    .notEmpty()
    .withMessage("Reason is required")
    .isIn([
      "Spam",
      "Inappropriate Content",
      "Misleading Information",
      "Scam/Fraud",
      "Duplicate Listing",
      "Prohibited Item",
      "Other",
    ])
    .withMessage("Invalid reason"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),
];

/**
 * Query validation rules
 */
exports.listingQueryValidation = [
  query("category")
    .optional()
    .isIn([
      "Electronics",
      "Books",
      "Furniture",
      "Clothing",
      "Sports",
      "Stationery",
      "Vehicles",
      "Services",
      "Other",
    ])
    .withMessage("Invalid category"),

  query("condition")
    .optional()
    .isIn(["New", "Like New", "Good", "Fair", "Poor"])
    .withMessage("Invalid condition"),

  query("minPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum price must be a positive number"),

  query("maxPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Maximum price must be a positive number"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
];

/**
 * ID parameter validation
 */
exports.mongoIdValidation = [
  param("id").isMongoId().withMessage("Invalid ID format"),
];

exports.userIdValidation = [
  param("userId").isMongoId().withMessage("Invalid user ID format"),
];

/**
 * Profile completion validation
 */
exports.completeProfileValidation = [
  body("hostel")
    .notEmpty()
    .withMessage("Hostel information is required")
    .isIn([
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
      "Off Campus"
    ])
    .withMessage("Please select a valid hostel"),

  body("roomNumber")
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage("Room number must be less than 10 characters"),

  body("phoneNumber")
    .optional()
    .trim()
    .isLength({ min: 10, max: 15 })
    .withMessage("Phone number must be between 10 and 15 digits")
    .matches(/^[0-9+\-\s()]*$/)
    .withMessage("Please provide a valid phone number"),
];
