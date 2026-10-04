# 🌾 Palle Natural Foods

> **Hyperlocal Village-Fresh Delivery in HMT Nagar, Hyderabad**  
> Serving apartment residents across 10 pilot communities with pure, unadulterated morning milk, fresh pond fish, and pasture-fed mutton delivered straight from Telangana villages to flat doorsteps.

---

## 🌟 Business Overview & Strict Product Scope

**Palle Natural Foods** operates on a zero-inventory, dawn-procurement model: orders and subscriptions placed by apartment residents are aggregated before sunrise, procured directly from village farmers and pastoralists, cleaned/cut to resident specifications, and delivered fresh to flat doors.

### 🛡️ Strictly 3 Core Services (Zero Groceries / Zero Vegetables)
1. **🥛 Morning Health Milk**: Pure village cow & buffalo milk sourced at dawn from Siddipet & Gajwel farmers. Delivered fresh between 6:00 AM – 8:00 AM daily or on alternate-day subscriptions.
2. **🐟 Fresh Village Fish**: Freshwater reservoir fish (Singur/Manjira Rohu & Katla / Bocha). Cleaned and cut to order (whole, cleaned whole, or curry cut) without chemical preservatives or prolonged ice-freezing.
3. **🥩 Fresh Village Mutton**: Pasture-fed village sheep from Alair pastoralists. Turmeric-washed, available in bone-in curry cut, boneless cuts, and hand-minced keema.

*Strict Guarantee: Absolutely NO vegetables, rice, grains, pulses, oils, eggs, chicken, or dry fruits exist anywhere in this system.*

---

## 🏛️ Target Production Architecture (Hostinger)

| Component | Technology | Target Subdomain / URL |
| :--- | :--- | :--- |
| **`/customer-app`** | React + Vite PWA (Mobile-first, installable, bilingual) | `https://<mydomain>` |
| **`/admin-dashboard`** | React + Vite Admin SPA (6 operational modules) | `https://admin.<mydomain>` |
| **`/backend`** | Node.js + Express API + `mysql2` connection pool | `https://api.<mydomain>` |
| **`Database`** | Hostinger MySQL (InnoDB, `utf8mb4_unicode_ci`, localhost) | Managed via hPanel & phpMyAdmin |

---

## 📁 Monorepo Layout

```
zfresh/
├── backend/                  # Node.js + Express API + MySQL Connection Pool
│   ├── db.js                 # MySQL2 pool queries, transactions & OTP storage
│   ├── server.js             # Express routes, rate limiters, JWT, helmet, CORS
│   ├── .env.example          # Environment variable template with placeholders
│   ├── package.json
│   └── .gitignore
├── admin-dashboard/          # React + Vite Production Admin Dashboard
│   ├── src/
│   │   ├── components/       # 6 Core admin screens (Rates, Orders, Milk, Reports, Customers, Alerts)
│   │   ├── api.js            # Axios client with Bearer token & 401 interceptor
│   │   ├── translations.js   # English & Telugu (తెలుగు) localization
│   │   └── App.jsx
│   ├── public/
│   │   └── .htaccess         # Hostinger Apache HTTPS & SPA route fallback
│   ├── .env.example
│   └── package.json
├── customer-app/             # React + Vite Installable PWA
│   ├── src/
│   │   ├── components/       # StoreHome (3 cards), CartDrawer, OtpModal, ApartmentModal, etc.
│   │   ├── api.js            # Customer API client (products, orders, subs, OTP)
│   │   ├── translations.js   # English & Telugu (తెలుగు) localization
│   │   └── App.jsx
│   ├── public/
│   │   ├── manifest.json     # PWA manifest ("Palle Natural Foods")
│   │   ├── sw.js             # Service Worker for offline caching & installability
│   │   ├── .htaccess         # Hostinger Apache HTTPS & SPA route fallback
│   │   └── assets/           # Real photographs of Milk, Fish, and Mutton
│   ├── .env.example
│   └── package.json
├── database/                 # Production MySQL DDL & Seed Scripts
│   ├── schema.sql            # InnoDB tables, foreign keys, DECIMAL types, indexes
│   └── seed.sql              # Seeds products, pilot rates, HMT Nagar apartments & subscriptions
├── .gitignore                # Protects node_modules, .env, *.db, dist
└── README.md
```

---

## 🗄️ Task 1: Database Setup (Hostinger MySQL)

### 1. Create MySQL Database in Hostinger hPanel
1. Log in to **Hostinger hPanel** (`hpanel.hostinger.com`).
2. Navigate to **Databases** ➔ **MySQL Databases**.
3. Under **Create a New MySQL Database and Database User**:
   - **Database Name**: e.g., `u123456789_palle`
   - **Username**: e.g., `u123456789_palleuser`
   - **Password**: Generate a strong password (at least 16 characters).
4. Click **Create**. Note down the exact DB Name, DB User, and Password.

