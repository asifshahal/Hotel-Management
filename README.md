# LuxeStay Hotel Management System

A fully functional hotel management web application built with **React + Node.js/Express + Supabase (PostgreSQL)**.

## Features

- 🔐 JWT Authentication
- 📊 Dashboard with live KPIs and charts (Recharts)
- 🏨 Room Management (grid/list view, CRUD)
- 📅 Bookings with auto-price calculation and availability check
- 👥 Guest directory
- 👔 Staff management
- 📈 Reports & Analytics
- ⚙️ Settings & password management

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite, react-router-dom, Axios, Recharts |
| Backend | Node.js, Express, JWT, bcryptjs |
| Database | Supabase (PostgreSQL) |

## Setup

### 1. Supabase Tables

Run the SQL in `hotel-backend/supabase-schema.sql` in your Supabase SQL Editor.

### 2. Backend

```bash
cd hotel-backend
npm install
cp .env.example .env
# Fill in your SUPABASE_URL and SUPABASE_KEY in .env
node server.js
# → http://localhost:5000
```

### 3. Frontend

```bash
cd hotel-frontend
npm install
npm run dev
# → http://localhost:5173
```

### 4. First Login

Register an admin via the API or use the default seeded credentials:
- **Username**: `admin`
- **Password**: `admin123`

## Project Structure

```
hotel-backend/
├── server.js           # Express entry point
├── db.js               # Supabase client
├── .env.example        # Config template
├── middleware/auth.js  # JWT middleware
└── routes/             # auth, rooms, bookings, guests, staff, dashboard

hotel-frontend/
├── src/
│   ├── api/            # Axios + JWT interceptor
│   ├── context/        # AuthContext
│   ├── components/     # Sidebar, Header, Modal, Badge
│   └── pages/          # Dashboard, Rooms, Bookings, Guests, Staff, Reports, Settings
└── index.css           # Dark navy/gold design system
```
