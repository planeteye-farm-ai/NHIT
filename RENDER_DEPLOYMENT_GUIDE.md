# 🚀 Render Deployment Guide for PlanetEye Angular

## ✅ **Your Project is Now Configured for Render!**

All necessary configuration files have been created to fix the "Not Found" error on Render.

---

## 📦 **Files Created:**

1. ✅ `_redirects` - Main routing fix for Render static sites
2. ✅ `render.yaml` - Complete Render service configuration
3. ✅ `.htaccess` - Already exists (for Apache fallback)
4. ✅ `angular.json` - Updated to copy all config files during build

---

## 🔧 **Render Configuration**

### **Option 1: Using `render.yaml` (Recommended - Automatic)**

Your `render.yaml` is already configured with:

- **Service Type**: Static Web Service
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist/planeteye-angular`
- **Route Rewrites**: All routes redirect to `index.html`
- **Security Headers**: Added for better security

**No manual configuration needed in Render dashboard!** Render will auto-detect `render.yaml`.

### **Option 2: Manual Configuration in Render Dashboard**

If you prefer manual setup or need to update existing deployment:

1. **Go to your Render Dashboard**
2. **Select your service** or create a new Static Site
3. **Configure as follows:**

   ```
   Name: planeteye-angular (or your preferred name)

   Build Command: npm install && npm run build

   Publish Directory: dist/planeteye-angular

   Auto-Deploy: Yes (recommended)
   ```

4. **Advanced Settings (if available):**
   - Add rewrite rule: `/* -> /index.html`

---

## 🏗️ **Deployment Steps**

### **Step 1: Build Locally (Optional - for testing)**

```bash
cd "C:\Users\Ram.Thakur\Infra.AI\planeteye-angular updated(1)\planeteye-angular updated"
npm run build
```

**Verify** that `_redirects` file is copied to `dist/planeteye-angular/_redirects`

### **Step 2: Commit Your Changes**

```bash
git add .
git commit -m "Fix: Add Render deployment configuration and SPA routing"
git push origin main
```

### **Step 3: Deploy to Render**

**If using existing Render deployment:**

- Render will automatically detect the push and start building
- Wait for the build to complete

**If creating new Render deployment:**

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Static Site"**
3. Connect your Git repository
4. Render will auto-detect `render.yaml`
5. Click **"Create Static Site"**

### **Step 4: Wait for Build**

Monitor the build logs in Render. You should see:

```
Installing dependencies...
Building Angular app...
Build completed successfully!
```

### **Step 5: Test Your Deployment**

After deployment completes:

1. ✅ Visit your Render URL
2. ✅ Navigate to `/dashboard/pis`
3. ✅ **Refresh the page** (Ctrl+F5 or Cmd+Shift+R)
4. ✅ Should NOT get 404 error anymore!

---

## 🐛 **Troubleshooting**

### **Issue 1: Still getting 404 errors**

**Check 1: Verify `_redirects` in build output**

```bash
# After building locally
ls dist/planeteye-angular/_redirects
# Should show the file
```

**Check 2: Check Render Build Logs**

- Look for "\_redirects file detected" or similar message
- Ensure publish directory is correct: `dist/planeteye-angular`

**Check 3: Verify Render Service Type**

- Must be **"Static Site"** not "Web Service"

### **Issue 2: Build fails on Render**

**Possible causes:**

1. **Node version mismatch**

   - Add to `render.yaml`:

   ```yaml
   envVars:
     - key: NODE_VERSION
       value: 18.17.0
   ```

2. **Memory issues**

   - Angular builds can be memory-intensive
   - Render free tier has memory limits
   - Consider upgrading Render plan if needed

3. **Missing dependencies**
   - Ensure `package.json` and `package-lock.json` are committed

### **Issue 3: Blank page after deployment**

**Check:**

1. Base href in `index.html` should be `/`

   ```html
   <base href="/" />
   ```

2. Check browser console for errors
3. Verify all assets are loading (check Network tab)

### **Issue 4: API calls failing**

Your dashboards connect to:

```
https://fantastic-reportapi-production.up.railway.app
```

**Ensure:**

1. API is accessible from Render's servers
2. CORS is configured on the API to allow your Render domain
3. Check if API requires authentication

---

## 🎯 **Expected Render Build Configuration**

When Render detects `render.yaml`, it will use:

```yaml
Build Command: npm install && npm run build
Publish Directory: dist/planeteye-angular
Node Version: (auto-detected from package.json or you can specify)
```

---

## 📱 **All Dashboard Routes That Should Work:**

After this fix, all these routes should work on refresh:

1. ✅ `/dashboard/pis` - Project Information System
2. ✅ `/tis/tis-dashboard` - Traffic Information System
3. ✅ `/ais/ais-dashboard` - Accident Information System
4. ✅ `/pms/pms-dashboard` - Pavement Management System
5. ✅ `/rwfis` or `/rwfis/rwfis-dashboard` - Road Weather & Flooding Info System

---

## 🔐 **Security Headers Added**

The `render.yaml` includes security headers:

- `X-Frame-Options: SAMEORIGIN` (prevents clickjacking)
- `X-Content-Type-Options: nosniff` (prevents MIME sniffing)
- `Referrer-Policy: no-referrer-when-downgrade` (privacy)

---

## 📞 **Need Help?**

If you still encounter issues after following these steps:

1. **Check Render Logs**:

   - Go to your Render dashboard
   - Click on your service
   - Check "Logs" and "Events" tabs

2. **Verify Build Output**:

   - Check that `_redirects` is in the published directory
   - Render shows published files in the logs

3. **Contact Render Support**:
   - Provide them with this information:
     - Service type: Static Site
     - Issue: Angular SPA routing (404 on refresh)
     - Configuration: Using `_redirects` file

---

## ✨ **Quick Reference**

| Platform | Config File                  | Status            |
| -------- | ---------------------------- | ----------------- |
| Render   | `_redirects`, `render.yaml`  | ✅ Created        |
| Netlify  | `_redirects`, `netlify.toml` | ✅ Created        |
| Vercel   | `vercel.json`                | ✅ Created        |
| Apache   | `.htaccess`                  | ✅ Already exists |

---

**All configuration files are ready! Just commit, push, and deploy!** 🚀
