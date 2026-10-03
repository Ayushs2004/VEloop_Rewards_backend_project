# VELoop Rewards — Complete Production Deployment Guide

This guide provides step-by-step instructions to deploy the complete **VELoop Rewards Wallet & Withdrawal System** (Backend + Frontend + MongoDB) to cloud platforms with zero cost.

---

## Deployment Strategies at a Glance

| Strategy | Frontend | Backend | Database | Best For | Estimated Setup Time |
|---|---|---|---|---|---|
| **Strategy 1 (Recommended)** | **Vercel** (Free) | **Render** / **Railway** (Free) | **MongoDB Atlas** (Free M0) | Fastest global CDN, instant deployments, zero cost | **8–10 minutes** |
| **Strategy 2** | **Render Static** | **Render Web Service** | **MongoDB Atlas** | Single-dashboard management via `render.yaml` | **10 minutes** |
| **Strategy 3** | **Docker** | **Docker** | **Docker (Mongo)** | VPS (AWS EC2, DigitalOcean, Hetzner, Linode) | **5 minutes** |

---

## Step 1: Set Up Free Cloud MongoDB (MongoDB Atlas)

Both Render and Vercel need a persistent cloud MongoDB instance. MongoDB Atlas provides a perpetual free-tier M0 cluster:

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign in (or register with Google/GitHub).
2. Click **"Create a Deployment"** and select the **M0 Free** shared cluster (choose AWS or Google Cloud, nearest region).
3. **Database Access (User):**
   - Under **Security > Database Access**, click **"Add New Database User"**.
   - Authentication Method: **Password**.
   - Username: `veloop_admin`
   - Password: Choose a secure password (e.g. `VeloopSecure2026!`). Save this password!
   - Built-in Role: **Read and write to any database**.
4. **Network Access (IP Whitelist):**
   - Under **Security > Network Access**, click **"Add IP Address"**.
   - Click **"Allow Access from Anywhere"** (`0.0.0.0/0`).
   - Click **Confirm**. *(Required so Render/Railway cloud servers can connect)*.
5. **Get Connection String:**
   - Under **Deployments > Database**, click **"Connect"**.
   - Select **"Drivers"** (Node.js).
   - Copy the connection string. It will look like:
     ```
     mongodb+srv://veloop_admin:<password>@cluster0.abcde.mongodb.net/veloop_rewards?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual password and ensure the database name is `veloop_rewards`.

> **Note on Automatic Seeding:** The backend is pre-configured to automatically seed the database on initial connection if empty! It creates:
> - Demo User: `demo@veloop.test` (25,000 VEs, 5,000 SVEs, 100 Gems, 500 Tokens, 3 Spins)
> - Demo Admin: `admin@veloop.test`
> - 19 Database-driven payout options across UPI, PayPal, Amazon, and Google Play.

---

## Step 2: Push Your Code to GitHub

If you haven't already pushed this workspace to GitHub:

```bash
git init
git add .
git commit -m "feat: complete veloop rewards production release"
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/veloop-rewards.git
git push -u origin main
```

---

## Step 3: Deploy Backend to Render (Free Web Service)

1. Sign up or log in to [render.com](https://render.com) using your GitHub account.
2. In the Render Dashboard, click **"New +"** > **"Web Service"**.
3. Select your GitHub repository: `veloop-rewards`.
4. Configure the Web Service settings:
   - **Name:** `veloop-rewards-backend`
   - **Region:** Nearest to your MongoDB Atlas cluster (e.g., Oregon, Frankfurt, Singapore)
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
5. Click **"Advanced"** > **"Add Environment Variable"** and add:

   | Key | Value | Description |
   |---|---|---|
   | `NODE_ENV` | `production` | Enables production optimizations |
   | `PORT` | `5000` | Backend port |
   | `MONGO_URI` | `mongodb+srv://veloop_admin:...` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | `super_secure_random_production_jwt_key_2026!` | 32+ character secret |
   | `JWT_EXPIRES_IN` | `7d` | Token lifetime |
   | `CLIENT_URL` | `*` *(or your Vercel frontend URL once created)* | Allowed CORS origin |

