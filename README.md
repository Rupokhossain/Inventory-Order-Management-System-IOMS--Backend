

# Inventory & Order Management System (IOMS) - Backend

## 🚀 Live API

Production API:
> **https://inventory-order-management-system-b-zeta.vercel.app/**

---

## 📌 Features

### Authentication & Authorization
*   User registration
*   User login
*   Email verification with OTP
*   Forgot password
*   Reset password with OTP
*   Google authentication
*   JWT-based authentication
*   HTTP-only cookie authentication
*   Role-based authorization

### User Management
*   Get all users
*   Get user details
*   Update user information
*   Update user role
*   Update user status
*   Search and pagination

### Category Management
*   Create category
*   Get all categories
*   Get single category
*   Update category
*   Delete category
*   Search
*   Pagination
*   Sorting

### Product Management
*   Create product
*   Update product
*   Delete product
*   Get single product
*   Get all products
*   Product search
*   Filter by category
*   Price filtering
*   Pagination
*   Sorting
*   Cloudinary image upload

### Order Management
*   Create order
*   Get customer's own orders
*   Get all orders
*   Get single order
*   Search orders
*   Filter orders by status
*   Pagination
*   Sorting
*   Update order status
*   Cancel order
*   Restore stock after cancellation
*   Transaction-based order creation

### Payment
*   bKash Sandbox payment integration
*   Create bKash payment
*   Execute bKash payment
*   bKash callback handling
*   Payment status tracking
*   Payment history
*   Customer payment history
*   Admin/Manager payment management
*   Payment filtering
*   Payment pagination
*   Payment sorting

### Validation
*   Zod request validation
*   Body validation
*   Query validation
*   Params validation
*   Password validation
*   Email validation
*   OTP validation
*   Product validation
*   Order validation
*   Payment validation

---

## 🛠️ Technologies Used

*   Node.js
*   Express.js
*   TypeScript
*   PostgreSQL
*   Prisma ORM
*   Redis
*   JWT
*   bcrypt
*   Zod
*   Cloudinary
*   bKash Payment Gateway
*   Nodemailer
*   Google OAuth
*   Postman

---

## 📁 Project Structure

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
```

---

## 🔐 Authentication

The API uses JWT-based authentication. Authentication tokens are stored securely using HTTP-only cookies. Protected routes require authentication and appropriate user roles.

### Available Roles
*   ADMIN
*   MANAGER
*   CUSTOMER

### Role Permissions

| Permission | ADMIN | MANAGER | CUSTOMER |
| :--- | :---: | :---: | :---: |
| Full system access | ✅ | | |
| User management | ✅ | | |
| Category management | ✅ | ✅ | |
| Product management | ✅ | ✅ | |
| Order management | ✅ | ✅ | ✅ (Own) |
| Payment management | ✅ | ✅ | ✅ (Own) |
| Browse/Create orders | ✅ | ✅ | ✅ |

---

## 🔑 Demo Credentials

> **Important:** Replace these values with your actual demo credentials before submission.

**Admin**
*   **Email:** `rh.siam999@gmail.com`
*   **Password:** `siam11**##@@!!11A`

**Manager**
*   **Email:** `N/A`
*   **Password:** `N/A`

**Customer**
*   **Email:** `siam121483@gmail.com`
*   **Password:** `siam11**##@@AA`

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory and add the following variables.

```env
NODE_ENV=development
PORT=5000

DATABASE_URL="YOUR_POSTGRESQL_DATABASE_URL"

JWT_ACCESS_SECRET="YOUR_ACCESS_SECRET"
JWT_ACCESS_EXPIRES_IN="YOUR_ACCESS_EXPIRES_IN"

JWT_REFRESH_SECRET="YOUR_REFRESH_SECRET"
JWT_REFRESH_EXPIRES_IN="YOUR_REFRESH_EXPIRES_IN"

REDIS_URL="YOUR_REDIS_URL"

GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"
GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"

SMTP_HOST="YOUR_SMTP_HOST"
SMTP_PORT=587
SMTP_USER="YOUR_SMTP_USER"
SMTP_PASS="YOUR_SMTP_PASSWORD"

CLOUDINARY_CLOUD_NAME="YOUR_CLOUDINARY_CLOUD_NAME"
CLOUDINARY_API_KEY="YOUR_CLOUDINARY_API_KEY"
CLOUDINARY_API_SECRET="YOUR_CLOUDINARY_API_SECRET"

BKASH_BASE_URL="https://tokenized.sandbox.bka.sh/v1.2.0-beta"
BKASH_USERNAME="YOUR_BKASH_USERNAME"
BKASH_PASSWORD="YOUR_BKASH_PASSWORD"
BKASH_APP_KEY="YOUR_BKASH_APP_KEY"
BKASH_APP_SECRET="YOUR_BKASH_APP_SECRET"

BKASH_CALLBACK_URL="http://localhost:5000/api/v1/payments/bkash/callback"
```

