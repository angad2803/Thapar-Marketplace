# Google OAuth Setup Guide for Thapar University Email (@thapar.edu)

This guide will help you set up Google OAuth authentication that only allows `@thapar.edu` email addresses.

---

## 🔐 **Step 1: Create Google Cloud Project**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a Project"** → **"New Project"**
3. **Project Name:** `Thapar Marketplace` (or any name you prefer)
4. Click **"Create"**
5. Wait for project creation (takes a few seconds)
6. Select your newly created project from the dropdown

---

## 📱 **Step 2: Enable Google+ API**

1. In the left sidebar, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"**
3. Click on it and click **"Enable"**
4. Wait for it to be enabled

---

## 🔑 **Step 3: Create OAuth 2.0 Credentials**

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**

### **Configure Consent Screen (if prompted):**

- Click **"Configure Consent Screen"**
- Select **"External"** (for testing with any Google account)
- Click **"Create"**

**App Information:**

- **App name:** `Thapar University Marketplace`
- **User support email:** Your email
- **Developer contact:** Your email
- Click **"Save and Continue"**

**Scopes:**

- Click **"Add or Remove Scopes"**
- Select:
  - `../auth/userinfo.email`
  - `../auth/userinfo.profile`
- Click **"Update"** → **"Save and Continue"**

**Test Users (Optional):**

- Add your `@thapar.edu` email for testing
- Click **"Save and Continue"**

**Summary:**

- Click **"Back to Dashboard"**

### **Create OAuth Client ID:**

1. Go back to **"Credentials"** → **"Create Credentials"** → **"OAuth client ID"**
2. **Application type:** Select **"Web application"**
3. **Name:** `Thapar Marketplace Web Client`

4. **Authorized JavaScript origins:**

   - Click **"Add URI"**
   - Add: `http://localhost:3000`
   - Click **"Add URI"**
   - Add: `http://localhost:8080`

5. **Authorized redirect URIs:**

   - Click **"Add URI"**
   - Add: `http://localhost:3000/api/auth/google/callback`

6. Click **"Create"**

---

## 📋 **Step 4: Copy Credentials**

After creating, you'll see a popup with:

- **Client ID** (looks like: `123456789-abcdefg.apps.googleusercontent.com`)
- **Client Secret** (looks like: `GOCSPX-aBcDeFgHiJkLmNoPqRsTuVwXyZ`)

**⚠️ IMPORTANT:** Copy both and save them!

---

## 🔧 **Step 5: Update Your `.env` File**

Open `d:\SE\server\.env` and update these lines:

```env
GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_ACTUAL_CLIENT_SECRET_HERE
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
FRONTEND_URL=http://localhost:8080
```

**Example:**

```env
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-aBcDeFgHiJkLmNoPqRsTuVwX
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
FRONTEND_URL=http://localhost:8080
```

---

## 🚀 **Step 6: Restart Your Server**

Stop the current server (Ctrl+C) and restart:

```bash
cd d:\SE\server
npm run dev
```

---

## 🧪 **Step 7: Test Google OAuth**

### **Option 1: Test in Browser**

Open your browser and go to:

```
http://localhost:3000/api/auth/google
```

This should:

1. Redirect you to Google Sign-In
2. Show account selection
3. Only accept `@thapar.edu` emails
4. Redirect back to your frontend with a token

### **Option 2: Test in Postman**

1. **GET** `http://localhost:3000/api/auth/google`
2. Follow the OAuth flow in browser
3. You'll be redirected to: `http://localhost:8080/auth/callback?token=YOUR_JWT_TOKEN`

---

## ✅ **Email Domain Restriction**

The system is configured to **ONLY allow @thapar.edu emails**:

- ✅ `student@thapar.edu` - **Allowed**
- ✅ `faculty@thapar.edu` - **Allowed**
- ❌ `user@gmail.com` - **Rejected**
- ❌ `user@yahoo.com` - **Rejected**
- ❌ `user@university.edu` - **Rejected**

If a non-Thapar email tries to sign in, they'll see:

```
"Only Thapar University email addresses (@thapar.edu) are allowed"
```

---

## 🔄 **API Endpoints**

### **Initiate Google OAuth**

```
GET http://localhost:3000/api/auth/google
```

### **Callback (Automatic)**

```
GET http://localhost:3000/api/auth/google/callback
```

### **Failure Redirect**

```
GET http://localhost:3000/api/auth/google/failure
```

---

## 🎯 **Frontend Integration**

Add a "Sign in with Google" button in your frontend:

```html
<a href="http://localhost:3000/api/auth/google">
  <button>Sign in with Google (Thapar Email Only)</button>
</a>
```

Or in React:

```jsx
const handleGoogleLogin = () => {
  window.location.href = "http://localhost:3000/api/auth/google";
};

<button onClick={handleGoogleLogin}>Sign in with Google</button>;
```

---

## 🌐 **Production Setup**

For production deployment, update these in Google Cloud Console:

**Authorized JavaScript origins:**

- `https://yourdomain.com`

**Authorized redirect URIs:**

- `https://yourdomain.com/api/auth/google/callback`

And update your `.env`:

```env
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
FRONTEND_URL=https://yourdomain.com
```

---

## 🐛 **Troubleshooting**

### **Error: "redirect_uri_mismatch"**

- Make sure the redirect URI in Google Console matches exactly
- Should be: `http://localhost:3000/api/auth/google/callback`

### **Error: "Email not allowed"**

- Only `@thapar.edu` emails are allowed
- Check the email domain in the error message

### **Error: "Invalid client_id"**

- Check that `GOOGLE_CLIENT_ID` in `.env` is correct
- Make sure you copied the entire Client ID

### **Error: "Invalid client_secret"**

- Check that `GOOGLE_CLIENT_SECRET` in `.env` is correct
- Make sure there are no extra spaces

---

## 📝 **What Happens Behind the Scenes**

1. User clicks "Sign in with Google"
2. Redirected to Google OAuth consent screen
3. User signs in with their Google account
4. Google returns user profile data
5. **Backend checks if email ends with `@thapar.edu`**
6. If valid:
   - Create/update user in database
   - Generate JWT token
   - Redirect to frontend with token
7. If invalid:
   - Reject with error message
   - Redirect to login page with error

---

## 🎓 **Features Implemented**

- ✅ Google OAuth 2.0 authentication
- ✅ Email domain restriction (`@thapar.edu` only)
- ✅ Automatic user creation on first login
- ✅ JWT token generation
- ✅ Redirect to frontend with token
- ✅ Error handling for invalid emails
- ✅ Session management
- ✅ User profile extraction from Google

---

**That's it! Your Google OAuth with Thapar email restriction is now set up!** 🎉

Need help? Check the [troubleshooting section](#-troubleshooting) above.