6. Click **"Create Web Service"**.
7. Wait 2–3 minutes for deployment. Once live, note your backend URL:
   - Example: `https://veloop-rewards-backend.onrender.com`
   - Verify health: `https://veloop-rewards-backend.onrender.com/health` $\rightarrow$ should return `{"status":"UP"}`.

---

## Step 4: Deploy Frontend to Vercel (Free)

1. Sign up or log in to [vercel.com](https://vercel.com) using your GitHub account.
2. In the Vercel Dashboard, click **"Add New..."** > **"Project"**.
3. Import your GitHub repository: `veloop-rewards`.
4. Configure Project settings:
   - **Project Name:** `veloop-rewards-frontend`
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click **Edit** and select `frontend`.
   - **Build Command:** `npm run build` *(default)*
   - **Output Directory:** `dist` *(default)*
5. Open **"Environment Variables"** and add:

   | Key | Value |
   |---|---|
   | `VITE_API_BASE_URL` | `https://veloop-rewards-backend.onrender.com` *(Your Render backend URL from Step 3 without trailing slash)* |

6. Click **"Deploy"**.
7. Within 60 seconds, your site will be live on a `*.vercel.app` URL (e.g., `https://veloop-rewards-frontend.vercel.app`).
8. *(Optional)* Return to your Render backend dashboard and update `CLIENT_URL` to `https://veloop-rewards-frontend.vercel.app` for strict CORS locking.

---

## Step 5: Verify Live Deployment

1. Visit your live Vercel URL in your browser.
2. On the login screen, click **"Demo User (25k VEs)"** and click **"Sign In"**.
   - Verify that your balances (25,000 VEs, 5,000 SVEs, 100 Gems, 500 Tokens, 3 Spins) load correctly.
   - Verify the 5 historical ledger records display in the table.
3. Click **"Redeem VEs / Withdraw"**:
   - Select **UPI** $\rightarrow$ choose ₹10 (2,400 VEs).
   - Enter your UPI ID (e.g. `test@okaxis`).
   - Click **"Review Withdrawal"** $\rightarrow$ verify the remainder balance preview (22,600 VEs) and auto-generated `Idempotency-Key`.
   - Click **"Confirm & Submit Withdrawal"** $\rightarrow$ verify instant deduction, ledger update, and success toast!
4. Log out and click **"Admin Demo"**:
   - Go to `/admin` $\rightarrow$ verify the pending withdrawal is listed.
   - Test **"Approve"** or **"Reject"** with reason to verify real-time status change and automated refund reversal.

---

## Alternative: Self-Hosted Docker Compose Deployment (VPS)

For users deploying to their own VPS (e.g. AWS EC2, DigitalOcean Droplet, Linode, Hetzner, or local server):

### Prerequisites
- Docker and Docker Compose installed:
  ```bash
  sudo apt update && sudo apt install -y docker.io docker-compose
  ```

### Launch in 1 Command
From the root directory of this project:
```bash
docker-compose up -d --build
```

This spins up 3 isolated, networked containers:
- **`veloop_mongodb`**: Persistent MongoDB 6.0 container on port `27017` with volume `mongo_data`.
- **`veloop_backend`**: Node.js Express service on port `5000`.
- **`veloop_frontend`**: Nginx Alpine serving the built React bundle with SPA fallback on port `5173`.

### View Logs & Manage Containers
```bash
# Check running containers
docker-compose ps

# View backend logs
docker-compose logs -f backend

# Stop all containers
docker-compose down
```

---

## Troubleshooting & FAQ

### 1. Render Free Tier Cold Starts
- **Behavior:** On Render's free tier, backend instances spin down after 15 minutes of inactivity. The first request after sleep may take 30–50 seconds to wake up.
- **Solution:** A health ping service (like UptimeRobot or Cron-job.org) can ping `https://your-backend.onrender.com/health` every 10 minutes to keep it warm.

### 2. CORS Errors (`Cross-Origin Request Blocked`)
- Ensure `CLIENT_URL` in the backend matches your Vercel URL, or set `CLIENT_URL=*` in Render environment variables.
- Ensure `VITE_API_BASE_URL` in Vercel contains `https://` and does **not** end with a trailing slash `/`.

### 3. Page Refresh Returns 404
- Handled automatically! We included `frontend/vercel.json` for Vercel, `frontend/public/_redirects` for Netlify, and `frontend/nginx.conf` for Docker.
