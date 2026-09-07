# Inventory & Order Management System (IOMS) - Backend

A complete RESTful backend API for an Inventory & Order Management System (IOMS).

This system provides authentication, role-based authorization, category management, product management, order management, payment integration, validation, pagination, searching, sorting, and secure database operations.

---

## 🚀 Live API

Production API:

https://YOUR-LIVE-API-URL.com

> Replace the URL above with your actual deployed backend URL.

---

## 📌 Features

### Authentication & Authorization
- User registration
- User login
- Email verification with OTP
- Forgot password
- Reset password with OTP
- Google authentication
- JWT-based authentication
- HTTP-only cookie authentication
- Role-based authorization

### User Management
- Get all users
- Get user details
- Update user information
- Update user role
- Update user status
- Search and pagination

### Category Management
- Create category
- Get all categories
- Get single category
- Update category
- Delete category
- Search
- Pagination
- Sorting

### Product Management
- Create product
- Update product
- Delete product
- Get single product
- Get all products
- Product search
- Filter by category
- Price filtering
- Pagination
- Sorting
- Cloudinary image upload

### Order Management
- Create order
- Get customer's own orders
- Get all orders
- Get single order
- Search orders
- Filter orders by status
- Pagination
- Sorting
- Update order status
- Cancel order
- Restore stock after cancellation
- Transaction-based order creation

### Payment
- bKash Sandbox payment integration
- Create bKash payment
- Execute bKash payment
- bKash callback handling
- Payment status tracking
- Payment history
- Customer payment history
- Admin/Manager payment management
- Payment filtering
- Payment pagination
- Payment sorting

### Validation
- Zod request validation
- Body validation
- Query validation
- Params validation
- Password validation
- Email validation
- OTP validation
- Product validation
- Order validation
- Payment validation

---

# 🛠️ Technologies Used

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Prisma ORM
- Redis
- JWT
- bcrypt
- Zod
- Cloudinary
- bKash Payment Gateway
- Nodemailer
- Google OAuth
- Postman

---

# 📁 Project Structure

```text
src/
├── app/
│   ├── config/
│   ├── middleware/
│   ├── module/
│   │   ├── auth/
│   │   ├── user/
│   │   ├── category/
│   │   ├── product/
│   │   ├── order/
│   │   └── payment/
│   │
│   ├── routes/
│   └── validation/
│
├── config/
├── lib/
├── utils/
└── server.ts

prisma/
└── schema.prisma

.env
package.json
tsconfig.json
README.md
