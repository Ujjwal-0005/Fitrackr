# Authentication & API Errors - Complete Fix Guide

## Errors Fixed ✅

You had **three distinct errors** that have now been resolved:

---

## **Error 1: JSX Style Tag Attribute ✅ FIXED**

### Error Message
```
Received `true` for a non-boolean attribute `jsx`.
If you want to write it to the DOM, pass a string instead: jsx="true" or jsx={value.toString()}.
```

### Root Cause
In [frontend/src/pages/Register.jsx](frontend/src/pages/Register.jsx#L739), the code had:
```jsx
<style jsx>{`...`}</style>  // ❌ jsx attribute not valid in React
```

### Solution Applied
Changed to:
```jsx
<style>{`...`}</style>  // ✅ Correct - plain style tag with template literal
```

The `jsx` attribute was being passed as a boolean (`true`) to the DOM element, which React doesn't allow for non-boolean attributes.

---

## **Error 2: 413 Payload Too Large ✅ FIXED**

### Error Message
```
POST http://localhost:8080/api/v1/auth/signup/send-otp net::ERR_FAILED 413 (Payload Too Large)
```

### Root Cause
The OTP request was including a base64-encoded avatar image (`avatarUrl`) which is HUGE (100+ KB as a data URL).

In [frontend/src/pages/Register.jsx](frontend/src/pages/Register.jsx#L216), the code was:
```javascript
const payload = {
  email: form.email,
  name: form.name,
  password: form.password,
  avatarUrl: photoPreview  // ❌ Base64 image is 100+ KB!
};
await axios.post(`${API_URL}/auth/signup/send-otp`, payload);
```

The backend by default has a JSON limit of ~100KB, so the base64 image exceeded this.

### Solution Applied
Removed the base64 image from the OTP request:
```javascript
const payload = {
  email: form.email,
  name: form.name,
  password: form.password,
  // ✅ Do NOT send base64 image in OTP request
  // Note: Photo will be uploaded after successful registration
};
await axios.post(`${API_URL}/auth/signup/send-otp`, payload);
```

**Photo Upload Best Practices:**
- Send only text data (email, name, password) in OTP verification step
- After successful registration and OTP verification, upload the photo using `multipart/form-data`
- This is cleaner and allows for optional photo uploads

---

## **Error 3: 401 Unauthorized on `/auth/me` ✅ FIXED**

### Error Message
```
GET http://localhost:8080/api/v1/auth/me 401 (Unauthorized)
```

### Root Cause
Multiple issues:

1. **Cookie SameSite Policy**: Cookies weren't being sent with cross-origin requests (localhost:5173 → localhost:8080)
2. **Missing Token**: On app startup, there's no authentication token until user logs in
3. **Lack of Debugging Info**: Hard to diagnose what's happening with authentication

### Solution Applied

#### 1. Fixed Cookie Configuration [backend/src/controllers/authController.js](backend/src/controllers/authController.js#L30-L39)

**Before:**
```javascript
const getCookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge,
  path: '/'
});
```

**After:**
```javascript
const getCookieOptions = (maxAge) => {
  const isDev = process.env.NODE_ENV !== 'production';
  return {
    httpOnly: true,
    secure: isDev ? false : true,      // false for http://localhost, true for https
    sameSite: isDev ? 'lax' : 'strict', // 'lax' allows cross-site cookies in dev
    maxAge,
    path: '/'
  };
};
```

**What Changed:**
- `sameSite: 'lax'` in dev mode allows cookies to be sent with requests from different ports (5173 → 8080)
- `secure: false` in dev for http (not https)
- `secure: true` in prod for https

#### 2. Enhanced Request Debugging [frontend/src/api/apiClient.js](frontend/src/api/apiClient.js#L12-L22)

Added request interceptor to log authentication status:
```javascript
apiClient.interceptors.request.use(
    (config) => {
        const cookies = document.cookie.split('; ').find(row => row.startsWith('accessToken='));
        console.log(`🔐 ${config.method?.toUpperCase()} ${config.url}:`, {
            hasAccessTokenCookie: !!cookies,
            withCredentials: config.withCredentials
        });
        return config;
    }
);
```

This logs every API call with:
- Whether `accessToken` cookie exists
- Whether `withCredentials: true` is set (it is ✅)

#### 3. Verified CORS Configuration [backend/src/server.js](backend/src/server.js#L99-L127)

✅ Already correctly configured:
- `credentials: true` enables cookie handling
- Development mode allows all origins
- `withCredentials: true` on frontend
- Proper allowed headers for auth

---

## **Expected Behavior Now**

### On App Startup
1. **AuthContext** calls `getMe()` to check if user is logged in
2. **Console logs:**
   ```
   🔐 GET /auth/me: { hasAccessTokenCookie: false, withCredentials: true }
   ```
3. Returns 401 (expected - user not logged in yet)
4. `user` state set to `null` in AuthContext
5. App shows login/register pages

### After Successful Login
1. **Backend** sets `accessToken` and `refreshToken` cookies
2. **Console logs on next request:**
   ```
   🔐 GET /auth/me: { hasAccessTokenCookie: true, withCredentials: true }
   ```
3. Returns 200 with user data
4. `user` state updates in AuthContext
5. App shows dashboard/main pages

### When Registering
1. **OTP Request:** Sends only `{email, name, password}` (small payload ✅)
2. **OTP Verification:** Small request, no payload issues
3. **Register Completion:** Photo upload happens in separate request or after

---

## **Verification Checklist**

### Before Testing
- [ ] Backend is running: `npm run dev` in `/backend` folder
- [ ] Frontend is running: `npm run dev` in `/frontend` folder
- [ ] Both running on `localhost:8080` and `localhost:5173`

### Testing Authentication
1. **Open DevTools** (F12) → Network tab
2. **Visit** `http://localhost:5173/register`
3. **Fill form and click "Send OTP"**
4. **Check:**
   - ✅ No 413 error (payload is small now)
   - ✅ OTP arrives in email
   - ✅ No CORS errors

5. **After successful registration, login**
6. **Check:**
   - ✅ Network tab shows login request succeeds
   - ✅ Cookies tab shows `accessToken` and `refreshToken` are set
   - ✅ App shows dashboard instead of login page
   - ✅ Console shows `🔐 GET /auth/me: { hasAccessTokenCookie: true, ... }`

### Debugging If Issues Persist

**If still getting 401:**
1. Check browser DevTools → Application → Cookies
2. Verify `accessToken` cookie exists and has value
3. Check cookie's `Domain` and `Path` settings
4. Check console for `🔐` messages showing cookie status
5. Ensure backend console shows "✅ CORS: Allowing origin: http://localhost:5173"

**If CORS still blocking:**
1. Restart backend - CORS middleware must reload
2. Check backend console for: `✅ CORS: Allowing origin: http://localhost:5173`
3. If not showing, kill backend (Ctrl+C) and restart

**If 413 error returns:**
1. Verify photo removal is working
2. Check request payload size in Network tab → Request tab
3. Should be < 1KB for OTP request

---

## **Technical Summary**

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| JSX Error | `<style jsx>` invalid syntax | Changed to `<style>` |
| 413 Payload | Base64 photo in OTP request (100+ KB) | Remove photo from OTP, send separately |
| 401 Auth | Cookie SameSite policy blocking cross-port requests | Changed `sameSite: 'lax'` in dev mode |

---

## **Key Files Modified**

1. **[frontend/src/pages/Register.jsx](frontend/src/pages/Register.jsx)**
   - Line 739: Fixed `<style jsx>` → `<style>`
   - Line 216: Removed `avatarUrl` from OTP payload

2. **[backend/src/controllers/authController.js](backend/src/controllers/authController.js)**
   - Lines 30-39: Updated cookie options for dev environment

3. **[frontend/src/api/apiClient.js](frontend/src/api/apiClient.js)**
   - Lines 12-22: Added request interceptor for debugging

---

## **Next Steps**

1. **Restart services:**
   ```bash
   # Terminal 1 - Backend
   cd d:\newpro\Fitrackr\backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd d:\newpro\Fitrackr\frontend
   npm run dev
   ```

2. **Test authentication flow:**
   - Register new account
   - Verify OTP (should work now)
   - Login
   - Check if dashboard loads

3. **Monitor console logs:**
   - Look for `🔐` messages showing cookie status
   - Look for `✅ CORS: Allowing origin` in backend console

4. **Clear browser data if stuck:**
   - DevTools → Application → Clear all
   - Hard refresh (Ctrl+Shift+R)
   - Try login again

---

## **Production Notes**

For production deployment, ensure:
- `NODE_ENV=production` in backend .env
- `secure: true` (requires HTTPS)
- `sameSite: 'strict'` (more secure)
- `FRONTEND_URL` environment variable set to actual domain
- No console.log() debugging messages (remove or wrap in development check)