### 2. Import Schema & Seed via phpMyAdmin
1. In hPanel ➔ **MySQL Databases**, locate your new database and click **Enter phpMyAdmin**.
2. Select your database from the left sidebar.
3. Click the **Import** tab at the top.
4. Click **Choose File** and select `database/schema.sql` from your computer. Click **Import / Go**.
5. Once imported successfully, click the **Import** tab again, select `database/seed.sql`, and click **Import / Go**.
6. Verify the 8 tables are present:
   - `products` (6 products only)
   - `rate_history`
   - `customers`
   - `orders`
   - `order_items`
   - `subscriptions`
   - `alerts`
   - `otp_codes`

### 3. Setting Up Automated Daily Backups
- **Automatic hPanel Backups**: In hPanel, go to **Files** ➔ **Backups** ➔ **Generate Backup** or view daily automated database snapshots provided by Hostinger.
- **Manual / Scheduled mysqldump (VPS / Cron)**:
  ```bash
  mysqldump -u u123456789_palleuser -p'YOUR_PASSWORD' u123456789_palle > /home/backups/palle_backup_$(date +\%F).sql
  ```

---

## 🔒 Task 4: Security Architecture

- **Credentials Isolation**: Admin credentials and database passwords exist ONLY in environment variables (`.env`). No credentials or tokens are committed to GitHub or embedded in client bundles.
- **Constant-Time Password Comparison**: Uses `crypto.timingSafeEqual` in `backend/server.js` to protect against timing attacks, with automatic startup warnings if passwords have fewer than 12 characters.
- **Strict Rate Limiting**:
  - Admin login: Maximum 5 attempts per 15-minute window (`loginLimiter`).
  - Resident OTP requests: Maximum 5 requests per 10-minute window per IP (`otpLimiter`).
- **HTTP Hardening**:
  - `helmet`: Sets HTTP security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`).
  - `cors`: Strictly restricted to domains configured in `CORS_ORIGIN` (e.g. `https://yourdomain.com,https://admin.yourdomain.com`).
- **OTP Life-cycle**: OTPs expire after 5 minutes and are capped at 3 verification attempts.

---

## 🚀 Task 6: Hostinger Deployment Guide

