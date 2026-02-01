# 🚀 Deployment Guide: Inventory Management System

This guide explains how to deploy your application to a production server with a custom domain.

## 🏗️ Architecture Overview
*   **Frontend**: React (Vite) -> Deployed on **Vercel** or **Netlify**.
*   **Backend**: Node.js (Express) -> Deployed on **Render** or **Railway**.
*   **Database**: SQLite (Development) -> Recommend **PostgreSQL** for Production.

---

## 1. Prepare Backend for Deployment (Render.com)

Render is great for hosting Node.js APIs.

### Steps:
1.  **Push your code to GitHub.**
2.  Create an account on [Render.com](https://render.com).
3.  Click **New +** -> **Web Service**.
4.  Connect your GitHub repository.
5.  **Settings**:
    *   **Runtime**: `Node`
    *   **Build Command**: `npm install` (run in the `server` directory)
    *   **Start Command**: `node index.js`
6.  **Environment Variables**:
    *   `JWT_SECRET`: A long random string (e.g., `your_very_secret_key_123`)
    *   `DATABASE_URL`: Your PostgreSQL connection string (from Supabase or Render)
    *   `PORT`: `3001`
    *   `NODE_ENV`: `production`

> **✅ Production Ready (PostgreSQL):** 
> The system is now configured to automatically use PostgreSQL when `DATABASE_URL` is provided. This ensures your data (users, stock, products) stays alive forever on the server. I recommend using **Supabase** (free tier) for your database.


---

## 2. Prepare Frontend for Deployment (Vercel)

Vercel is the easiest place to host Vite/React apps.

### Steps:
1.  Create an account on [Vercel.com](https://vercel.com).
2.  Click **Add New** -> **Project**.
3.  Connect your GitHub repository.
4.  **Framework Preset**: Select `Vite`.
5.  **Root Directory**: Set this to your `client` folder.
6.  **Environment Variables**:
    *   `VITE_API_URL`: The URL of your deployed Render backend (e.g., `https://your-api.onrender.com/api`)
7.  Click **Deploy**.

---

## 3. Connecting Your Custom Domain

Once your apps are live, you'll have URLs like `inventory-ui.vercel.app` and `inventory-api.onrender.com`.

### For the Frontend (Main Website):
1.  In Vercel Dashboard, go to **Settings** -> **Domains**.
2.  Enter your domain (e.g., `www.yourstore.com`).
3.  Vercel will give you **A Records** or **CNAME** values.
4.  Log in to your domain provider (GoDaddy, Namecheap, etc.).
5.  Go to **DNS Settings** and add the records provided by Vercel.

### For the Backend (API Subdomain):
*   Wait for the frontend to work. Usually, you don't need a custom domain for the API, but if you want one (e.g., `api.yourstore.com`), you can set it up in Render's **Settings** -> **Custom Domains**.

---

## 4. Production Checklist

1.  **HTTPS**: Both Vercel and Render provide free SSL (HTTPS) automatically.
2.  **CORS**: In `server/index.js`, ensure `app.use(cors())` is configured to allow your Vercel URL.
3.  **Environment Sync**: Make sure `VITE_API_URL` on Vercel points to the **exact** URL of your Render backend.

---

### **Need more help?**
If you have any issues during DNS configuration or connecting your database, just let me know!

