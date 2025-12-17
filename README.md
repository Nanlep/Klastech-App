# Klastech - Enterprise Web3 Banking Infrastructure

Klastech is a production-grade, white-label core banking and crypto-payment infrastructure designed for high-volume financial operations. It features a React 19 frontend and a robust NestJS backend with a double-entry ledger system.

## 🏗 Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS
- **State Management**: React Hooks & Context
- **AI Integration**: Google Gemini API (via `@google/genai`)
- **Charts**: Recharts

### Backend
- **Framework**: NestJS
- **Database**: PostgreSQL 15
- **ORM**: Prisma
- **Security**: Argon2, Passport, JWT
- **Architecture**: Modular Monolith (Wallet, Trade, P2P, Admin modules)

---

## 🚀 Local Development Setup

### 1. Prerequisites
- Node.js (v18+)
- Docker & Docker Compose
- PostgreSQL (if not using Docker)

### 2. Installation

**Frontend:**
```bash
# Install frontend dependencies
npm install
```

**Backend:**
```bash
cd backend
npm install
cd ..
```

### 3. Database Setup

You can run the database using the provided Docker Compose file.

```bash
cd backend
docker-compose up -d
```

This starts:
- PostgreSQL on port `5432`
- Redis on port `6379`

**Run Migrations:**
Initialize the database schema using Prisma.

```bash
cd backend
npx prisma db push
npx prisma generate
```

### 4. Environment Configuration

**Frontend (.env):**
Create a `.env` file in the root directory.
```env
# Required for AI Chat & Advisory features
API_KEY=your_google_gemini_api_key
```

**Backend (backend/.env):**
Create a `.env` file in the `backend/` directory.
```env
DATABASE_URL="postgresql://klastech_admin:secure_password_123@localhost:5432/klastech_ledger?schema=public"
JWT_SECRET="super_secret_jwt_key_change_in_production"
PORT=3001
```

### 5. Running the Application

**Start Backend:**
```bash
cd backend
npm run start:dev
# API will run at http://localhost:3001/api/v1
# Swagger Docs at http://localhost:3001/docs
```

**Start Frontend:**
Open a new terminal.
```bash
npm run dev
# App will run at http://localhost:5173 (or similar)
```

---

## 🔌 Connecting Frontend to Live Backend

By default, the frontend uses a **Mock Mode** for demonstration purposes. To connect it to the running NestJS backend:

1. Open `services/api.ts`.
2. Change the flag:
   ```typescript
   const USE_LIVE_BACKEND = true;
   ```
3. Ensure `API_URL` points to your backend instance (default: `http://localhost:3001/api/v1`).

---

## ☁️ Production Deployment

### Phase 1: Database
1. Provision a managed PostgreSQL instance (AWS RDS, Neon, Supabase, or Railway).
2. Get the connection string.
3. Run migrations from your local machine or CI/CD pipeline:
   ```bash
   DATABASE_URL="your_production_db_url" npx prisma db push
   ```

### Phase 2: Backend (Node.js)
1. Deploy the `backend/` folder to a Node.js hosting provider (Render, Railway, AWS App Runner, Heroku).
2. Set Environment Variables in your dashboard:
   - `DATABASE_URL`: Your production DB string.
   - `JWT_SECRET`: A long, random string.
   - `PORT`: 3000 (or platform specific).
   - `NODE_ENV`: production

### Phase 3: Frontend (Static)
1. Build the frontend:
   ```bash
   npm run build
   ```
2. Deploy the `dist/` folder to a static host (Vercel, Netlify, AWS S3+CloudFront).
3. **Important**: Ensure `services/api.ts` in your production build points to your **Production Backend URL**.

---

## 🛡 Security & Compliance Notes

1. **Double-Entry Ledger**: The backend implements an atomic transaction model. Never bypass the `WalletService` for fund movements.
2. **ISO 27001**: The `privacyMode` in the frontend and strict RBAC in the backend `admin.guard.ts` are designed for compliance.
3. **Secret Management**: Never commit `.env` files. Use proper secret management (AWS Secrets Manager, Doppler) in production.
4. **Audit Logs**: The `LedgerEntry` table in the database is the source of truth. It is immutable by design in the application logic.

## 🤝 Support

For enterprise support or white-label licensing, contact the Klastech Engineering Team.