### Option A: Hostinger Business or Cloud Plan (Node.js Web App Support)
1. **Deploy Backend (`api.<mydomain>`)**:
   - In hPanel, go to **Advanced** ➔ **Node.js** (or **Websites** ➔ **Create Subdomain** `api.<mydomain>`).
   - Create a Node.js application targeting `api.<mydomain>`.
   - Set **Node.js Version**: `18.x` or `20.x`.
   - Set **Application Root**: `/backend` (or upload backend contents to the subdomain's folder).
   - Set **Application Startup File**: `server.js`.
   - In the **Environment Variables** section of the Node.js app, configure:
     ```env
     PORT=4000
     DB_HOST=localhost
     DB_PORT=3306
     DB_NAME=u123456789_palle
     DB_USER=u123456789_palleuser
     DB_PASSWORD=your_mysql_password
     ADMIN_USER=CHANGE_ME
     ADMIN_PASSWORD=CHANGE_ME_MIN_12_CHARS
     JWT_SECRET=CHANGE_ME_MIN_32_CHARS
     CORS_ORIGIN=https://yourdomain.com,https://admin.yourdomain.com
     ```
   - Run `npm install` and start the application.
   - Verify health: `https://api.<mydomain>/health` should return `{"status":"ok","database":"connected"}`.

2. **Deploy Customer App (`<mydomain>`)**:
   - On your local development machine, inside `/customer-app`:
     ```bash
     # Set production API URL in .env
     echo "VITE_API_URL=https://api.<mydomain>" > .env
     echo "VITE_ADMIN_URL=https://admin.<mydomain>" >> .env
     npm run build
     ```
   - In hPanel ➔ **File Manager**, navigate to `public_html/` of your main domain.
   - Upload all files from `/customer-app/dist/` (including `index.html`, `assets/`, `manifest.json`, `sw.js`, and `.htaccess`).

3. **Deploy Admin Dashboard (`admin.<mydomain>`)**:
   - In hPanel ➔ **Domains** ➔ **Subdomains**, create `admin.<mydomain>`.
   - On your local development machine, inside `/admin-dashboard`:
     ```bash
     echo "VITE_API_URL=https://api.<mydomain>" > .env
     npm run build
     ```
   - In hPanel ➔ **File Manager**, navigate to `public_html/admin/` (or the folder mapped to `admin.<mydomain>`).
   - Upload all files from `/admin-dashboard/dist/` (including `index.html`, `assets/`, and `.htaccess`).

4. **SSL / HTTPS**:
   - In hPanel ➔ **Security** ➔ **SSL**, activate free Let's Encrypt SSL certificates for `<mydomain>`, `admin.<mydomain>`, and `api.<mydomain>`. Both `.htaccess` files automatically redirect all HTTP traffic to HTTPS.

---

### Option B: Hostinger VPS Plan (Ubuntu 22.04 / 24.04 LTS)
If you are on a Hostinger VPS:
1. **Install Core Software**:
   ```bash
   sudo apt update && sudo apt install -y nodejs npm mysql-server nginx git certbot python3-certbot-nginx
   sudo npm install -g pm2
   ```
2. **Setup MySQL**:
   ```bash
   sudo mysql_secure_installation
   sudo mysql -u root -p -e "CREATE DATABASE palle_natural_foods CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   sudo mysql -u root -p -e "CREATE USER 'palle_user'@'localhost' IDENTIFIED BY 'CHANGE_ME_STRONG_PASSWORD';"
   sudo mysql -u root -p -e "GRANT ALL PRIVILEGES ON palle_natural_foods.* TO 'palle_user'@'localhost'; FLUSH PRIVILEGES;"
   mysql -u palle_user -p palle_natural_foods < database/schema.sql
   mysql -u palle_user -p palle_natural_foods < database/seed.sql
   ```
3. **Run Backend with PM2**:
   ```bash
   cd /var/www/palle-natural-foods/backend
   npm install --production
   # Configure /var/www/palle-natural-foods/backend/.env
   pm2 start server.js --name "palle-api"
   pm2 startup
   pm2 save
   ```
4. **Nginx Reverse Proxy & Static Hosting**:
   - Map `api.<mydomain>` to proxy `http://127.0.0.1:4000`.
   - Map `<mydomain>` to root `/var/www/palle-natural-foods/customer-app/dist`.
   - Map `admin.<mydomain>` to root `/var/www/palle-natural-foods/admin-dashboard/dist`.
   - Issue SSL certificates via `certbot --nginx -d <mydomain> -d admin.<mydomain> -d api.<mydomain>`.

---

## 🧪 Task 7: End-to-End Verification Checkpoints

1. **Customer OTP & Registration**:
   - Send OTP request via `/api/auth/send-otp` with mobile number.
   - Enter OTP (default test OTP logged in dev console).
   - Enter resident name, select pilot apartment (e.g. *Janapriya Bharat Heavens*, Block B, Flat 302).
2. **Order Placement**:
   - Add **Rohu Fish** (cleaned cut, 1kg) and **Mutton Curry Cut** (500g).
   - Select morning delivery slot, choose Cash on Delivery (COD) or UPI, and confirm order.
3. **Milk Subscription**:
   - In the **Milk Subscriptions** tab, choose *Daily* or *Alternate Days*, set 1 Litre, and activate.
4. **Admin Dashboard Verification**:
   - Log in at `https://admin.<mydomain>` with `ADMIN_USER` and `ADMIN_PASSWORD`.
   - Under **🏢 Apartment Orders**, verify the new order is grouped under *Janapriya Bharat Heavens*. Update status from `Pending` ➔ `Confirmed` ➔ `Delivered`.
   - Under **🌾 Sourcing & Rates**, update Rohu selling price or toggle mutton availability. Confirm the customer app updates immediately.
   - Under **🛒 Dawn Buying List (Procurement)**, verify required procurement quantities are tallied accurately.
   - Under **📊 Sales & Reports**, verify revenue, order count, and export CSV.
   - Under **📢 WhatsApp & Alerts**, test pre-filled broadcast templates directly into `wa.me`.
5. **Security & Scope Verification**:
   - Verify that **NO** groceries, vegetables, chicken, or eggs appear anywhere.
   - Verify that all passwords, database secrets, and tokens are stored exclusively in `.env`.
   - Verify that the customer app includes the discreet 24px 'Z' shortcut on the edge to access the admin portal.

---

## 📖 Owner's Daily Routine Guide

1. **4:30 AM – Dawn Village Procurement**:
   - Open Admin Dashboard ➔ Click **🌾 Sourcing & Rates** / **🛒 Buying List**.
   - Review total Milk, Fish, and Mutton required for today's deliveries.
   - Click **Print List** to bring the sheet to farmers in Siddipet & Alair.
2. **6:00 AM – Morning Delivery Run**:
   - In **🏢 Apartment Orders**, filter by "Morning Slot" and apartment name.
   - Dispatch runner to drop fresh milk bottles and fresh cuts at resident doorsteps.
   - Mark orders as **Delivered** in real time.
3. **10:00 AM – Daily Rates & Catch Alerts**:
   - Update daily wholesale or retail rates in **🌾 Sourcing & Rates**.
   - Send arrival alerts to residents via **📢 WhatsApp & Alerts** using 1-click `wa.me` links.
4. **8:00 PM – Daily Settlement & CSV Export**:
   - Open **📊 Sales & Reports** to review revenue collected (Cash + UPI) and export accounting CSVs.
