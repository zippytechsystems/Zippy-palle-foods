# 🌾 Mana Palle Fresh (ZFresh)

**Hyperlocal Village-to-Apartment Fresh Delivery System • HMT Nagar, Hyderabad**

---

## 🌟 Business Overview
Mana Palle Fresh delivers unadulterated village produce harvested at dawn directly to apartment residents in HMT Nagar, Hyderabad.

### 🛡️ Strictly 3 Core Services (Zero Groceries / Zero Vegetables)
1. **🥛 Morning Health Milk**: Fresh raw A2 Desi cow & buffalo milk sourced at dawn from Siddipet & Gajwel farmers. Delivered 6:00 – 8:00 AM daily or on alternate-day subscriptions.
2. **🐟 Fresh Village Fish**: Freshwater pond fish (Singur irrigation tank Rohu & Katla / Bocha). Cleaned and cut fresh into neat curry-cut steaks without frozen ice storage.
3. **🥩 Fresh Village Mutton**: Grass-fed village sheep from Alair pastoralists. Washed in natural turmeric water, available in bone-in curry cuts, boneless cuts, and hand-minced keema.

*Strict Guarantee: Absolutely NO vegetables, rice, pulses, grains, oils, chicken, or dry fruits exist anywhere in this system.*

---

## 📁 Monorepo Structure

```
zfresh/
├── backend/                  # Production Node.js + Express + Supabase API
│   ├── db.js                 # PostgreSQL queries via Supabase client (with dev fallback)
│   ├── server.js             # Express server with JWT, bcrypt, rate limiting & helmet
│   ├── package.json          # Dependencies & scripts
│   ├── .env.example          # Environment variables template
│   └── .gitignore
├── admin-dashboard/          # Production React + Vite Admin Dashboard
│   ├── src/
│   │   ├── components/       # 6 Core operational views + Navbar + Sidebar
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── RatesView.jsx        # 🌾 Sourcing & Rates
│   │   │   ├── OrdersView.jsx       # 🏢 Apartment Orders
│   │   │   ├── ProcurementView.jsx  # 🛒 Dawn Village Buying List
│   │   │   ├── SubscriptionsView.jsx# 🥛 Milk Subscriptions
│   │   │   ├── ReportsView.jsx      # 📊 Sales & Reports + CSV Export
│   │   │   ├── CustomersView.jsx    # 👥 Customer Directory
│   │   │   ├── AlertsView.jsx       # 📢 WhatsApp Broadcasts (wa.me)
│   │   │   └── CustomerAppTrigger.jsx # 24px discreet 'Z' trigger component
│   │   ├── api.js            # Typed API client with 401 token interceptor
│   │   ├── translations.js   # Bilingual Telugu (తెలుగు) & English strings
│   │   ├── App.jsx           # Main container & 60s auto-refresh
│   │   ├── main.jsx
│   │   └── index.css         # Earthy green design tokens + print stylesheet
│   ├── index.html
│   ├── vite.config.js
│   ├── vercel.json           # Client-side SPA routing rewrites
│   ├── .env.example          # VITE_API_URL template
│   └── package.json
├── supabase/                 # Database DDL & Seed Data
│   ├── schema.sql            # Postgres DDL, indexes, and Row Level Security (RLS)
│   └── seed.sql              # Clean seed data (strictly the 6 items + pilot data)
├── .gitignore
└── README.md
```

---

## 🗄️ Task 1: Supabase (PostgreSQL) Setup

