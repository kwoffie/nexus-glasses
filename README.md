# NEXUS Spectacle

**Your phone, reimagined for your eyes.**

NEXUS Spectacle is a cutting-edge web application showcasing the world's first smart spectacles that replace your phone with AR navigation, gesture control, and AI assistance.

![NEXUS Spectacle](https://img.shields.io/badge/NEXUS-Spectacle-8B5CF6?style=for-the-badge)

## ✨ Features

- **AR Navigation** — Full-screen augmented reality navigation overlays
- **Gesture Control** — Intuitive hand gesture recognition system
- **Neural AI** — On-device AI processing with real-time responses
- **Health Monitoring** — Built-in biometric sensors for wellness tracking
- **Color Studio** — Dynamic frame color customization
- **Interactive Demo** — Live product simulation experience
- **Preorder System** — Complete authentication and preorder management

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The backend API server runs separately:

```bash
cd server
npm install
npm start
```

### Desktop Launch

Double-click `nexus-spectacle.desktop` on your desktop to launch both frontend and backend servers automatically.

## 🏗️ Project Structure

```
nexus-spectacle-updates/
├── src/
│   ├── sections/        # Page sections (Hero, Features, Demo, etc.)
│   ├── components/      # Reusable UI components
│   │   └── ui/          # shadcn/ui primitives
│   ├── contexts/        # React context providers
│   └── lib/             # Utility functions
├── server/              # Express.js backend with SQLite
│   ├── index.js         # API server (auth, preorders, contact)
│   └── nexus.db         # SQLite database
├── public/
│   ├── videos/          # Product demonstration videos
│   ├── images/          # Background and section imagery
│   └── simulator/       # AR product simulator (PWA)
└── ...config files
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite 6 |
| **Styling** | Tailwind CSS 3, shadcn/ui |
| **3D/AR** | Three.js |
| **Backend** | Express.js, SQLite (better-sqlite3) |
| **Auth** | JWT, bcrypt, OAuth (Google, Facebook) |
| **Icons** | Lucide React |

## 📄 License

MIT License — see [LICENSE](LICENSE).

---

Built with ❤️ for the future of wearable computing.