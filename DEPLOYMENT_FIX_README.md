# 404 Not Found Error Fix for Deployed Angular App

## 🔍 **Problem Description**

Your Angular app works perfectly on **localhost** but shows **"Not Found"** errors on **Render** (or other production deployments) when:
- Refreshing the page
- Directly accessing a URL like `/dashboard/pis`
- Using browser back/forward buttons

## 🎯 **Root Cause**

This is a **Single Page Application (SPA) routing issue**:

### On Localhost (Development):
✅ Angular CLI dev server automatically redirects all routes to `index.html`

### On Production (Render/Netlify/Vercel):
❌ The web server looks for physical files at paths like `/dashboard/pis`
❌ When it doesn't find them, it returns a **404 error**

## ✅ **Solution Applied**

We've created multiple configuration files to handle this for different platforms:

### 1. **`_redirects`** (For Render, Netlify)
```
/*    /index.html   200
```
- Redirects all routes to `index.html` with a 200 status code
- Works for Render, Netlify, and similar platforms

### 2. **`.htaccess`** (For Apache servers)
Already exists in your project - handles Apache server routing

### 3. **`netlify.toml`** (For Netlify - alternative method)
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 4. **`vercel.json`** (For Vercel deployments)
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## 🚀 **Deployment Steps**

### For Render:

1. **Build your project:**
   ```bash
   npm run build
   ```

2. **Ensure the build outputs to:**
   ```
   dist/planeteye-angular/
   ```

3. **Render Configuration:**
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist/planeteye-angular`
   - The `_redirects` file will automatically be copied to the output

4. **Deploy:**
   - Commit and push your changes
   - Render will auto-deploy

### For Netlify:

1. **Build Command**: `npm run build`
2. **Publish Directory**: `dist/planeteye-angular`
3. The `_redirects` or `netlify.toml` file will handle routing

### For Vercel:

1. **Build Command**: `npm run build`
2. **Output Directory**: `dist/planeteye-angular`
3. The `vercel.json` file will handle routing

### For Apache Servers:

1. Build your project
2. The `.htaccess` file will handle routing
3. Ensure `mod_rewrite` is enabled on the server

## 📋 **What Was Changed:**

1. ✅ Created `src/_redirects` file
2. ✅ Created `src/netlify.toml` file
3. ✅ Created `src/vercel.json` file
4. ✅ Updated `angular.json` to copy these files during build
5. ✅ Already had `.htaccess` for Apache servers

## 🧪 **Testing After Deployment:**

After deploying with these changes:

1. ✅ Navigate to your app's home page
2. ✅ Navigate to any route (e.g., `/dashboard/pis`)
3. ✅ **Refresh the page** - should work now!
4. ✅ Directly access a deep URL - should work!
5. ✅ Use browser back/forward - should work!

## 🔧 **Additional Render-Specific Configuration:**

If you're using **Render Static Site**, make sure your **Render configuration** is:

```yaml
# render.yaml (optional - Render can auto-detect)
services:
  - type: web
    name: planeteye-angular
    env: static
    buildCommand: npm run build
    staticPublishPath: dist/planeteye-angular
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
```

## ⚠️ **Important Notes:**

1. **Rebuild Required**: You must rebuild and redeploy after these changes
2. **Cache Clearing**: Clear browser cache or use incognito mode for testing
3. **Base Href**: Ensure `<base href="/">` is in your `index.html` (already present)
4. **Hash Location Strategy** (Alternative): If redirects don't work, you can use:
   ```typescript
   // In app.config.ts
   providers: [
     provideRouter(routes, withHashLocation())
   ]
   ```
   This changes URLs from `/dashboard/pis` to `/#/dashboard/pis` (not recommended, but always works)

## 📝 **Next Steps:**

1. **Commit all changes:**
   ```bash
   git add .
   git commit -m "Fix: Add SPA routing configuration for production deployment"
   git push
   ```

2. **Wait for Render to rebuild**

3. **Test all routes** after deployment

## ✅ **Verification Checklist:**

- [ ] `_redirects` file exists in `src/` folder
- [ ] `angular.json` includes `_redirects` in assets array
- [ ] Build command completes successfully
- [ ] `_redirects` file is present in `dist/planeteye-angular/` after build
- [ ] App deployed to Render
- [ ] Can refresh page without 404 error
- [ ] Can directly access deep URLs without 404 error

---

**If issues persist on Render:**

1. Check Render's build logs
2. Verify the `_redirects` file is in the output directory
3. Check Render's static site configuration
4. Contact Render support with this error message

---

Created by: Dashboard Deployment Fix
Date: October 29, 2025

