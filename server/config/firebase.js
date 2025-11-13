/**
 * Firebase Admin Configuration
 * Used for verifying Firebase tokens and university email validation
 */

// Uncomment and configure when Firebase credentials are available
/*
const admin = require('firebase-admin');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});

const auth = admin.auth();
const storage = admin.storage();

module.exports = { admin, auth, storage };
*/

// Mock implementation for development
module.exports = {
  verifyIdToken: async (token) => {
    // Mock verification - replace with actual Firebase verification
    if (!token) throw new Error("No token provided");
    return {
      uid: "mock-uid-" + Date.now(),
      email: "student@university.edu",
      email_verified: true,
    };
  },

  validateUniversityEmail: (email) => {
    // Validate university email domain
    const universityDomains = [
      "@university.edu",
      "@student.university.edu",
      "@edu",
      // Add more university domains as needed
    ];

    return universityDomains.some((domain) => email.endsWith(domain));
  },
};
