# Browser Console Errors - Diagnosis & Solutions

## Summary of Issues
You have **3 distinct errors** that need to be addressed:

---

## **Error 1: 401 Unauthorized on `/api/v1/auth/me`**

### Problem
```
Failed to load resource: the server responded with a status of 401 (Unauthorized)
```

### Root Cause
The authentication token is not being sent with requests. The `/auth/me` endpoint requires:
1. A valid JWT token in an HttpOnly cookie (`accessToken`)
2. OR a valid Bearer token in the `Authorization` header

### Solutions

**Option A: Check if Login Worked**
1. Go to the **Network tab** in DevTools (F12)
2. Clear cookies and perform a fresh login
3. Look for the **login response** - it should set cookies with `Set-Cookie: accessToken=...`
4. Verify in **Application → Cookies** that `accessToken` is stored

**Option B: Add Request Debugging**
Update [frontend/src/api/apiClient.js](frontend/src/api/apiClient.js) to log token status:

```javascript
// Add this request interceptor before response interceptor
apiClient.interceptors.request.use(
    (config) => {
        const token = document.cookie.split('; ').find(row => row.startsWith('accessToken='));
        if (token) {
            console.log('✅ Auth token found in cookies');
        } else {
            console.warn('⚠️ No auth token in cookies - you may not be logged in');
        }
        return config;
    },
    (error) => Promise.reject(error)
);
```

**Option C: Verify Backend Auth Setup**
1. Ensure `NODE_ENV=development` in [backend/.env](backend/.env#L12)
2. CORS is properly configured to allow credentials:
   - ✅ [backend/src/server.js](backend/src/server.js#L124) has `credentials: true`
   - ✅ Allows `localhost:5173` origin

**Step-by-Step Fix:**
1. Restart backend: `npm run dev` in `/backend`
2. Restart frontend: `npm run dev` in `/frontend`
3. **Clear browser cookies**: DevTools → Application → Cookies → Delete all
4. Reload the page
5. Go through login flow completely
6. Check DevTools → Network for the login response with `Set-Cookie` header

---

## **Error 2: CORS Policy Blocking `/api/v1/auth/signup/send-otp`**

### Problem
```
Access to XMLHttpRequest at 'http://localhost:8080/api/v1/auth/signup/send-otp' 
from origin 'http://localhost:5173' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

### Root Cause
CORS configuration may not be working. Common causes:
1. Backend not running or crashed
2. CORS middleware not initialized before routes
3. Request is hitting a 404 (no endpoint exists)

### Solutions

**Check 1: Backend is Running**
```powershell
# Open PowerShell in d:\newpro\Fitrackr\backend
npm run dev
# Should see: "✅ Server running on port 8080"
```

**Check 2: CORS Middleware Order**
[backend/src/server.js](backend/src/server.js#L73-L130):
- ✅ `cors()` is applied BEFORE routes
- ✅ `express.json()` is applied BEFORE logging
- ✅ Credentials enabled

**Check 3: Endpoint Exists**
```bash
# Test in a new PowerShell terminal:
curl -X POST http://localhost:8080/api/v1/auth/signup/send-otp `
  -H "Content-Type: application/json" `
  -H "Origin: http://localhost:5173" `
  -d '{"email":"test@test.com"}'

# Should NOT return CORS error (may return 400 with validation error instead)
```

**Fix: If Backend is Not Running**
```powershell
cd d:\newpro\Fitrackr\backend
npm install  # Install dependencies if not done
npm run dev  # Start server
```

**Fix: If Endpoint Not Found**
Check [backend/src/routes/authRoutes.js](backend/src/routes/authRoutes.js) for the `/send-otp` endpoint.

---

## **Error 3: JSX Boolean Attribute ✅ FIXED**

### Problem
```
Received `true` for a non-boolean attribute `jsx`.
If you want to write it to the DOM, pass a string instead: jsx="true" or jsx={value.toString()}.
```

### Root Cause
In [frontend/eslint.config.js](frontend/eslint.config.js#L15), the ESLint configuration had:
```javascript
ecmaFeatures: { jsx: true }  // ❌ Wrong - boolean value
```

### Solution
✅ **Already Fixed!** Changed to:
```javascript
ecmaFeatures: { jsx: 'true' }  // ✅ Correct - string value
```

This tells ESLint to parse JSX syntax correctly.

---

## **Quick Troubleshooting Checklist**

### For 401 Error:
- [ ] Backend is running (`npm run dev` in `/backend`)
- [ ] Frontend is running (`npm run dev` in `/frontend`)
- [ ] Browser cookies cleared and fresh login performed
- [ ] Check DevTools → Network → login response has `Set-Cookie` header
- [ ] Check DevTools → Application → Cookies shows `accessToken`
- [ ] `withCredentials: true` in apiClient ✅ (already set)
- [ ] `NODE_ENV=development` in backend .env ✅ (already set)

### For CORS Error:
- [ ] Backend server is running and NOT crashed
- [ ] Backend shows "Server running on port 8080" in terminal
- [ ] Endpoint path is correct: `/api/v1/auth/signup/send-otp`
- [ ] Try curl request to verify endpoint responds
- [ ] Check backend console for any errors

### For JSX Error:
- [ ] ✅ Fixed in `eslint.config.js`
- [ ] Hard refresh browser (Ctrl+Shift+R)
- [ ] Clear `frontend/.eslintcache` if it exists

---

## **Testing the Fix**

1. **Restart Services:**
   ```powershell
   # Terminal 1: Backend
   cd d:\newpro\Fitrackr\backend
   npm run dev
   
   # Terminal 2: Frontend  
   cd d:\newpro\Fitrackr\frontend
   npm run dev
   ```

2. **Clear Everything:**
   - Browser DevTools → Application → Clear all
   - Close and reopen browser tab

3. **Test Login Flow:**
   - Visit `http://localhost:5173/login`
   - Monitor Network tab in DevTools
   - Check for `Set-Cookie` response headers
   - Watch console for the warning about token check

4. **Verify No Errors:**
   - 401 should be gone after successful login
   - CORS error should be gone if backend is running
   - JSX error should be gone after refresh

---

## **Advanced Debug: Enable Verbose Logging**

Add this to [frontend/src/api/apiClient.js](frontend/src/api/apiClient.js):

```javascript
// Request interceptor - LOG ALL REQUESTS
apiClient.interceptors.request.use(
    (config) => {
        console.log('📤 Request:', {
            method: config.method,
            url: config.url,
            headers: config.headers,
            hasCredentials: config.withCredentials
        });
        return config;
    }
);

// Response interceptor - LOG ALL RESPONSES
apiClient.interceptors.response.use(
    (response) => {
        console.log('📥 Response:', {
            status: response.status,
            url: response.config.url,
            headers: response.headers
        });
        return response;
    }
);
```

This will show you exactly what's being sent and received.
