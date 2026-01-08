# Mobile Store Inventory Management System

## Overview
A full-stack inventory management system for a mobile store, featuring Admin and Employee roles, stock tracking, approvals, and analytics.

## Tech Stack
- **Frontend**: React (Vite), Vanilla CSS, Recharts, Lucide React
- **Backend**: Node.js, Express, Sequelize, SQLite

## Setup Instructions

### 1. Backend
```bash
cd server
npm install
node index.js
```
The server runs on port 3001. A default Admin user is created:
- Email: `admin@store.com`
- Password: `admin123`

### 2. Frontend
```bash
cd client
npm install
npm run dev
```
The client runs on port 5173. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Features
- **Dashboard**: Real-time stock stats and charts.
- **Products**: Manage inventory, add new phones, view stock status.
- **Categories**: Organize products.
- **Stock Management**: 
  - Admin: Direct Stock In/Out.
  - Employee: Request Stock In/Out.
- **Approvals**: Admin processes employee requests.
- **Roles**: Admin (Full Access), Employee (Restricted).
