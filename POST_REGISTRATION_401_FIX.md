# 401 Unauthorized After Registration - Fix Guide

## Root Cause Identified ✅

The 401 errors on `/users/me`, `/users/me/overview`, `/users/me/weekly`, and `/users/me/onboarding` were caused by:

**The Register page was using `axios` directly instead of `apiClient`, which meant:**
- ❌ No `withCredentials: true` flag
- ❌ Cookies from the server response were NOT being automatically sent in subsequent requests
- ❌ Authentication cookies set by verify-otp were being ignored

---

## Fixes Applied

### 1. **Register Page - Use apiClient Instead of axios**

**File:** [frontend/src/pages/Register.jsx](frontend/src/pages/Register.jsx)

#### Changed Imports:
```javascript
// ❌ Before
import axios from "axios";
const API_URL = "http://localhost:8080/api/v1";

// ✅ After
import apiClient from "../api/apiClient";
```

#### Changed OTP Send Request:
```javascript
// ❌ Before
await axios.post(`${API_URL}/auth/signup/send-otp`, payload);

// ✅ After
await apiClient.post("/auth/signup/send-otp", payload);
```

#### Changed OTP Verify Request:
```javascript
// ❌ Before
const res = await axios.post(`${API_URL}/auth/signup/verify-otp`, payload);

// ✅ After
const res = await apiClient.post("/auth/signup/verify-otp", payload);
```

### 2. **Profile Page - Add Cookie Wait & Better Error Handling**