1. **Create Project**:
   - Go to [supabase.com](https://supabase.com) and create a new project (e.g. `zfresh-db`).
   - Select region closest to India (e.g., `ap-south-1` Mumbai or `ap-southeast-1` Singapore).

2. **Execute Schema & Seed**:
   - In your Supabase dashboard, navigate to the **SQL Editor** on the left menu.
   - Click **New Query**, copy the contents of `supabase/schema.sql`, and click **Run**.
   - Click **New Query**, copy the contents of `supabase/seed.sql`, and click **Run**.

3. **Get API Credentials**:
   - Go to **Project Settings** (gear icon) ➔ **API**.
   - Copy **Project URL** (this is your `SUPABASE_URL`).
   - Under **Project API Keys**, find the `service_role` key (marked *Secret*). Click reveal and copy it (this is your `SUPABASE_SERVICE_ROLE_KEY`).
   - ⚠️ *Security rule: Never expose the `service_role` key in frontend code or Git commits.*

---

## 🔒 Security Architecture

- **Row Level Security (RLS)**: Enabled across all 7 tables (`products`, `rate_history`, `customers`, `orders`, `order_items`, `subscriptions`, `alerts`). Public anon role is blocked from direct writes.
- **Service Role Key**: The Node.js backend uses the Supabase service role key server-side only. The frontend only communicates with backend APIs using Bearer JWT.
- **Password Security**: Admin password stored and evaluated with `bcrypt`.
- **Brute Force Protection**: Rate limiting on `/api/admin/login` restricted to maximum 5 attempts per 15 minutes.
- **CORS Protection**: Restricted to the owner's Vercel frontend domain (`CORS_ORIGIN`).
- **HTTP Headers**: Enforced via `helmet`.

---

## 🚀 Task 5: Deploy Backend on Railway

1. Sign up/Log in at [railway.app](https://railway.app).
2. Click **New Project** ➔ **Deploy from GitHub repo** ➔ Select `zfresh`.
3. In the Railway service settings:
   - **Root Directory**: `/backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. In the **Variables** tab, set:
   ```env
   PORT=4000
   ADMIN_USER=admin
   ADMIN_PASSWORD=your_strong_admin_password
   TOKEN_SECRET=your_long_random_jwt_secret_token
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_secret_key
   CORS_ORIGIN=https://your-admin-dashboard.vercel.app,http://localhost:5173
   ```
5. Click **Deploy**. In the **Networking** section, click **Generate Domain** (e.g. `https://zfresh-backend-production.up.railway.app`).
6. Test your live deployment:
   ```bash
   curl https://your-railway-url.up.railway.app/health
   curl https://your-railway-url.up.railway.app/api/products
   ```

---

## 🌐 Task 6: Deploy Admin Dashboard on Vercel

1. Sign up/Log in at [vercel.com](https://vercel.com).
2. Click **Add New** ➔ **Project** ➔ Import the `zfresh` repository.
3. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `admin-dashboard`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_URL`: Your live Railway backend URL (e.g. `https://zfresh-backend-production.up.railway.app`)
5. Click **Deploy**. Vercel will assign a URL like `https://zfresh-admin.vercel.app`.
6. Return to Railway and update `CORS_ORIGIN` to match your Vercel domain.

---

## 📖 Owner's Daily Routine Guide

1. **4:30 AM – Dawn Procurement**:
   - Open Dashboard ➔ Click **🌾 Sourcing & Rates** / **🛒 Daily Buying List**.
   - Check the **Dawn Village Buying List** (automatically calculated from today's orders + morning milk subscriptions).
   - Click **Print List** to take the paper sheet to village farmers in Siddipet / Alair.
2. **6:00 AM – Morning Delivery**:
   - Click **🏢 Apartment Orders** ➔ Filter by "Morning Slot".
   - Pack milk bottles & fresh cuts grouped by apartment block.
   - Mark orders as **Delivered** as your runner drops them at the flat doors.
3. **10:00 AM – Market Rates & Alerts**:
   - If fish or mutton market price fluctuated, update selling/buying rates in **🌾 Sourcing & Rates**.
   - If a fresh catch arrived, go to **📢 WhatsApp & Alerts**, pick the "Fresh Pond Katla Fish" template, and click **Generate WhatsApp Links** to message residents in 1 click via `wa.me`.
4. **8:00 PM – Evening Settlement & Reports**:
   - Go to **📊 Sales & Reports** to review gross daily revenue, cash collected, and net village profit.
   - Click **Export CSV** to save accounting records.
