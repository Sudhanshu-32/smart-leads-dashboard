# Smart Leads Dashboard

A full-stack Lead Management Dashboard built with the MERN stack and TypeScript.

## Tech Stack

- **Frontend**: React 18, TypeScript, TailwindCSS, React Query, Zustand, Axios
- **Backend**: Node.js, Express.js, TypeScript, MongoDB + Mongoose
- **Auth**: JWT + bcrypt
- **DevOps**: Docker + Docker Compose

## Features

- JWT Authentication with role-based access control (Admin / Sales)
- Full CRUD for leads with status and source tracking
- Advanced filtering: status, source, search (debounced), sort
- Backend pagination with metadata
- CSV export
- Dark mode
- Responsive design

## Quick Start (Docker)

```bash
cp .env.example .env
# Edit JWT_SECRET in .env
docker-compose up --build
```

App runs at http://localhost

## Local Development

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit MONGO_URI and JWT_SECRET
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## API Documentation

### Auth
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | /api/auth/register | Register new user | No |
| POST | /api/auth/login | Login | No |
| GET | /api/auth/me | Get current user | Yes |

### Leads
| Method | Route | Description | Auth | Role |
|--------|-------|-------------|------|------|
| GET | /api/leads | List with filters + pagination | Yes | Any |
| GET | /api/leads/:id | Single lead | Yes | Any |
| POST | /api/leads | Create lead | Yes | Any |
| PUT | /api/leads/:id | Update lead | Yes | Any |
| DELETE | /api/leads/:id | Delete lead | Yes | Admin only |
| GET | /api/leads/export/csv | Export CSV | Yes | Any |

### Query Parameters for GET /api/leads
- `status` - New | Contacted | Qualified | Lost
- `source` - Website | Instagram | Referral
- `search` - text search on name + email
- `sortBy` - latest | oldest
- `page` - page number (default: 1)
- `limit` - items per page (default: 10, max: 50)

### Response Format
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

## Project Structure

```
smart-leads/
├── backend/src/
│   ├── config/db.ts         MongoDB connection
│   ├── models/              Mongoose schemas
│   ├── middleware/          auth, RBAC, validation, error handler
│   ├── controllers/         business logic
│   ├── routes/              route definitions
│   └── types/index.ts       TypeScript interfaces
└── frontend/src/
    ├── api/                 Axios instance + API calls
    ├── components/          Reusable UI components
    ├── hooks/               useLeads, useDebounce
    ├── pages/               LoginPage, RegisterPage, DashboardPage
    ├── store/               Zustand auth store
    └── types/index.ts       TypeScript interfaces
```
