# NEXUS Spectacle Backend API

Complete authentication and preorder backend for the NEXUS Spectacle website.

## Features

- **Email/Password Authentication** - Secure user registration and login
- **Social Login** - Google and Facebook OAuth integration
- **Magic Link Authentication** - Passwordless email login
- **JWT Tokens** - Secure session management (7-day expiry)
- **Preorder Management** - Track user preorders
- **Visitor Tracking** - Monitor site visits
- **SQLite Database** - Lightweight, file-based storage

## Quick Start

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=5000
JWT_SECRET=your_secure_jwt_secret_key_here

# Optional: Email configuration for magic links
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Optional: OAuth credentials
GOOGLE_CLIENT_ID=your_google_client_id
FACEBOOK_APP_ID=your_facebook_app_id
```

### 3. Start the Server

Development mode (auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The API will run on `http://localhost:5000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register with email/password
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/social` - Social login (Google/Facebook)
- `POST /api/auth/magic-link` - Request magic link
- `GET /api/auth/verify-magic/:token` - Verify magic link
- `GET /api/auth/verify/:token` - Verify email

### Preorders

- `POST /api/preorders` - Create preorder (authenticated)
- `GET /api/preorders` - Get user preorders (authenticated)

### Visitors

- `POST /api/visitors` - Track visitor
- `GET /api/visitors` - Get all visitors (admin)

### Health

- `GET /api/health` - Health check

## Database Schema

### Users Table
- id, name, email, password (hashed), provider, provider_id, email_verified, verification_token, created_at

### Preorders Table
- id, user_id, variant_id, variant_name, price, status, created_at

### Visitors Table
- id, name, email, variant_id, visited_at

### Magic Links Table
- id, email, token, expires_at, used, created_at

## Deployment on Runsite

1. Upload the `server/` folder to your Runsite hosting
2. Set environment variables in Runsite dashboard
3. Run `npm install` in the server directory
4. Start with `npm start`
5. Update frontend API_URL in `src/contexts/AuthContext.tsx` to point to your Runsite backend URL

## Security Notes

- Change `JWT_SECRET` in production
- Use strong email passwords (app passwords for Gmail)
- Enable email verification in production
- Implement rate limiting for production
- Add CORS whitelist for production domains

## Frontend Integration

The frontend is already integrated with:
- `src/contexts/AuthContext.tsx` - Authentication state management
- `src/components/AuthModal.tsx` - Login/signup modal
- `src/sections/Preorder.tsx` - Preorder with auth

## Testing

Test the API:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "NEXUS API is running"
}