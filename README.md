# Full-Stack Restaurant App MVP

A complete full-stack restaurant ordering and table reservation mobile application built with React Native (Expo), Node.js, Express, and MongoDB Atlas.

---

## 🎥 Project Demo Video

- 📁 **Repository Video File:** [Watch Restaurant Demo Video](./docs/Restaurant.mp4)
- 🔗 **Google Drive Mirror:** [View on Google Drive](https://drive.google.com/file/d/1xkk86PS3qXxEfK0faAmlgvnWo9jEAtOC/view?usp=sharing)

---

## ✨ Features

- **Authentication & Roles:** JWT-based login/register with secure bcrypt hashing for `customer` and `manager` roles.
- **Menu Management:** Category filters, dynamic search, and pull-to-refresh connected directly to MongoDB.
- **Cart & Order Processing:** Secure price calculations on the backend and real-time order placement.
- **Order Tracking:** 10-second polling interval updating status live (`Pending` ➔ `Preparing` ➔ `Ready` ➔ `Served`).
- **Table Reservations:** Instant conflict checking to prevent double-booking and table capacity validation.
- **Manager Dashboard:** Live menu item price updates, availability toggles, order status progression, and reservation acceptance/decline.

---

## 📁 Repository Structure

```text
restaurant-app/
├── myapp/                 # React Native (Expo) Frontend
│   ├── src/
│   │   ├── api/          # API Client & Network Configuration
│   │   ├── context/      # Auth, Cart, Theme Contexts
│   │   ├── hooks/        # useApi Hook
│   │   └── screens/      # All UI Screens
│   └── App.js
├── server/                # Node.js & Express REST Backend
│   ├── config/           # Database Connection (MongoDB Atlas)
│   ├── controllers/      # Auth, Menu, Order, Reservation Controllers
│   ├── middleware/       # Auth Protection Middleware
│   ├── models/           # Mongoose Schemas
│   ├── routes/           # API Route Definitions
│   ├── seed.js           # Database Seed Script
│   └── server.js         # Entry Point
├── docs/                  # Media & Demo Files
│   └── Restaurant.mp4
└── README.md