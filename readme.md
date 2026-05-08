# Homestay Reservation System

A full-stack web application for managing and booking homestay accommodations. The system provides a seamless experience for guests to search and book rooms, and a comprehensive admin panel for property owners to manage listings, reservations, and operational data.

---

## Overview

This project was built to simulate a real-world property management platform. It covers the complete reservation lifecycle — from room browsing and availability checking, to booking confirmation and payment status management. The architecture follows a microservices pattern, separating concerns across independent services to improve scalability and maintainability.

---

## System Architecture

The backend is structured as a set of independent microservices, each responsible for a specific domain. Services communicate via REST APIs and are containerized using Docker.

### Auth Service
Handles all authentication and authorization logic for both guests and administrators.

- User registration and login (JWT-based authentication)
- Password hashing with Bcrypt
- Admin account management
- Tech Stack: Node.js, Express.js, Prisma ORM, PostgreSQL

### Room Service
Manages the room inventory, including room details, availability, and search filtering.

- CRUD operations for room listings
- Real-time availability filtering by date range and guest count
- Markdown-supported room descriptions
- Multi-image upload support
- Soft delete to preserve booking history integrity
- Tech Stack: .NET 8, Entity Framework Core, PostgreSQL, JWT Authentication

### Booking Service
Handles the reservation workflow and payment status tracking.

- Booking creation with overlap prevention logic
- Booking status management (pending, confirmed, cancelled)
- Payment status tracking
- Inter-service communication with Auth Service and Room Service
- Tech Stack: Node.js, Express.js, Prisma ORM, PostgreSQL

---

## Key Features

### Guest-Facing Features

- Smart search with date range picker and guest count filter
- Room listing with real-time availability status
- Room detail pages with Markdown-rendered descriptions and image gallery
- Step-by-step booking flow with duplicate booking prevention
- User account registration and login

### Admin Panel Features

- Dashboard with booking summary and key metrics
- Full room management (create, edit, delete listings)
- Booking management with status updates
- Dynamic room editor with multi-image support

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Vite, TypeScript |
| Styling | Tailwind CSS, Framer Motion |
| Auth Service | Node.js, Express.js, Prisma ORM |
| Room Service | .NET 8, Entity Framework Core |
| Booking Service | Node.js, Express.js, Prisma ORM |
| Database | PostgreSQL |
| Security | JWT, Bcrypt |
| Containerization | Docker, Docker Compose |

---

## Project Structure

```
homestay-reserve/
├── front-end/          # React + Vite frontend application
├── microservice/
│   ├── auth_service/   # Node.js authentication service
│   ├── room_service/   # .NET 8 room management service
│   └── booking_service/# Node.js booking service
└── docker-compose.yml  # Container orchestration
```

---

## Screenshots

### Homepage and Search
![Homepage](./image/home.png)

<video src="https://github.com/user-attachments/assets/fc5cc73c-9a73-47ab-9fb5-b565384ae7cb" width="100%" controls></video>

### Room Listing and Room Detail

| Room Listing | Room Detail |
| :---: | :---: |
| <video src="https://github.com/user-attachments/assets/25df8125-483d-4bd7-a6c9-6866b00d5505" width="100%" controls></video> | <video src="https://github.com/user-attachments/assets/a93868da-bc5a-4019-b391-f34f5105c6d8" width="100%" controls></video> |

### Booking Flow
<video src="https://github.com/user-attachments/assets/2b7a9c2c-ab28-4f5c-b6b5-b6a79828bc0d" width="100%" controls></video>

### Admin Dashboard
![Admin Dashboard](./image/adminDashboard.png)

### Room Management

| Room List | Room Editor |
| :---: | :---: |
| ![Manage Room](./image/manageroom.png) | ![Edit Room](./image/editroom.png) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- .NET 8 SDK
- Docker and Docker Compose
- PostgreSQL

### Running with Docker

```bash
cd microservice
docker compose up --build
```

### Running Locally

```bash
# Frontend
cd front-end && npm install && npm run dev

# Auth Service
cd microservice/auth_service && npm install && npm run dev

# Room Service
cd microservice/room_service && dotnet run

# Booking Service
cd microservice/booking_service && npm install && npm run dev
```

> For environment variable configuration, refer to the `.env` files located within each service directory.
