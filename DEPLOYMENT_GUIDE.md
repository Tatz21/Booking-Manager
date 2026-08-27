# 🚀 Complete Production Deployment & Go-Live Guide

This document contains the step-by-step instructions to take the **Multi-Tenant Appointment Booking SaaS Platform** live in production.

---

## 📋 Pre-Flight Checklist

Before deploying, ensure you have gathered your production environment credentials:

| Service | Environment Variable | Description |
|---|---|---|
| **Database** | `DATABASE_URL` | Managed PostgreSQL connection string (Render, Supabase, Neon, RDS) |
| **JWT Secrets** | `JWT_SECRET`, `JWT_REFRESH_SECRET` | Strong cryptographic keys (`openssl rand -base64 48`) |
| **Razorpay (Live)** | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Production API keys from Razorpay Dashboard |
| **Razorpay Webhook**| `RAZORPAY_WEBHOOK_SECRET` | Secret configured on Razorpay Webhook settings |
| **SMS / WhatsApp** | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` | Twilio Account SID & Token |
| | `TWILIO_PHONE_NUMBER`, `TWILIO_WHATSAPP_NUMBER` | Twilio phone number and approved WhatsApp Sender |
| **Email Gateway** | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | SMTP credentials from Resend, SendGrid, Postmark, or AWS SES |
| | `SMTP_FROM` | Verified sender email (e.g., `noreply@yourdomain.com`) |

---

## 🛠️ Step 1: Deploy Backend API

### Option A: Render (Recommended - 1-Click Infrastructure Blueprint)
1. Commit the repository to GitHub.
2. Log into [Render.com](https://render.com) and click **New > Blueprint**.
3. Connect your repository. Render will automatically detect [`render.yaml`](./render.yaml).
4. Fill in the environment secret values in the Render dashboard.
5. Render will automatically provision the managed PostgreSQL database, run `prisma migrate deploy`, build NestJS, and launch with automatic SSL!

### Option B: Google Cloud Run (GCP)
1. Build and push the Docker image:
   ```bash
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/booking-backend ./backend
   ```
2. Deploy the container using [`cloudrun.yaml`](./cloudrun.yaml):
   ```bash
   gcloud run services replace cloudrun.yaml
   ```
3. Set Cloud SQL PostgreSQL connection via Cloud Run Secret Manager.

---

## 🌐 Step 2: Deploy Flutter Web Frontend

### Option A: Firebase Hosting (Recommended)
1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```
2. Login to Firebase:
   ```bash
   firebase login
   ```
3. Associate your project in [`.firebaserc`](./.firebaserc):
   ```json
   {
     "projects": {
       "default": "your-firebase-project-id"
     }
   }
   ```
4. Build and Deploy:
   ```bash
   cd frontend
   flutter build web --release
   firebase deploy --only hosting
   ```

### Option B: Vercel
1. Install Vercel CLI: `npm install -g vercel`
2. Run `vercel deploy` in the root or link via GitHub.
3. Vercel will use [`vercel.json`](./vercel.json) to serve the SPA from `frontend/build/web`.

---

## 🔔 Step 3: Configure Live Multi-Channel Gateways

### 1. Twilio SMS & WhatsApp Business
1. In Twilio Console, create or select your Messaging Service.
2. In `backend/.env.production`, configure:
   ```env
   TWILIO_ACCOUNT_SID=ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=+1XXXXXXXXXX
   TWILIO_WHATSAPP_NUMBER=+14155238886
   ```
3. When customers book appointments, instant SMS and WhatsApp confirmation messages will automatically dispatch.

### 2. Transactional Email (Resend / SendGrid / AWS SES)
Configure your SMTP variables:
```env
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=re_XXXXXXXXXXXXXXXXXXXX
SMTP_FROM=appointments@yourbrand.com
```
* Customer confirmations will deliver with dynamic brand colors, company logos, Google Calendar 1-click links, and attached `.ics` files.
* Staff will receive immediate assignment alerts.

### 3. Automated Reminder Cron Jobs
The `@nestjs/schedule` background engine runs automatically inside the NestJS process:
* Evaluates appointments every 5 minutes (`*/5 * * * *`).
* Sends **24-Hour** and **2-Hour** proactive reminders across Email, SMS, and WhatsApp.
* Records each event into the `NotificationLog` table to guarantee no duplicate messages are dispatched.

---

## 💳 Step 4: Razorpay Production Webhooks
1. In the Razorpay Dashboard, navigate to **Settings > Webhooks > Add New Webhook**.
2. Set the Webhook URL to:
   ```
   https://api.yourdomain.com/api/v1/payments/webhook
   ```
3. Select Active Events:
   * `subscription.authenticated`
   * `subscription.activated`
   * `subscription.charged`
   * `subscription.cancelled`
   * `payment.captured`
4. Copy the Webhook Secret and set it as `RAZORPAY_WEBHOOK_SECRET` in your backend environment variables.

---

## 🔒 Step 5: Verification & Health Check

1. Verify Backend Health:
   ```bash
   curl -i https://api.yourdomain.com/api/v1/health
   ```
   Expected response: `{"status":"ok", "environment":"production"}`
2. Verify Swagger Documentation:
   ```
   https://api.yourdomain.com/api/v1/docs
   ```
3. Test a public booking flow at `https://yourdomain.com/book/:slug`.
4. Open the Owner Dashboard at `https://yourdomain.com` and observe real-time notifications with audio chimes in the Notification Center!
