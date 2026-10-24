# NEXUS Spectacle - Deployment Guide (GitHub + Vercel)

This guide covers deploying NEXUS Spectacle to **GitHub** (source code) and **Vercel** (frontend hosting).

## 📋 Architecture

| Component | Technology | Deployment |
|-----------|-----------|------------|
| **Frontend** | React 18 + Vite + TypeScript | Vercel |
| **Backend** | Express.js + SQLite | Railway / Render / Fly.io / VPS |
| **Source Code** | Git | GitHub |

---

## 🚀 Step 1: Push to GitHub

### Initialize Git

```bash
cd nexus-spectacle
git init
git branch -m main
git add -A
git commit -m "Initial commit: NEXUS Spectacle with i18n support"
```

### Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `nexus-spectacle`
3. Description: NEXUS Spectacle - AR smart glasses web application
4. Select Public or Private
5. Do NOT initialize with README
6. Click Create repository

### Push Code to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/nexus-spectacle.git
git push -u origin main

---

## 🌐 Step 2: Deploy Frontend to Vercel

### Connect GitHub to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New Project**
3. Import the `nexus-spectacle` repository from GitHub
4. Configure project settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. Click **Deploy**

### Configure Environment Variables on Vercel

In the Vercel dashboard, go to **Settings → Environment Variables** and add:

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_API_URL` | `https://your-backend-api.vercel.app` | Production, Preview, Development |
| `VITE_SITE_URL` | `https://your-domain.vercel.app` | Production, Preview, Development |

> ⚠️ **Important:** The backend API must be deployed separately (see Step 3). Update `VITE_API_URL` once your backend is live.

### Add Custom Domain (Optional)

1. In Vercel dashboard, go to **Settings → Domains**
2. Add your custom domain (e.g., `nexus-spectacle.com`)
3. Configure DNS records as instructed by Vercel
4. Vercel automatically provisions SSL certificates

---

## 🖥️ Step 3: Deploy Backend API (Separate Service)

The backend (Express + SQLite) cannot run on Vercel's Hobby plan because it requires a persistent server process. Deploy it to a service that supports Node.js servers:

### Option A: Railway (Recommended)

1. Go to [railway.app](https://railway.app)
2. Create a new project and connect your GitHub repo
3. Set the root directory to `server/`
4. Add environment variables from `server/.env.example`
5. Deploy - Railway will give you a public URL

### Option B: Render

1. Go to [render.com](https://render.com)
2. Create a **Web Service** from your GitHub repo
3. Set root directory to `server/`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables

### Option C: Fly.io

1. Install flyctl: `curl -L https://fly.io/install.sh | sh`
2. Run `fly launch` in the `server/` directory
3. Run `fly deploy`

### Option D: VPS / Droplet

Use a VPS provider (DigitalOcean, Linode, etc.) and follow manual deployment steps.

---

## 🔐 Step 4: Configure Backend Environment Variables

On your backend hosting provider, set these variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` or `3000` |
| `JWT_SECRET` | Secret for JWT tokens | Generate a strong random string |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | From Google Cloud Console |
| `FACEBOOK_APP_ID` | Facebook OAuth app ID | From Facebook Developer Portal |
| `EMAIL_HOST` | SMTP host | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_USER` | SMTP username | `your-email@gmail.com` |
| `EMAIL_PASS` | SMTP password/app password | `your-app-password` |

> 🔒 **Security:** Generate a strong JWT_SECRET: `openssl rand -base64 32`

---

## 🔗 Step 5: Connect Frontend to Backend

Once your backend is deployed:

1. Get your backend URL (e.g., `https://nexus-api.railway.app`)
2. In Vercel dashboard, update `VITE_API_URL` to point to your backend
3. Redeploy the frontend on Vercel

The frontend will automatically connect to your backend for:
- User authentication (login, register, magic links)
- Preorder submissions
- Visitor tracking

---

## 📁 Project Structure for Deployment

```
nexus-spectacle/
├── vercel.json              # Vercel configuration
├── .env.example             # Frontend env variables template
├── package.json             # Frontend dependencies
├── vite.config.ts           # Vite config
├── tailwind.config.js       # Tailwind config
├── tsconfig.json            # TypeScript config
├── index.html               # Entry HTML with hreflang tags
├── public/
│   ├── locales/             # i18n translation files (en, zh-CN, ja, ak, fr, es)
│   ├── videos/              # Product videos
│   ├── simulator/           # AR simulator PWA
│   └── ...
├── src/
│   ├── i18n.ts              # i18n configuration
│   ├── components/          # React components
│   ├── sections/            # Page sections
│   ├── contexts/            # Auth context
│   └── ...
└── server/
    ├── index.js             # Express backend
    ├── package.json         # Backend dependencies
    └── .env.example         # Backend env variables template
```

---

## 🌍 Supported Languages

| Language | Code | Status |
|----------|------|--------|
| English | `en` | ✅ Complete |
| Chinese (Simplified) | `zh-CN` | ✅ Complete |
| Japanese | `ja` | ✅ Complete |
| Twi (Akan) | `ak` | ✅ Complete |
| French | `fr` | ✅ Complete |
| Spanish | `es` | ✅ Complete |

Language is auto-detected from browser settings and saved to `localStorage`.

---

## 📊 SEO Configuration

The `index.html` includes hreflang tags for multilingual SEO:

```html
<link rel="alternate" hreflang="en" href="https://your-domain.com/" />
<link rel="alternate" hreflang="zh-CN" href="https://your-domain.com/zh-CN/" />
<link rel="alternate" hreflang="ja" href="https://your-domain.com/ja/" />
<link rel="alternate" hreflang="ak" href="https://your-domain.com/ak/" />
<link rel="alternate" hreflang="fr" href="https://your-domain.com/fr/" />
<link rel="alternate" hreflang="es" href="https://your-domain.com/es/" />
<link rel="alternate" hreflang="x-default" href="https://your-domain.com/" />
```

---

## 🛠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails on Vercel | Ensure `vite.config.ts` doesn't reference `process.env.GITHUB_PAGES` unless deploying to GitHub Pages |
| API calls fail | Check `VITE_API_URL` is set correctly in Vercel env vars |
| CORS errors | Ensure backend CORS allows your Vercel domain |
| 404 on refresh | Vercel `vercel.json` routes handle SPA fallback to `/index.html` |
| SQLite write errors | Backend needs persistent disk; use a service that supports it |

---

## 📞 Support

- Frontend issues: Check Vercel deployment logs
- Backend issues: Check your backend hosting provider logs
- i18n issues: Verify translation files in `public/locales/`
```