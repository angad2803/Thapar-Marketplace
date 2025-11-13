# Google OAuth Only - Authentication Flow

## 🔐 Authentication Method: Google OAuth Only

Traditional email/password authentication has been **disabled**. Users can only sign in using their **@thapar.edu** Google account.

---

## 🔄 Complete Authentication Flow

### **Step 1: User Clicks "Sign in with Google"**

**Frontend Button:**

```jsx
<button
  onClick={() =>
    (window.location.href = "http://localhost:3000/api/auth/google")
  }
>
  Sign in with Thapar Email
</button>
```

---

### **Step 2: Google OAuth (Automatic)**

- User selects Google account
- Must be **@thapar.edu** email
- Google returns user data to backend

---

### **Step 3: Backend Redirect (Automatic)**

**For New Users (Profile Not Complete):**

```
Redirect to: http://localhost:8080/complete-profile?token=JWT_TOKEN
```

**For Existing Users (Profile Complete):**

```
Redirect to: http://localhost:8080/auth/callback?token=JWT_TOKEN
```

---

### **Step 4: Complete Profile (New Users Only)**

New users must complete their profile before accessing the platform.

**Endpoint:**

```
PUT /api/auth/complete-profile
```

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**

```json
{
  "hostel": "A Block",
  "roomNumber": "101",
  "phoneNumber": "9876543210"
}
```

**Hostel Options:**

- A Block
- B Block
- C Block
- D Block
- E Block
- F Block
- G Block
- H Block
- J Block
- K Block
- L Block
- M Block
- Day Scholar
- Off Campus

**Success Response:**

```json
{
  "success": true,
  "message": "Profile completed successfully",
  "data": {
    "user": {
      "id": "673abc123...",
      "name": "John Doe",
      "email": "john@thapar.edu",
      "hostel": "A Block",
      "roomNumber": "101",
      "phoneNumber": "9876543210",
      "profileCompleted": true
    }
  }
}
```

---

## 📱 Frontend Implementation

### **1. Login Page (Only Google Button)**

```jsx
// src/pages/Login.jsx
import React from "react";

const Login = () => {
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:3000/api/auth/google";
  };

  return (
    <div className="login-container">
      <h1>Thapar University Marketplace</h1>
      <p>Sign in with your Thapar email to continue</p>

      <button onClick={handleGoogleLogin} className="google-btn">
        <img src="/google-icon.svg" alt="Google" />
        Sign in with Google
      </button>

      <p className="note">Only @thapar.edu emails are allowed</p>
    </div>
  );
};

export default Login;
```

---

### **2. OAuth Callback Handler**

```jsx
// src/pages/AuthCallback.jsx
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      // Store token
      localStorage.setItem("token", token);

      // Redirect to dashboard
      navigate("/dashboard");
    } else {
      navigate("/login?error=Authentication failed");
    }
  }, [searchParams, navigate]);

  return <div>Logging you in...</div>;
};

export default AuthCallback;
```

---

### **3. Complete Profile Page**

```jsx
// src/pages/CompleteProfile.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const CompleteProfile = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    hostel: "",
    roomNumber: "",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hostels = [
    "A Block",
    "B Block",
    "C Block",
    "D Block",
    "E Block",
    "F Block",
    "G Block",
    "H Block",
    "J Block",
    "K Block",
    "L Block",
    "M Block",
    "Day Scholar",
    "Off Campus",
  ];

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("token", token);
    } else {
      navigate("/login");
    }
  }, [searchParams, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        "http://localhost:3000/api/auth/complete-profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        // Profile completed, redirect to dashboard
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to complete profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="complete-profile-container">
      <h2>Welcome to Thapar Marketplace!</h2>
      <p>Please complete your profile to continue</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Hostel *</label>
          <select
            value={formData.hostel}
            onChange={(e) =>
              setFormData({ ...formData, hostel: e.target.value })
            }
            required
          >
            <option value="">Select your hostel</option>
            {hostels.map((hostel) => (
              <option key={hostel} value={hostel}>
                {hostel}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Room Number (Optional)</label>
          <input
            type="text"
            placeholder="e.g., 101"
            value={formData.roomNumber}
            onChange={(e) =>
              setFormData({ ...formData, roomNumber: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Phone Number (Optional)</label>
          <input
            type="tel"
            placeholder="e.g., 9876543210"
            value={formData.phoneNumber}
            onChange={(e) =>
              setFormData({ ...formData, phoneNumber: e.target.value })
            }
          />
        </div>

        {error && <div className="error">{error}</div>}

        <button type="submit" disabled={loading || !formData.hostel}>
          {loading ? "Saving..." : "Complete Profile"}
        </button>
      </form>
    </div>
  );
};

export default CompleteProfile;
```

---

### **4. Router Setup**

```jsx
// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import CompleteProfile from "./pages/CompleteProfile";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

---

## 🔒 Protected Routes Middleware

```jsx
// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const checkAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get("http://localhost:3000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          setUser(response.data.data.user);

          // Check if profile is complete
          if (!response.data.data.user.profileCompleted) {
            window.location.href = "/complete-profile";
            return;
          }
        }
      } catch (error) {
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [token]);

  if (loading) return <div>Loading...</div>;
  if (!token || !user) return <Navigate to="/login" />;

  return children;
};

export default ProtectedRoute;
```

---

## 📊 Updated User Model Fields

```javascript
{
  "googleId": "string (unique)",
  "name": "string",
  "email": "string (@thapar.edu)",
  "profileImage": "string (from Google)",
  "university": "Thapar Institute of Engineering and Technology",
  "hostel": "enum (A Block, B Block, etc.)",
  "roomNumber": "string (optional)",
  "phoneNumber": "string (optional)",
  "profileCompleted": "boolean",
  "isVerified": true,
  "role": "user",
  "wishlist": [],
  "isActive": true,
  "lastLogin": "date"
}
```

---

## 🧪 Testing the Flow

### **1. Test Google Login**

```
Open: http://localhost:3000/api/auth/google
```

### **2. Complete Profile (Postman)**

```
PUT http://localhost:3000/api/auth/complete-profile

Headers:
Authorization: Bearer YOUR_TOKEN

Body:
{
  "hostel": "A Block",
  "roomNumber": "101",
  "phoneNumber": "9876543210"
}
```

### **3. Get User Profile**

```
GET http://localhost:3000/api/auth/me

Headers:
Authorization: Bearer YOUR_TOKEN
```

---

## ✅ Key Changes Made

1. ✅ **Removed** traditional `/register` and `/login` endpoints
2. ✅ **Google OAuth** is the only authentication method
3. ✅ **Email restriction** to @thapar.edu only
4. ✅ **Added hostel** field to User model
5. ✅ **Added profileCompleted** flag
6. ✅ **Profile completion** required after first login
7. ✅ **Automatic redirect** based on profile status

---

## 🎓 Hostel Options Available

- A Block through M Block (12 hostels)
- Day Scholar
- Off Campus

---

**All users must complete their hostel information before accessing the marketplace!** 🏠
