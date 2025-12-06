<h1>🚗 Car-Station: Vehicle Rental System API</h1>

Live URL : https://car-station.vercel.app/

<h3>🔥 Overview</h3>

Backend API for a vehicle rental platform with secure authentication, role-based access (Admin & Customer), vehicle inventory management, and booking system.

<h3>✨ Features</h3>

* JWT Authentication + bcrypt password hashing

* RBAC: Admin can manage vehicles & bookings; customers can rent vehicles

* Booking System: Availability check + automatic pricing

* Inventory: Vehicle CRUD with protection against deleting booked vehicles

* PostgreSQL Transactions for consistent booking operations

<h3>🛠 Tech Stack</h3>

* Node.js, Express.js, TypeScript

* PostgreSQL (Neon)

* JWT, bcrypt

<h3>🚀 Setup</h3>

Clone & install :
```
npm install
```
Create .env :
```
PORT=5000
JWT_SECRET=your_secret
DB_CONNECTION_STRING=your_postgres_url
```
Run :
```
npm run dev
```
<h3>🔑 Initial Admin Setup</h3>

* Sign up using: POST /api/v1/auth/signup

* Promote the user in the database:
```
UPDATE "Users"
SET role = 'admin'
WHERE email = 'YOUR_EMAIL';
```

* Sign in again to get your admin token.