> **⚠️ Never commit your .env file to GitHub.**

---

## 🚀 Installation

1.  **Clone the repository:**
    ```bash
    git clone YOUR_GITHUB_REPOSITORY_URL
    ```

2.  **Go to the project directory:**
    ```bash
    cd inventory-order-management-system-backend
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Generate Prisma Client:**
    ```bash
    npx prisma generate
    ```

5.  **Run database migration:**
    ```bash
    npx prisma migrate dev
    ```

6.  **Start development server:**
    ```bash
    npm run dev
    ```

The server will run on: `http://localhost:5000`

---

## 📡 API Base URL

All API routes use the following base URL:

```text
/api/v1
```

**Local Development URL:**
```text
http://localhost:5000/api/v1
```

---

## 🔗 Main API Endpoints

### Authentication
| Method | Endpoint | Access |
| :--- | :--- | :--- |
| POST | `/auth/register` | Public |
| POST | `/auth/login` | Public |
| POST | `/auth/verify-email` | Public |
| POST | `/auth/forgot-password` | Public |
| POST | `/auth/reset-password` | Public |
| GET | `/auth/google` | Public |

### Users
| Method | Endpoint | Access |
| :--- | :--- | :--- |
| GET | `/users` | Admin |
| GET | `/users/:id` | Admin / Manager |
| PATCH | `/users/:id` | Authorized User |
| PATCH | `/users/:id/role` | Admin |
| PATCH | `/users/:id/status` | Admin |

### Categories
| Method | Endpoint | Access |
| :--- | :--- | :--- |
| POST | `/categories` | Admin / Manager |
| GET | `/categories` | Public |
| GET | `/categories/:id` | Public |
| PATCH | `/categories/:id` | Admin / Manager |
| DELETE | `/categories/:id` | Admin / Manager |

### Products
| Method | Endpoint | Access |
| :--- | :--- | :--- |
| POST | `/products` | Admin / Manager |
| GET | `/products` | Public |
| GET | `/products/:id` | Public |
| PATCH | `/products/:id` | Admin / Manager |
| DELETE | `/products/:id` | Admin / Manager |

**Product Query Example:**
```text
/products?searchTerm=iphone&page=1&limit=10&sortBy=price&sortOrder=asc
```

### Orders
| Method | Endpoint | Access |
| :--- | :--- | :--- |
| POST | `/orders` | Customer |
| GET | `/orders/my-orders` | Customer |
| GET | `/orders` | Admin / Manager |
| GET | `/orders/:orderId` | Authorized |
| PATCH | `/orders/:orderId/status` | Admin / Manager |
| PATCH | `/orders/:orderId/cancel` | Customer |

**Order Query Example:**
```text
/orders?status=PENDING&page=1&limit=10&sortBy=createdAt&sortOrder=desc
```

---

## 💳 Payment API

The project uses the **bKash Sandbox** payment gateway.

### Create bKash Payment
`POST /payments/tokenized/checkout/create/:orderId`

*   **Example:** `POST /api/v1/payments/tokenized/checkout/create/a4883c6c-13a5-49ca-a3ec-227a2f056387`
*   **Access:** CUSTOMER

### Execute bKash Payment
`POST /payments/bkash/execute`

*   **Request body:**
    ```json
    {
      "paymentID": "YOUR_BKASH_PAYMENT_ID"
    }
    ```

### bKash Callback
`GET /payments/bkash/callback`
*   This endpoint is called automatically during the bKash payment flow.

### My Payments
`GET /payments/my-payments`
*   Customer can view their own payment history.
*   **Example:** `/payments/my-payments?page=1&limit=10`

### All Payments
`GET /payments`
*   **Access:** ADMIN, MANAGER
*   **Example:** `/payments?status=PAID&paymentGateway=BKASH&page=1&limit=10`

### Single Payment
`GET /payments/:paymentId`
*   **Example:** `/payments/b72338fd-dcca-4fc0-96af-6e9669a06ed7`

---

## 📊 Pagination

The API supports pagination using query parameters to improve performance and user experience.

