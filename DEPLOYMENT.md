# 🚀 Deployment Guide: Inventory Management System

This guide explains how to deploy your application to a production server with a custom domain.

## 🏢 Option 1: Shared Hosting / cPanel (UmmahHostBD)

If you bought hosting from **UmmahHostBD** or any cPanel provider, follow these steps.

### A. Prepare Your Files
1.  **Frontend**: Run `npm run build` in the `client` folder. This creates a `dist` folder.
2.  **Backend**: You need the `server` folder. (Keep `package.json`, `index.js`, `database.js`, and `models/`).

### B. Deploy Frontend
1.  Log in to cPanel.
2.  Go to **File Manager** -> `public_html`.
3.  Upload the contents of your `client/dist` folder here.
4.  Create a `.htaccess` file in `public_html` to handle React routing:
    ```apache
    <IfModule mod_rewrite.c>
      RewriteEngine On
      RewriteBase /
      RewriteRule ^index\.html$ - [L]
      RewriteCond %{REQUEST_FILENAME} !-f
      RewriteCond %{REQUEST_FILENAME} !-d
      RewriteCond %{REQUEST_FILENAME} !-l
      RewriteRule . /index.html [L]
    </IfModule>
    ```

### C. Deploy Backend (Node.js)
1.  In cPanel, search for **Setup Node.js App**.
2.  **Create Application**:
    *   **Node.js version**: Choose latest (e.g., 18 or 20).
    *   **Application mode**: `Production`.
    *   **Application root**: `backend` (or any folder name outside `public_html`).
    *   **Application URL**: `api.yourdomain.com` (create a subdomain first) or `yourdomain.com/api`.
    *   **Startup file**: `index.js`.
3.  **Upload Files**: Upload your `server` folder content to the `Application root` folder.
4.  **Run NPM Install**: Back in the Node.js App UI, click **Run NPM Install**.
5.  **Environment Variables**: Add these in the Node.js App UI:
    *   `JWT_SECRET`: A random string.
    *   `DATABASE_URL`: `mysql://user:password@localhost:3306/db_name`
    *   `PORT`: `3001` (Passenger might ignore this, but keep it).

### D. Database (MySQL)
1.  Go to cPanel -> **MySQL® Databases**.
2.  Create a Database, User, and Password.
3.  Add the User to the Database with **All Privileges**.
4.  Use the connection string format: `mysql://username:password@localhost/database_name` as your `DATABASE_URL`.

---

## ☁️ Option 2: Cloud Hosting (Vercel + Render)

This is actually easier and **FREE**.

### 1. Prepare Backend (Render.com)

Render is great for hosting Node.js APIs.

### Steps:
1.  **Push code to GitHub.**
2.  Create account on [Render.com](https://render.com).
3.  **New +** -> **Web Service**.
4.  Connect repository.
5.  **Build Command**: `cd server && npm install`
6.  **Start Command**: `node index.js`
7.  **Environment Variables**:
    *   `JWT_SECRET`: `your_secret`
    *   `DATABASE_URL`: (Use a free PostgreSQL from Render or Supabase)

---

### 2. Prepare Frontend (Vercel)

1.  Create account on [Vercel.com](https://vercel.com).
2.  **Add New** -> **Project**.
3.  **Root Directory**: `client`.
4.  **Environment Variables**:
    *   `VITE_API_URL`: Your Render URL (e.g., `https://api.render.com/api`)
5.  Click **Deploy**.

---

## 🔗 3. Connecting Your Domain (UmmahHostBD)

If you want to use your domain with **Option 2 (Cloud)**:
1.  In Vercel -> **Settings** -> **Domains**.
2.  Add `www.yourdomain.com`.
3.  Login to UmmahHostBD Client Area -> **Services** -> **Domains** -> **Manage DNS**.
4.  Add the **A Record** or **CNAME** provided by Vercel.

---

## 🛠️ Production Checklist
1.  **CORS**: In `server/index.js`, update `cors()` to allow your domain.
2.  **Frontend URL**: Ensure `client/.env` has the correct `VITE_API_URL`.
3.  **Database**: Ensure `DATABASE_URL` is set correctly in production.

---

### **Need help with cPanel setup?**
Just ask! I can help you configure the `.htaccess` or MySQL connection details.
