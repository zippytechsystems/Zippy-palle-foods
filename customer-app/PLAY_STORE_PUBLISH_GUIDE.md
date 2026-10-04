# Mana Palle Fresh (మన పల్లె ఫ్రెష్)
## Complete Guide: Run, Test & Publish to Google Play Store with Zero Dev Cost

---

## 1. Quick Local Testing (Instant Run)

You can run and test the app immediately in any browser on your computer or mobile phone.

### Option A: Using Python (Built-in on Windows/Mac)
Open PowerShell or Terminal inside `palle-fresh` directory and run:
```powershell
cd palle-fresh
python -m http.server 8080
```
Open your browser to: **`http://localhost:8080`**

### Option B: Using Node `npx serve`
```powershell
cd palle-fresh
npx serve -l 8080
```

### Testing on your Android Phone via Local Wi-Fi:
Find your computer's IP address (run `ipconfig` in cmd), then on your Android phone's Chrome browser visit:
`http://<YOUR-PC-IP>:8080` (e.g. `http://192.168.1.15:8080`).
You can tap **"Add to Home Screen"** or **"Install App"** and it will behave exactly like a native Android APK!

---

## 2. Deploy Free in 60 Seconds (Get Live HTTPS URL)

Google Play Store and Android PWA require a live HTTPS URL. You can host this for **100% free forever** on Firebase Hosting or Vercel.

### Free Hosting via Vercel:
```bash
npm install -g vercel
cd palle-fresh
vercel
```
*(Select defaults. In 30 seconds you get a live URL like `https://mana-palle-fresh.vercel.app`)*

### Free Hosting via Firebase Hosting:
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Set public directory to '.' and configure as single-page app
firebase deploy
```

---

## 3. Publish to Google Play Store (Step-by-Step)

There are two verified paths to generate an Android Play Store package (`.aab` / `.apk`) from this codebase:

---

### Path A: Using PWABuilder (Easiest - 100% Free & No Android Studio Needed)

PWABuilder is an open-source tool developed by Microsoft and Google to turn PWAs into Google Play Store packages in 2 minutes.

1. Open **[pwabuilder.com](https://www.pwabuilder.com/)** in your browser.
2. Enter your live HTTPS URL (e.g., `https://mana-palle-fresh.vercel.app`) and click **Start**.
3. It will scan your `manifest.json` and service worker (all scores will be green 100/100).
4. Click **Package for Stores** ➔ Select **Google Play (Android)**.
5. Fill in your package details:
   - **Package ID**: `com.manapalle.fresh`
   - **App Name**: `Mana Palle Fresh`
   - **Version**: `1.0.0` (Version code: `1`)
6. Choose **Signing Options**:
   - If this is your first release, let PWABuilder generate your `.keystore` file (download and keep it safe!).
7. Click **Generate** ➔ Download the zip file containing:
   - `app-release.aab` (Ready for Google Play Store upload)
   - `assetlinks.json` (For Digital Asset Links verification)

---

### Path B: Using Google's Official Bubblewrap CLI (Command Line TWA)

If you prefer building from the terminal using Google's official Trusted Web Activity (TWA) toolchain:

1. Install Bubblewrap CLI:
   ```bash
   npm install -g @bubblewrap/cli
   ```
2. Initialize project from your live URL:
   ```bash
   bubblewrap init --manifest="https://mana-palle-fresh.vercel.app/manifest.json"
   ```
3. Follow the CLI prompts:
   - Set Application Name: `Mana Palle Fresh`
   - Package ID: `com.manapalle.fresh`
   - Key store password: *(set your password)*
4. Build the Android App Bundle (`.aab`):
   ```bash
   bubblewrap build
   ```
5. It compiles `app-release-signed.aab` inside the project folder!

---

## 4. Google Play Console Upload Steps

1. **Sign in to Google Play Console**: [play.google.com/console](https://play.google.com/console). *(Requires one-time $25 developer account fee).*
2. Click **Create App**:
   - App Name: `Mana Palle Fresh`
   - Default Language: `English (India)`
   - App or Game: `App`
   - Free or Paid: `Free`
3. Complete the **Set up your app** tasks:
   - **Privacy Policy**: Use a free generator or link to your privacy page.
   - **Target Audience**: 18+ (Food & Grocery delivery).
   - **Category**: Shopping / Food & Drink.
   - **Store Listing**:
     - Upload the provided logo from `assets/logo.jpg` (512x512).
     - Upload screenshots of Customer, Admin, and Delivery views.
     - Add description in English & Telugu.
4. **Create a Production Release**:
   - Navigate to **Production** ➔ **Create new release**.
   - Drag and drop your `app-release.aab` file.
   - Enter Release Notes: *"Initial release of Mana Palle Fresh serving HMT Nagar apartments in Hyderabad."*
   - Click **Save** ➔ **Review release** ➔ **Start rollout to Production**!

---

## 5. How to Run This Hyperlocal Business at Near-Zero Cost (₹0/mo)

1. **₹0 Payment Gateway Fees (UPI Intent & QR)**:
   - Traditional payment gateways charge 2% + 18% GST. On a ₹1,000 mutton order, you lose ₹23.60!
   - Mana Palle Fresh uses direct **BHIM UPI / Google Pay / PhonePe Intent & QR**, which has **0% merchant MDR in India**. You receive 100% of the customer's payment directly into your bank account.
2. **₹0 Cloud Database (Supabase Free Tier)**:
   - The included `supabase_schema.sql` can be pasted into a free [Supabase](https://supabase.com) project.
   - Free tier includes 500 MB database and 50,000 monthly active users—more than enough for 10 apartments (approx. 500 flats).
3. **₹0 SMS OTP Cost (WhatsApp Direct OTP)**:
   - SMS gateways (Twilio, Msg91) charge ₹0.25 to ₹0.40 per SMS.
   - For pilot launch, use WhatsApp direct verification or Firebase Phone Auth (10,000 free verifications/month).
4. **₹0 Customer Acquisition Cost (Apartment WhatsApp Groups)**:
   - Use the built-in **WhatsApp Offer Generator** in the Admin tab to generate daily morning specials.
   - Share directly with apartment resident associations and RWA committees.
