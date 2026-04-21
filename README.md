# Stockwise — Inventory Management Frontend

A production-ready inventory management system built with React, TypeScript, and Vite.
Role-based access (ADMIN / STAFF), JWT authentication, real-time stock management, and a polished UI.

---

## Tech Stack

| Layer | Library |
|---|---|
| UI Framework | React 18 |
| Language | TypeScript |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3 |
| Routing | React Router DOM 6 |
| HTTP Client | Axios |
| Forms | React Hook Form + Zod |
| Auth State | React Context API |
| Notifications | React Hot Toast |
| Icons | Lucide React |

---

## Project Structure

```
src/
 ├── components/
 │    ├── Navbar.tsx           # Top navigation bar with logout
 │    ├── ProtectedRoute.tsx   # Route guard for authenticated pages
 │    ├── Loader.tsx           # Spinner component (sm/md/lg)
 │    ├── EmptyState.tsx       # Empty inventory placeholder
 │    ├── InventoryTable.tsx   # Responsive table + mobile cards
 │    ├── CreateItemModal.tsx  # Modal: create new inventory item
 │    ├── StockModal.tsx       # Modal: stock-in / stock-out
 │    └── ConfirmDialog.tsx    # Confirmation dialog before stock-out
 │
 ├── pages/
 │    ├── Login.tsx            # /login — sign in page
 │    ├── Register.tsx         # /register — sign up page
 │    └── Dashboard.tsx        # /dashboard — main inventory view
 │
 ├── context/
 │    └── AuthContext.tsx      # Auth state, login/logout, JWT decode
 │
 ├── services/
 │    ├── api.ts               # Axios instance with interceptors
 │    └── inventoryService.ts  # Inventory API calls
 │
 ├── hooks/
 │    └── useAuth.ts           # Auth context consumer hook
 │
 ├── types/
 │    ├── auth.ts              # Auth TypeScript interfaces
 │    └── inventory.ts         # Inventory TypeScript interfaces
 │
 ├── utils/
 │    └── stockStatus.ts       # Stock status logic + badge config
 │
 ├── App.tsx                   # Root component, routes, toaster
 ├── main.tsx                  # React DOM entry point
 └── index.css                 # Tailwind + global styles
```

---

## Prerequisites

- Node.js >= 18.x
- npm >= 9.x (or pnpm / yarn)
- A running backend API at `http://localhost:5000`

---

## Setup & Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd inventory-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

### 4. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server on port 3000 |
| `npm run build` | TypeScript compile + Vite production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:5000` | Base URL for the backend API |

---

## Expected API Response Formats

### `POST /auth/register`
**Request:**
```json
{ "email": "user@example.com", "password": "Pass@1234", "role": "ADMIN" }
```
**Response (201):**
```json
{ "message": "User created successfully" }
```
**Error (409):**
```json
{ "message": "Email already exists" }
```

---

### `POST /auth/login`
**Request:**
```json
{ "email": "user@example.com", "password": "Pass@1234" }
```
**Response (200):**
```json
{ "token": "eyJhbGci...", "role": "ADMIN", "email": "user@example.com" }
```
**Error (401):**
```json
{ "message": "Invalid credentials" }
```

---

### `GET /inventory/items`
**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "id": "abc123",
    "name": "Wireless Mouse",
    "quantity": 15,
    "createdAt": "2024-01-10T10:00:00.000Z",
    "updatedAt": "2024-01-15T14:30:00.000Z"
  }
]
```

---

### `POST /inventory/items`
**Request:** `{ "name": "Wireless Mouse", "quantity": 15 }`

**Response (201):** Returns the created `InventoryItem` object.

---

### `POST /inventory/items/:id/stock-in`
**Request:** `{ "quantity": 5 }`

**Response (200):** Returns the updated `InventoryItem` object.

---

### `POST /inventory/items/:id/stock-out`
**Request:** `{ "quantity": 3 }`

**Response (200):** Returns the updated `InventoryItem` object.

**Error (400):** `{ "message": "Insufficient stock" }`

---

## Features

### Authentication
- Register with email, password (strength checked), and role selection (ADMIN/STAFF)
- Login with JWT token stored in localStorage
- Automatic session restore on page refresh
- JWT expiry detection — auto-logout when token expires
- 401 interception globally in Axios — redirects to `/login`

### Dashboard
- Inventory table with responsive mobile card view
- Live stock status badges: In Stock (green) / Low Stock (yellow) / Out of Stock (red)
- Summary stats: total items, total units, items needing attention
- Empty state with illustration when no items exist
- Error state with retry button when API fails

### ADMIN Features
- Create new inventory items via modal
- Add Stock (stock-in) with quantity validation
- Use Stock (stock-out) with confirmation dialog and stock limit enforcement
- Immediate UI update after every action (no page reload)

### STAFF Features
- Read-only inventory view
- All action buttons hidden

---

## How to Run the Project

1. Start your backend API on port 5000 (or update `VITE_API_BASE_URL`)
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start the frontend
4. Navigate to `http://localhost:3000`
5. Register an account, then log in
6. ADMIN accounts can create items and manage stock; STAFF accounts can view only
