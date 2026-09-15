# NovaMobile — Free-Tier Cloud Deployment Guide

This guide walks you through deploying the **NovaMobile** platform (Storefront, Admin Panel, and API) to free-tier cloud hosting for client demonstrations, using:
- **Frontend (Storefront & Admin)**: [Vercel](https://vercel.com) (Next.js 14)
- **Backend API**: [Render.com](https://render.com) (NestJS + Prisma)
- **Database**: [Neon.tech](https://neon.tech) (Serverless PostgreSQL)
- **File / Image Uploads**: [Cloudflare R2](https://dash.cloudflare.com) (S3-Compatible Object Storage)

---

## 📋 Pre-Requisites Checklist

Before beginning, ensure you have the following accounts created:
1. **GitHub account** with access to [https://github.com/rashedislamrion/Mobile-shop-website-for-Client.git](https://github.com/rashedislamrion/Mobile-shop-website-for-Client.git)
2. **Neon.tech account** (Sign up free with GitHub)
3. **Cloudflare account** (Sign up free)
4. **Render.com account** (Sign up free with GitHub)
5. **Vercel account** (Sign up free with GitHub)

---

## Phase 1: Provision the Managed Database (Neon.tech)

1. Log into **[Neon.tech](https://console.neon.tech/)**.
2. Click **"New Project"**.
   - Project Name: `novamobile-prod`
   - Postgres Version: `16` (default)
   - Region: Choose the closest region to your users (e.g., `Singapore (ap-southeast-1)` or `Frankfurt`).
3. Once created, navigate to **Dashboard** $\rightarrow$ **Connection Details**.
4. Select **"Pooled connection"** and copy the connection string. It looks like:
   ```text
   postgresql://<user>:<password>@ep-sample-pooler.<region>.neon.tech/neondb?sslmode=require
   ```
   Save this as your `DATABASE_URL`.
5. Select **"Direct connection"** (uncheck pooled) and copy that connection string as well:
   ```text
   postgresql://<user>:<password>@ep-sample.<region>.neon.tech/neondb?sslmode=require
   ```
   Save this as your `DIRECT_URL` (used for running database migrations).

---

## Phase 2: Set Up Object Storage (Cloudflare R2)

1. Log into **[Cloudflare Dashboard](https://dash.cloudflare.com/)**.
2. On the left sidebar, click **R2**.
3. Click **"Create bucket"**:
   - Bucket Name: `novamobile-media`
   - Location: `Automatic` (or closest region)
   - Click **"Create Bucket"**.
4. **Enable Public Access**:
   - In your bucket settings, go to the **Settings** tab.
   - Under **Public Access**, enable the **R2.dev Subdomain** (or attach a custom domain like `cdn.yourdomain.com`).
   - Copy the public URL (e.g. `https://pub-xxxxxxxxxxxxxxxxxxxxxxxx.r2.dev`). Save this as `R2_PUBLIC_URL`.
5. **Generate API Token**:
   - Go back to the main **R2** overview page.
   - Click **"Manage R2 API Tokens"** on the right side.
   - Click **"Create API Token"**.
   - Permissions: **Object Read & Write**.
   - Bucket Scope: Select `novamobile-media` (or all buckets).
   - Click **"Create API Token"**.
   - Copy:
     - **Account ID** (visible on the R2 overview page) $\rightarrow$ `R2_ACCOUNT_ID`
     - **Access Key ID** $\rightarrow$ `R2_ACCESS_KEY_ID`
     - **Secret Access Key** $\rightarrow$ `R2_SECRET_ACCESS_KEY`
     - Bucket name $\rightarrow$ `R2_BUCKET_NAME` (`novamobile-media`)

---

## Phase 3: Deploy the Backend API (Render.com)

1. Log into **[Render.com Dashboard](https://dashboard.render.com/)**.
2. Click **"New +"** $\rightarrow$ **"Web Service"**.
3. Connect your GitHub account and select the repository: `rashedislamrion/Mobile-shop-website-for-Client`.
4. Configure the Web Service settings:
   - **Name**: `novamobile-api`
   - **Region**: Same region as your Neon database (e.g. `Singapore`).
   - **Branch**: `main`
   - **Root Directory**: `api`  ⚠️ *(Crucial: do not leave this empty)*
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm install && npx prisma generate && npm run build
     ```
   - **Start Command**:
     ```bash
     npm run start:prod
     ```
   - **Instance Type**: `Free`
5. Click **"Advanced"** and configure:
   - **Health Check Path**: `/api/v1/health`
   - **Auto-Deploy**: `Yes`
6. Add **Environment Variables** in Render:

| Key | Value | Purpose |
|---|---|---|
| `NODE_ENV` | `production` | Enables production cookie and security settings |
| `PORT` | `10000` | Port Render routes web traffic to |
| `DATABASE_URL` | `[Your Neon Pooled Connection String]` | PostgreSQL database connection |
| `DIRECT_URL` | `[Your Neon Direct Connection String]` | For database migrations |
| `JWT_ACCESS_SECRET` | `[Click "Generate" or paste a 64-char secret]` | Access token encryption |
| `JWT_ACCESS_EXPIRY` | `15m` | Access token duration |
| `JWT_REFRESH_SECRET` | `[Click "Generate" or paste a 64-char secret]` | Refresh token encryption |
| `JWT_REFRESH_EXPIRY` | `7d` | Refresh token duration |
| `ALLOWED_ORIGINS` | `https://*.vercel.app,http://localhost:3000` | CORS permissions for frontend |
| `FRONTEND_URL` | `https://novamobile.vercel.app` (update after Phase 4) | Gateway redirect target |
| `API_URL` | `https://novamobile-api.onrender.com/api/v1` | Self URL for webhooks |
| `R2_ACCOUNT_ID` | `[Your Cloudflare Account ID]` | Cloudflare R2 Account ID |
| `R2_ACCESS_KEY_ID` | `[Your R2 Access Key ID]` | R2 Access Key ID |
| `R2_SECRET_ACCESS_KEY` | `[Your R2 Secret Access Key]` | R2 Secret Access Key |
| `R2_BUCKET_NAME` | `novamobile-media` | R2 bucket name |
| `R2_PUBLIC_URL` | `https://pub-xxxx.r2.dev` | Public URL for uploaded files |
| `UPLOAD_ROOT` | `/tmp/uploads` | Ephemeral disk fallback directory |

7. Click **"Create Web Service"**.
8. **Run Database Migrations & Initial Seed**:
   - Once Render finishes the initial deployment, go to the **Shell** tab in Render:
     ```bash
     npx prisma migrate deploy
     npm run seed:prod
     ```
   - This applies all database tables and seeds the demo accounts, catalog, phones, and settings.
9. **How to know Phase 3 worked**:
   - Open your Render service URL in a browser:
     ```text
     https://<your-service-name>.onrender.com/api/v1/health
     ```
   - You should see:
     ```json
     {"status":"ok","uptime":...,"timestamp":"...","service":"novamobile-api","environment":"production"}
     ```

---

## Phase 4: Deploy the Frontend (Vercel)

1. Log into **[Vercel Dashboard](https://vercel.com/dashboard)**.
2. Click **"Add New..."** $\rightarrow$ **"Project"**.
3. Select your GitHub repository: `rashedislamrion/Mobile-shop-website-for-Client`.
4. Configure Project settings:
   - **Framework Preset**: `Next.js` (automatically detected)
   - **Root Directory**: `./` (leave default root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`
5. Expand **Environment Variables** and add:

| Key | Value | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://<your-service-name>.onrender.com/api/v1` | Points frontend to the live Render API |
| `NEXT_PUBLIC_BACKEND_URL` | `https://<your-service-name>.onrender.com` | Backend base origin for static assets |

6. Click **"Deploy"**.
7. Vercel will build and deploy the Next.js app in ~2 minutes.
8. **How to know Phase 4 worked**:
   - Visit the assigned Vercel URL (e.g. `https://novamobile-xxxx.vercel.app`).
   - The homepage should load with real products, banners, and phones.
   - Go to `/admin/login` and log in with:
     - **Email**: `demo.admin@novamobile.test`
     - **Password**: `Admin@12345`

---

## Phase 5: Final Cross-Linking & CORS Verification

1. Note your live **Vercel production URL** (e.g. `https://novamobile-for-client.vercel.app`).
2. Go back to your **Render.com Web Service** $\rightarrow$ **Environment**:
   - Update `ALLOWED_ORIGINS` to include your exact Vercel URL:
     ```text
     https://novamobile-for-client.vercel.app,https://*.vercel.app,http://localhost:3000
     ```
   - Update `FRONTEND_URL`:
     ```text
     https://novamobile-for-client.vercel.app
     ```
3. Click **"Save Changes"** on Render (triggers an automatic rolling redeploy).

---

## 🔑 Demo Login Credentials (for Client Demonstration)

| Role | Email | Password | Access & Scope |
|---|---|---|---|
| **Global Admin** | `demo.admin@novamobile.test` | `Admin@12345` | Full access across all 26 admin modules |
| **Branch Admin** | `demo.branchadmin@novamobile.test` | `Admin@12345` | Dhaka Main branch inventory and POS; settings blocked |
| **Technician** | `demo.technician@novamobile.test` | `Admin@12345` | Dedicated Technician Workspace; 25% profit share |
| **Inventory Auditor** | `demo.auditor@novamobile.test` | `Admin@12345` | Read-only access to products, stock, and purchases |
| **Storefront Customer** | `demo.customer@novamobile.test` | `Admin@12345` | Customer profile with pre-seeded order history |

---

## ℹ️ Important Free-Tier Characteristics to Explain to Clients

1. **Render Cold Starts**:
   - Free web services sleep after 15 minutes of inactivity.
   - **First request after idle takes 30 to 60 seconds** to wake up the server.
   - Subsequent clicks will respond in **under 100 milliseconds**.
   - Explain to the client: *"This latency is purely due to the free-tier demonstration host and is completely eliminated once moved to a dedicated server."*
2. **Neon Database Auto-Suspend**:
   - Inactive Neon compute endpoints pause after 5 minutes; wake-up takes ~500ms.
3. **Cloudflare R2 Storage**:
   - Free tier includes 10 GB of storage and 10 million reads per month with zero bandwidth/egress fees.
