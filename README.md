# Citadel

![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript)
![Node Express](https://img.shields.io/badge/Node.js-Express-green?style=flat-square&logo=node.js)
![PostgreSQL Prisma](https://img.shields.io/badge/PostgreSQL-Prisma-blue?style=flat-square&logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS_v3-38bdf8?style=flat-square&logo=tailwind-css)
![Docker](https://img.shields.io/badge/Docker-Container-2496ed?style=flat-square&logo=docker)
![Vercel](https://img.shields.io/badge/Vercel-Frontend-black?style=flat-square&logo=vercel)
![Render](https://img.shields.io/badge/Render-Backend-46a2f1?style=flat-square&logo=render)
![License MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

Citadel is a comprehensive, self-administered Identity and Access Management (IAM) system modeled directly after AWS IAM. It provides a robust evaluation engine that handles identity policies, group policies, explicit denies, implicit denies, and hard permission boundaries. The entire system is self-administered, meaning the IAM management routes themselves are protected by the same IAM middleware, complete with strict delegation bypass prevention to stop privilege escalation.

## Key Features

- **AWS-Style Policy Evaluation:** Native, declarative JSON policy matching supporting `Effect`, `Action`, and `Resource` (including wildcard `*` matching).
- **Self-Administered IAM Middleware:** Management routes are guarded by the engine itself. Admin actions are validated using active policies.
- **Permission Boundaries:** Restrict the maximum permissions a user can possibly possess, overriding any attached identity or group policies.
- **Interactive Policy Simulator:** Test specific user requests (Action, Resource) in real time to visualize the authorization path, matching statements, and decisions.
- **Audit Logs & Observability:** Real-time logging of user activity, system actions, resources targeted, and policy decisions.
- **User & Group Management:** Standard CRUD operations for managing organizational members, group memberships, and inline or managed policies.

---

## Screenshots

*(Add your screenshots to the `public/screenshots/` folder and they will appear here)*
| Public Landing Page | Admin Dashboard Home |
| :---: | :---: |
| ![Landing Page](./frontend/public/screenshots/landing.png?v=2) | ![Admin Dashboard](./frontend/public/screenshots/admin-dashboard.png) |
| *Modern public tracking and marketing site* | *Manage shipments, team roles, and platform metrics* |

| Policy Simulator | User Details & Policies |
| :---: | :---: |
| ![Policy Simulator](./frontend/public/screenshots/simulator.png) | ![User Details](./frontend/public/screenshots/user-details.png) |
| *Evaluate policies dynamically and trace execution flow* | *Edit inline policies, attach managed policies, and set boundaries* |

---

## Tech Stack

**Frontend:**
- **Language:** TypeScript & JavaScript
- **Framework:** React + Vite
- **Styling:** Tailwind CSS + Framer Motion (for animations)
- **Icons:** Lucide React
- **State Management:** TanStack React Query

**Backend:**
- **Language:** TypeScript & JavaScript
- **Framework:** Node.js / Express
- **Database:** PostgreSQL (Managed via Prisma ORM)
- **Authentication:** JWT (JSON Web Tokens) & bcryptjs
- **Middleware:** Custom AWS-style IAM policy evaluator

**Deployment & DevOps:**
- **Containerization:** Docker & Docker Compose

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL instance running locally or hosted

### 1. Clone & Install
Install dependencies for both the frontend and backend.

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Variables
Create a .env file in the `backend` folder:
```env
# The connection string for your PostgreSQL database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/citadel_iam?schema=public"

# The port the backend server will run on
PORT=5000

# JWT Secrets (minimum 8 characters)
JWT_ACCESS_SECRET="super_secret_access_token_key"
JWT_REFRESH_SECRET="super_secret_refresh_token_key"

# The frontend origin allowed by CORS
FRONTEND_URL="http://localhost:3000"
```

Create a `.env` file in the `frontend` folder:
```env
VITE_API_URL="http://localhost:5000/api"
```

### 3. Database Migration & Seeding
Prepare your database using Prisma:

```bash
cd backend
# Run migrations
npx prisma migrate dev --name init
# Seed database
npm run seed
```

### 4. Run the Development Servers

Open two terminals.

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000` to view the Citadel console!

### 5. Run with Docker Compose (Optional)
If you prefer to run the entire stack automatically inside Docker:

```bash
docker compose up --build -d
```

This will compile and launch:
- **Frontend** on `http://localhost:3000`
- **Backend** on `http://localhost:5000`

---

## Seed Credentials

The `npm run seed` command provisions the following initial users for testing the IAM engine:

| User | Email | Password | Role / Details |
|------|-------|----------|----------------|
| **Root** | `root@org.local` | `root1234` | The absolute admin. Bypasses all IAM checks. |
| **Alice** | `alice@org.local` | `alice1234` | Member of `Viewers` group (ReadOnlyAccess). |
| **Bob** | `bob@org.local` | `bob1234` | Standard user with no initial permissions. |
| **Charlie**| `charlie@org.local`| `charlie1234`| Standard user with no initial permissions. |

## License
This project is licensed under the MIT License.