*   **Parameters:** `page`, `limit`
*   **Example:** `/products?page=1&limit=10`

**Response metadata example:**
```json
{
  "page": 1,
  "limit": 10,
  "total": 20,
  "totalPages": 2
}
```

---

## 🔎 Searching

The API supports searching on major entities using keywords.

*   **Parameter:** `searchTerm`
*   **Example:** `/products?searchTerm=iphone`

---

## ↕️ Sorting

Results can be sorted based on specific fields in ascending or descending order.

*   **Parameters:** `sortBy`, `sortOrder` (values: `asc`, `desc`)
*   **Example:** `/products?sortBy=price&sortOrder=asc`

---

## 🛡️ Validation

The project uses **Zod** for robust server-side request validation to ensure data integrity.

Validation covers:
*   Request body, params, and query parameters
*   Authentication (Password, Email)
*   Business logic (Products, Categories, Orders, Payments)

Invalid requests return a `400 Bad Request` error with details.

**Error Response Example:**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Password must contain at least one uppercase letter.",
  "errors": []
}
```

---

## ❌ Error Response Format

All errors follow a consistent JSON structure:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error message",
  "errors": [
    // Specific validation errors or details
  ]
}
```

---

## ✅ Success Response Format

Successful operations follow a consistent JSON structure:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation successful",
  "data": {
    // The actual response payload
  }
}
```

---

## 💰 Order & Payment Flow

The system follows a strict transactional workflow for orders and payments:

Customer creates order $\to$ Order Status = PENDING $\to$ Create bKash Payment $\to$ Redirect to bKash $\to$ Customer completes payment $\to$ bKash Callback $\to$ Execute Payment $\to$ Payment Status = PAID $\to$ **Order Status = CONFIRMED**

---

## 🗄️ Database

*   **Database:** PostgreSQL
*   **ORM:** Prisma ORM

**Main entities:**
*   User
*   Category
*   Product
*   Order
*   OrderItem
*   Payment

Indexes are implemented for optimized querying on frequently accessed fields (e.g., `customerId`, `orderId`, `status`, `createdAt`).

---

## 🔄 Order Status Flow

Orders follow a predefined lifecycle:

`PENDING` $\to$ `CONFIRMED` $\to$ `PROCESSING` $\to$ `SHIPPED` $\to$ `DELIVERED`

**Cancellation:**
`PENDING` $\to$ `CANCELLED`
*(Note: When an order is cancelled, the purchased product stock is automatically restored).*

---

## 💳 Payment Status

**Available payment statuses:**
*   PENDING
*   PAID
*   FAILED
*   REFUNDED

**Supported Payment Gateways:**
*   BKASH (Current implementation uses Sandbox)
*   STRIPE
*   SSLCOMMERZ
*   CASH_ON_DELIVERY

---

## 🧪 Testing

The API is designed to be tested using Postman.

**Recommended testing order:**
1. Register
2. Verify Email
3. Login
4. Create Category
5. Create Product
6. Get Products
7. Create Order
8. Get My Orders
9. Create bKash Payment
10. Complete bKash Payment (Sandbox)
11. Verify Payment Status
12. Verify Order Status (Automatically updated)
13. Get My Payments
14. Admin Payment Management
15. Test Validation Rules
16. Test Role Authorization (Access control)

### 📮 Postman Collection
A Postman collection is included in the repository for easy API testing. Import it into Postman and set your environment variables (`baseUrl`, `accessToken`).

**Example BaseUrl:** `http://localhost:5000/api/v1`

---

## 🔒 Security

The backend implements industry-standard security best practices:
*   JWT-based authentication
*   Secure storage of tokens in HTTP-only cookies
*   Password hashing using bcrypt
*   Role-based access control (RBAC)
*   Input validation using Zod
*   Protected routes for Admin, Manager, and Customer
*   Ownership validation to prevent unauthorized access to data
*   Environment variables to protect sensitive credentials

---

## 🚀 Deployment

The backend can be easily deployed to various cloud platforms that support Node.js, such as:
*   Vercel
*   Render
*   Railway
*   Heroku

Ensure all environment variables are correctly set in the production environment configuration.

---

## 👨‍💻 Developer

**Siam Ahmed**
Frontend / Backend Developer

*   GitHub: [YOUR_GITHUB_PROFILE](https://github.com/Rupokhossain)
*   LinkedIn: [YOUR_LINKEDIN_PROFILE](https://www.linkedin.com/in/siam-ahmed-dev/)

---

## 📄 License

This project was developed for educational and assignment purposes.
```
