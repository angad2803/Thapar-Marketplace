const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

// Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        "http://localhost:3000/api/auth/google/callback",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        // Check if email is from thapar.edu domain
        if (!email.endsWith("@thapar.edu")) {
          return done(null, false, {
            message:
              "Only Thapar University email addresses (@thapar.edu) are allowed",
          });
        }

        // Check if user already exists
        let user = await User.findOne({ email });

        if (user) {
          // Update last login
          user.lastLogin = Date.now();
          user.isVerified = true;
          if (!user.googleId) {
            user.googleId = profile.id;
          }
          await user.save();
          return done(null, user);
        }

        // Create new user
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: email,
          profileImage: profile.photos[0]?.value,
          university: "Thapar Institute of Engineering and Technology",
          isVerified: true,
          lastLogin: Date.now(),
          profileCompleted: false, // User needs to complete hostel info
          password:
            Math.random().toString(36).slice(-8) +
            Math.random().toString(36).slice(-8), // Random password (won't be used)
        });

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