**File:** [frontend/src/pages/Profile.jsx](frontend/src/pages/Profile.jsx#L42)

#### Added Features:
- **100ms delay** to ensure cookies are fully set by browser
- **isMounted flag** to prevent state updates after unmount (React Strict Mode safety)
- **Proper 401 handling** - redirects to login if session expires
- **Better error logging** for debugging

```javascript
useEffect(() => {
    let isMounted = true;
    
    (async () => {
        try {
            // Add small delay to ensure cookies are fully set by browser
            await new Promise(resolve => setTimeout(resolve, 100));
            
            if (!isMounted) return;
            
            const [meRes, overviewRes, weeklyRes] = await Promise.all([
                getMe(),
                fetchOverview(),
                fetchWeekly(),
            ]);
            // ... rest of code
        } catch (err) {
            if (isMounted) {
                console.error("Profile data load error:", err.response?.status, err.message);
                if (err.response?.status === 401) {
                    toast.error("Session expired. Please login again.");
                    window.location.href = "/login";
                } else {
                    toast.error("Failed to load profile data");
                }
            }
        }
    })();

    return () => {
        isMounted = false;
    };
}, [setUser]);
```

---

## How It Works Now

### Registration Flow (Fixed ✅):
1. **User fills form** → Email, name, password
2. **Clicks "Send OTP"** → `apiClient.post("/auth/signup/send-otp")`
   - Has `withCredentials: true` ✅
   - Request succeeds

3. **User enters OTP** → 6-digit code
4. **Clicks "Verify & Complete"** → `apiClient.post("/auth/signup/verify-otp")`
   - Has `withCredentials: true` ✅
   - **Backend sets** `accessToken` and `refreshToken` cookies
   - Browser **automatically stores** cookies (because `withCredentials: true`)
   - Response returns user data

5. **Frontend redirects** to `/home` (which routes to Profile)
6. **Profile page loads**:
   - Waits 100ms for cookies to settle
   - Calls `getMe()` via `apiClient`
   - `apiClient` **automatically sends** cookies with request
   - Backend validates cookies → User authenticated ✅
   - Returns user data → No more 401!

---

## Authentication Flow Diagram

### ❌ Before (Broken):
```
Register Page
   ↓
axios.post (NO withCredentials)
   ↓
Backend sets cookies in response
   ↓
Browser doesn't store cookies (no withCredentials flag)
   ↓
Profile page requests getMe()
   ↓
apiClient.get (withCredentials=true, but NO COOKIES!)
   ↓
401 Unauthorized
```

### ✅ After (Fixed):
```
Register Page  
   ↓
apiClient.post (withCredentials=true) ✅
   ↓
Backend sets cookies in response
   ↓
Browser automatically stores cookies ✅
   ↓
Profile page waits 100ms
   ↓
apiClient.get (withCredentials=true) ✅
   ↓
Cookies sent automatically with request ✅
   ↓
Backend validates cookies ✅
   ↓
200 OK with user data ✅
```

---

## Why apiClient vs axios?

| Feature | axios (plain) | apiClient |
|---------|---------------|-----------|
| `withCredentials` | ❌ No | ✅ Yes |
| CORS cookies | ❌ Not sent | ✅ Sent |
| Token refresh | ❌ No | ✅ Automatic |
| Request logging | ❌ No | ✅ Yes (🔐 prefix) |
| Error handling | ❌ Basic | ✅ 401 handler |

**Rule:** Always use `apiClient` for authenticated endpoints. Only use `axios` for public endpoints (like GitHub API).

---

## Testing the Fix

### Step 1: Restart Services
```bash
# Terminal 1: Backend (if not running)
cd d:\newpro\Fitrackr\backend
npm run dev

# Terminal 2: Frontend
cd d:\newpro\Fitrackr\frontend
npm run dev
```

### Step 2: Clear Data
- Open DevTools (F12)
- Application → Cookies → Delete all
- Hard refresh (Ctrl+Shift+R)

### Step 3: Register
1. Go to `http://localhost:5173/register`
2. Fill form and click "Send OTP"
3. Enter OTP code and click "Verify & Complete"
4. Should see loading spinner then redirect to dashboard/profile

### Step 4: Monitor Console
**Should see:**
```
🔐 POST /auth/signup/send-otp: { hasAccessTokenCookie: false, withCredentials: true }
✅ OTP sent to your email!

🔐 POST /auth/signup/verify-otp: { hasAccessTokenCookie: false, withCredentials: true }
✅ Account created successfully!
[Redirects to /home/Profile]

[After 100ms delay]
🔐 GET /users/me: { hasAccessTokenCookie: true, withCredentials: true }
🔐 GET /users/me/overview: { hasAccessTokenCookie: true, withCredentials: true }
🔐 GET /users/me/weekly: { hasAccessTokenCookie: true, withCredentials: true }
[Profile data loaded successfully]
```

### Step 5: Verify Success
- ✅ Profile page loads with user data
- ✅ No 401 errors in console
- ✅ Cookies visible in DevTools → Cookies tab
- ✅ `accessToken` and `refreshToken` present

---

## What Gets Sent with Every Request

When using `apiClient.post()` or `apiClient.get()`:
```javascript
{
  "method": "GET/POST/PUT/DELETE",
  "url": "/users/me",
  "headers": {
    "Content-Type": "application/json",
    "Cookie": "accessToken=eyJ...; refreshToken=eyJ..."  // ✅ Sent automatically!
  },
  "credentials": "include"  // ✅ withCredentials: true
}
```

---

## Files Modified

| File | Changes |
|------|---------|
| [frontend/src/pages/Register.jsx](frontend/src/pages/Register.jsx) | Import `apiClient` instead of `axios`, use it for OTP endpoints |
| [frontend/src/pages/Profile.jsx](frontend/src/pages/Profile.jsx) | Add 100ms delay, isMounted flag, proper 401 handling |

---

## Key Takeaway

**Always use `apiClient` for authenticated API calls.** It has:
- ✅ Automatic cookie sending (`withCredentials: true`)
- ✅ Automatic token refresh on 401
- ✅ Request/response logging for debugging
- ✅ Error handling for authentication

The plain `axios` library is fine for:
- Public API calls (no auth needed)
- External APIs (different domain)
- One-off requests where context isn't available

---

## If Still Getting 401

1. **Check DevTools → Cookies tab:**
   - `accessToken` should be present
   - `refreshToken` should be present
   - Domain should be `localhost`
   - Path should be `/`

2. **Check console logs:**
   - Look for `🔐` prefix - shows cookie status
   - Should show `hasAccessTokenCookie: true` after registration

3. **If cookies missing:**
   - Backend console should show: `res.cookie('accessToken', ...)`
   - If not showing, backend might not be restarted
   - Restart backend: `Ctrl+C` then `npm run dev`

4. **If cookies present but still 401:**
   - Check backend logs for auth middleware errors
   - Verify JWT_SECRET is set in .env
   - Try logging in instead of registering (tests existing auth flow)

---

## Related Documentation
- [AUTH_ERRORS_FIX_GUIDE.md](AUTH_ERRORS_FIX_GUIDE.md) - Earlier authentication fixes
- [OTP_VERIFICATION_FIX.md](OTP_VERIFICATION_FIX.md) - OTP payload issues
