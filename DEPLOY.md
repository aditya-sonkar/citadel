# Citadel Deployment Guide

This guide walks you through deploying the **Citadel Backend** to **Render** and the **Citadel Frontend** to **Vercel**.

---

## Backend Deployment (Render)

You can deploy the backend to Render in two ways: using our pre-configured **Docker** setup (Recommended) or as a native **Node.js Web Service**.

### Option A: Docker Deployment (Recommended)
Since we have configured a robust, optimized Dockerfile that automatically handles TypeScript compilation and database migrations, this is the most reliable method.

1. Sign in to your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** and select **Web Service**.
3. Connect your Git repository.
4. Configure the service settings:
   - **Name:** `citadel-backend`
   - **Environment:** `Docker`
   - **Docker Command:** *(Leave blank to use the default CMD in the Dockerfile)*
   - **Root Directory:** `backend`
5. Click **Advanced** and add the [Environment Variables](#environment-variables-to-set) below.
6. Click **Create Web Service**.

---

### Option B: Native Node.js Deployment
If you prefer not to use Docker, you can run it directly as a Node.js web service.

1. Click **New +** and select **Web Service** on Render.
2. Connect your Git repository.
3. Configure the service settings:
   - **Name:** `citadel-backend`
   - **Environment:** `Node`
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npx prisma migrate deploy && npm start`
4. Click **Advanced** and add the [Environment Variables](#environment-variables-to-set) below.
5. Click **Create Web Service**.

---

### Environment Variables to Set on Render

Add the following environment variables in the Render Dashboard under the **Environment** tab:

| Variable Name | Description | Example / Action |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | Enter your Neon, Supabase, or Render PostgreSQL URL |
| `NODE_ENV` | Environment mode | `production` |
| `JWT_ACCESS_SECRET` | Secret key for access tokens | *Generate a secure, random string (min 8 chars)* |
| `JWT_REFRESH_SECRET` | Secret key for refresh tokens | *Generate a secure, random string (min 8 chars)* |
| `CORS_ORIGIN` | Allowed origin for frontend requests | *Set this to your Vercel URL once the frontend is deployed* |

---

## Frontend Deployment (Vercel)

Since the frontend is a React + Vite Single Page Application, it is best suited for Vercel.

1. Sign in to your [Vercel Dashboard](https://vercel.com).
2. Click **Add New** and select **Project**.
3. Import your Git repository.
4. Configure the project settings:
   - **Framework Preset:** `Vite` (automatically detected)
   - **Root Directory:** `frontend`
5. Expand the **Environment Variables** section and add the following variable:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://your-citadel-backend.onrender.com/api` *(replace with your actual Render service URL)*
   
   > [!IMPORTANT]
   > Vite embeds environment variables at **build time**. You must set this variable in Vercel **before** the build completes. If you update the URL later, you must trigger a redeployment in Vercel to apply the change.
6. Click **Deploy**.
