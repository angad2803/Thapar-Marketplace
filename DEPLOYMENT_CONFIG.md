# Deployment Configuration Guide

## Environment Variables

### Vercel (Frontend) - https://thapar-marketplace-olxk.vercel.app

Set these in Vercel Project Settings → Environment Variables:

```
VITE_API_URL=https://hostelkart.onrender.com
```

### Render (Backend) - https://hostelkart.onrender.com

Set these in Render Dashboard → Environment Variables:

```
FRONTEND_URL=https://thapar-marketplace-olxk.vercel.app
GOOGLE_CALLBACK_URL=https://hostelkart.onrender.com/api/auth/google/callback
```

## Google OAuth Configuration

### Google Cloud Console Settings

**Authorized JavaScript origins:**

- `https://thapar-marketplace-olxk.vercel.app`
- `https://hostelkart.onrender.com`
- `http://localhost:8080` (for local development)
- `http://localhost:3000` (for local development)

**Authorized redirect URIs:**

- `https://hostelkart.onrender.com/api/auth/google/callback`
- `http://localhost:3000/api/auth/google/callback` (for local development)

## OAuth Flow

### Correct Flow:

1. User visits: `https://thapar-marketplace-olxk.vercel.app/login`
2. Clicks "Sign in with Google"
3. Frontend redirects to: `https://hostelkart.onrender.com/api/auth/google`
4. Backend redirects to Google OAuth consent screen
5. User approves with @thapar.edu email
6. Google redirects to: `https://hostelkart.onrender.com/api/auth/google/callback?code=...`
7. Backend validates and generates JWT token
8. Backend redirects to: `https://thapar-marketplace-olxk.vercel.app/auth/callback?token=...`
9. Frontend stores token and redirects to dashboard

### Common Errors:

**Error: "Missing required parameter: scope"**

- Cause: Directly accessing the callback URL without going through the OAuth flow
- Solution: Always start from the login page and click "Sign in with Google"

**Error: "404 Not Found" on /auth/callback**

- Cause: FRONTEND_URL not set correctly on backend
- Solution: Set FRONTEND_URL to `https://thapar-marketplace-olxk.vercel.app`

**Error: "Redirect URI mismatch"**

- Cause: Google OAuth settings don't include the callback URL
- Solution: Add callback URL to Google Cloud Console authorized redirect URIs

## Testing

1. Clear browser cache and cookies
2. Visit: `https://thapar-marketplace-olxk.vercel.app/login`
3. Click "Sign in with Google"
4. Use a @thapar.edu email
5. Should redirect to dashboard after successful authentication

## Local Development

For local development, use:

**Frontend (.env):**

```
VITE_API_URL=http://localhost:3000
```

**Backend (.env):**

```
FRONTEND_URL=http://localhost:8080
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```
