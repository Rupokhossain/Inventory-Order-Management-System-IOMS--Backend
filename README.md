Inventory & Order Management System (IOMS) - Backend
A complete RESTful backend API for an Inventory & Order Management System (IOMS).
This system provides authentication, role-based authorization, category management, product management, order management, payment integration, validation, pagination, searching, sorting, and secure database operations.
🚀 Live API
Production API:
https://YOUR-LIVE-API-URL.com
Replace the URL above with your actual deployed backend URL.
📌 Features
Authentication & Authorization
User registration
User login
Email verification with OTP
Forgot password
Reset password with OTP
Google authentication
JWT-based authentication
HTTP-only cookie authentication
Role-based authorization
User Management
Get all users
Get user details
Update user information
Update user role
Update user status
Search and pagination
Category Management
Create category
Get all categories
Get single category
Update category
Delete category
Search
Pagination
Sorting
Product Management
Create product
Update product
Delete product
Get single product
Get all products
Product search
Filter by category
Price filtering
Pagination
Sorting
Cloudinary image upload
Order Management
Create order
Get customer's own orders
Get all orders
Get single order
Search orders
Filter orders by status
Pagination
Sorting
Update order status
Cancel order
Restore stock after cancellation
Transaction-based order creation
Payment
bKash Sandbox payment integration
Create bKash payment
Execute bKash payment
bKash callback handling
Payment status tracking
Payment history
Customer payment history
Admin/Manager payment management
Payment filtering
Payment pagination
Payment sorting
Validation
Zod request validation
Body validation
Query validation
Params validation
Password validation
Email validation
OTP validation
Product validation
Order validation
Payment validation
🛠️ Technologies Used
Node.js
Express.js
TypeScript
PostgreSQL
Prisma ORM
Redis
JWT
bcrypt
Zod
Cloudinary
bKash Payment Gateway
Nodemailer
Google OAuth
Postman
📁 Project Structure
code
Text
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
🔐 Authentication

The API uses JWT-based authentication.

Authentication tokens are stored securely using HTTP-only cookies.

Protected routes require authentication and appropriate user roles.

Available Roles
ADMIN
MANAGER
CUSTOMER
Role Permissions
ADMIN
Full system access
User management
Category management
Product management
Order management
Payment management
MANAGER
Category management
Product management
Order management
Payment management
CUSTOMER
Register/Login
Browse products
Create orders
View own orders
Cancel own orders
Make payments
View own payments
🔑 Demo Credentials
Admin
Email: YOUR_ADMIN_EMAIL
Password: YOUR_ADMIN_PASSWORD
Manager
Email: YOUR_MANAGER_EMAIL
Password: YOUR_MANAGER_PASSWORD
Customer
Email: YOUR_CUSTOMER_EMAIL
Password: YOUR_CUSTOMER_PASSWORD

Replace these values with your actual demo credentials before submission.

⚙️ Environment Variables

Create a .env file in the root directory.

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

Never commit your .env file to GitHub.

🚀 Installation

Clone the repository:

git clone YOUR_GITHUB_REPOSITORY_URL

Go to the project directory:

cd inventory-order-management-system-backend

Install dependencies:

npm install

Generate Prisma Client:

npx prisma generate

Run database migration:

npx prisma migrate dev

Start development server:

npm run dev

The server will run on:

http://localhost:5000
📡 API Base URL

All API routes use:

/api/v1

Local:

http://localhost:5000/api/v1
🔗 Main API Endpoints
Authentication
Method	Endpoint	Access
POST	/auth/register	Public
POST	/auth/login	Public
POST	/auth/verify-email	Public
POST	/auth/forgot-password	Public
POST	/auth/reset-password	Public
GET	/auth/google	Public
Users
Method	Endpoint	Access
GET	/users	Admin
GET	/users/:id	Admin / Manager
PATCH	/users/:id	Authorized User
PATCH	/users/:id/role	Admin
PATCH	/users/:id/status	Admin
Categories
Method	Endpoint	Access
POST	/categories	Admin / Manager
GET	/categories	Public
GET	/categories/:id	Public
PATCH	/categories/:id	Admin / Manager
DELETE	/categories/:id	Admin / Manager
Products
Method	Endpoint	Access
POST	/products	Admin / Manager
GET	/products	Public
GET	/products/:id	Public
PATCH	/products/:id	Admin / Manager
DELETE	/products/:id	Admin / Manager
Product Query Example
/products?searchTerm=iphone&page=1&limit=10&sortBy=price&sortOrder=asc
Orders
Method	Endpoint	Access
POST	/orders	Customer
GET	/orders/my-orders	Customer
GET	/orders	Admin / Manager
GET	/orders/:orderId	Authorized
PATCH	/orders/:orderId/status	Admin / Manager
PATCH	/orders/:orderId/cancel	Customer
Order Query Example
/orders?status=PENDING&page=1&limit=10&sortBy=createdAt&sortOrder=desc
💳 Payment API

The project uses the bKash Sandbox payment gateway.

Create bKash Payment
POST /payments/tokenized/checkout/create/:orderId

Example:

POST /api/v1/payments/tokenized/checkout/create/a4883c6c-13a5-49ca-a3ec-227a2f056387

Authentication:

CUSTOMER
Execute bKash Payment
POST /payments/bkash/execute

Request body:

{
  "paymentID": "YOUR_BKASH_PAYMENT_ID"
}
bKash Callback
GET /payments/bkash/callback

This endpoint is called during the bKash payment flow.

My Payments
GET /payments/my-payments

Customer can view their own payment history.

Example:

/payments/my-payments?page=1&limit=10
All Payments
GET /payments

Access:

ADMIN
MANAGER

Example:

/payments?status=PAID&paymentGateway=BKASH&page=1&limit=10
Single Payment
GET /payments/:paymentId

Example:

/payments/b72338fd-dcca-4fc0-96af-6e9669a06ed7
📊 Pagination

The API supports pagination using:

page
limit

Example:

/products?page=1&limit=10

Response metadata:

{
  "page": 1,
  "limit": 10,
  "total": 20,
  "totalPages": 2
}
🔎 Searching

Example:

/products?searchTerm=iphone

The API supports search based on relevant product fields.

↕️ Sorting

Example:

/products?sortBy=price&sortOrder=asc

Supported sorting orders:

asc
desc
🛡️ Validation

The project uses Zod for server-side request validation.

Validation is implemented for:

Request body
Request params
Query parameters
Authentication
Products
Categories
Orders
Payments

Invalid requests return a 400 Bad Request response.

Example:

{
  "success": false,
  "statusCode": 400,
  "message": "Password must contain at least one uppercase letter."
}
❌ Error Response Format

The API follows a consistent error response format.

{
  "success": false,
  "statusCode": 400,
  "message": "Something went wrong",
  "errors": []
}
✅ Success Response Format

Successful requests follow a consistent structure:

{
  "success": true,
  "statusCode": 200,
  "message": "Operation successful",
  "data": {}
}
💰 Order & Payment Flow

The main order/payment flow is:

Customer
   ↓
Create Order
   ↓
Order Status = PENDING
   ↓
Create bKash Payment
   ↓
Redirect to bKash
   ↓
Customer Completes Payment
   ↓
bKash Callback
   ↓
Execute Payment
   ↓
Payment Status = PAID
   ↓
Order Status = CONFIRMED
🗄️ Database

The project uses:

PostgreSQL
+
Prisma ORM

Main entities include:

User
Category
Product
Order
OrderItem
Payment

Relationships and constraints are implemented using Prisma.

Indexes are added for frequently queried fields such as:

customerId
order status
createdAt
productId
orderId
payment status
payment gateway
🔄 Order Status Flow

Orders follow a controlled status workflow:

PENDING
   ↓
CONFIRMED
   ↓
PROCESSING
   ↓
SHIPPED
   ↓
DELIVERED

Cancellation:

PENDING
   ↓
CANCELLED

When an order is cancelled, purchased product stock is restored.

💳 Payment Status

Available payment statuses:

PENDING
PAID
FAILED
REFUNDED

Payment gateway:

BKASH
STRIPE
SSLCOMMERZ
CASH_ON_DELIVERY

The current implementation uses:

bKash Sandbox
🧪 Testing

The API can be tested using Postman.

Recommended testing order:

1. Register
2. Verify Email
3. Login
4. Create Category
5. Create Product
6. Get Products
7. Create Order
8. Get My Orders
9. Create bKash Payment
10. Complete bKash Payment
11. Verify Payment
12. Verify Order Status
13. Get My Payments
14. Admin Payment Management
15. Test Validation
16. Test Role Authorization
📮 Postman

A Postman collection is included with the project.

Import the collection into Postman and configure:

baseUrl
accessToken

Example:

baseUrl = http://localhost:5000/api/v1
🔒 Security

The project implements:

JWT authentication
HTTP-only cookies
Password hashing using bcrypt
Role-based authorization
Request validation using Zod
Protected admin/manager/customer routes
Ownership validation
Environment variables for sensitive credentials
🚀 Deployment

The backend can be deployed to platforms such as:

Vercel
Render
Railway
Other Node.js compatible hosting platforms

Make sure the production environment contains all required environment variables.

👨‍💻 Developer

Siam Ahmed

Frontend / Backend Developer

GitHub:

YOUR_GITHUB_PROFILE

LinkedIn:

YOUR_LINKEDIN_PROFILE

📄 License

This project was developed for educational and assignment purposes.


### README-te অবশ্যই এই 4টা change korba

```text
YOUR-LIVE-API-URL
YOUR_GITHUB_REPOSITORY_URL
YOUR_GITHUB_PROFILE
YOUR_LINKEDIN_PROFILE....akta file a likhe dao just copy paste korbo
Model 5:40 PM
অবশ্যই, নিচের লিঙ্কগুলো আপনার প্রোজেক্টের সঠিক তথ্য দিয়ে প্রতিস্থাপন করে নিন। আমি শুধুমাত্র আপনার দেওয়া তথ্যের ভিত্তিতে README.md ফাইলটি তৈরি করে দিচ্ছি।
এখানে আপনার প্রয়োজনীয় ফাইলটি দেওয়া হলো:
README.md
code
Markdown
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
🔐 Authentication
The API uses JWT-based authentication.
Authentication tokens are stored securely using HTTP-only cookies.
Protected routes require authentication and appropriate user roles.
Available Roles
ADMIN
MANAGER
CUSTOMER
Role Permissions
ADMIN
Full system access
User management
Category management
Product management
Order management
Payment management
MANAGER
Category management
Product management
Order management
Payment management
CUSTOMER
Register/Login
Browse products
Create orders
View own orders
Cancel own orders
Make payments
View own payments
🔑 Demo Credentials
Admin
Email: YOUR_ADMIN_EMAIL
Password: YOUR_ADMIN_PASSWORD
Manager
Email: YOUR_MANAGER_EMAIL
Password: YOUR_MANAGER_PASSWORD
Customer
Email: YOUR_CUSTOMER_EMAIL
Password: YOUR_CUSTOMER_PASSWORD
Replace these values with your actual demo credentials before submission.
⚙️ Environment Variables
Create a .env file in the root directory.
code
Env
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
Never commit your .env file to GitHub.
🚀 Installation
Clone the repository:
code
Bash
git clone YOUR_GITHUB_REPOSITORY_URL
Go to the project directory:
code
Bash
cd inventory-order-management-system-backend
Install dependencies:
code
Bash
npm install
Generate Prisma Client:
code
Bash
npx prisma generate
Run database migration:
code
Bash
npx prisma migrate dev
Start development server:
code
Bash
npm run dev
The server will run on: http://localhost:5000
📡 API Base URL
All API routes use:
code
Text
/api/v1
Local:
code
Text
http://localhost:5000/api/v1
🔗 Main API Endpoints
Authentication
Method	Endpoint	Access
POST	/auth/register	Public
POST	/auth/login	Public
POST	/auth/verify-email	Public
POST	/auth/forgot-password	Public
POST	/auth/reset-password	Public
GET	/auth/google	Public
Users
Method	Endpoint	Access
GET	/users	Admin
GET	/users/:id	Admin / Manager
PATCH	/users/:id	Authorized User
PATCH	/users/:id/role	Admin
PATCH	/users/:id/status	Admin
Categories
Method	Endpoint	Access
POST	/categories	Admin / Manager
GET	/categories	Public
GET	/categories/:id	Public
PATCH	/categories/:id	Admin / Manager
DELETE	/categories/:id	Admin / Manager
Products
Method	Endpoint	Access
POST	/products	Admin / Manager
GET	/products	Public
GET	/products/:id	Public
PATCH	/products/:id	Admin / Manager
DELETE	/products/:id	Admin / Manager
Product Query Example
code
Text
/products?searchTerm=iphone&page=1&limit=10&sortBy=price&sortOrder=asc
Orders
Method	Endpoint	Access
POST	/orders	Customer
GET	/orders/my-orders	Customer
GET	/orders	Admin / Manager
GET	/orders/:orderId	Authorized
PATCH	/orders/:orderId/status	Admin / Manager
PATCH	/orders/:orderId/cancel	Customer
Order Query Example
code
Text
/orders?status=PENDING&page=1&limit=10&sortBy=createdAt&sortOrder=desc
💳 Payment API
The project uses the bKash Sandbox payment gateway.
Create bKash Payment
POST /payments/tokenized/checkout/create/:orderId
Example:
code
Text
POST /api/v1/payments/tokenized/checkout/create/a4883c6c-13a5-49ca-a3ec-227a2f056387
Authentication:
CUSTOMER
Execute bKash Payment
POST /payments/bkash/execute
Request body:
code
JSON
{
  "paymentID": "YOUR_BKASH_PAYMENT_ID"
}
bKash Callback
GET /payments/bkash/callback
This endpoint is called during the bKash payment flow.
My Payments
GET /payments/my-payments
Customer can view their own payment history.
Example:
code
Text
/payments/my-payments?page=1&limit=10
All Payments
GET /payments
Access:
ADMIN
MANAGER
Example:
code
Text
/payments?status=PAID&paymentGateway=BKASH&page=1&limit=10
Single Payment
GET /payments/:paymentId
Example:
code
Text
/payments/b72338fd-dcca-4fc0-96af-6e9669a06ed7
📊 Pagination
The API supports pagination using:
page
limit
Example:
code
Text
/products?page=1&limit=10
Response metadata:
code
JSON
{
  "page": 1,
  "limit": 10,
  "total": 20,
  "totalPages": 2
}
🔎 Searching
Example:
code
Text
/products?searchTerm=iphone
The API supports search based on relevant product fields.
↕️ Sorting
Example:
code
Text
/products?sortBy=price&sortOrder=asc
Supported sorting orders:
asc
desc
🛡️ Validation
The project uses Zod for server-side request validation.
Validation is implemented for:
Request body
Request params
Query parameters
Authentication
Products
Categories
Orders
Payments
Invalid requests return a 400 Bad Request response.
Example:
code
JSON
{
  "success": false,
  "statusCode": 400,
  "message": "Password must contain at least one uppercase letter."
}
❌ Error Response Format
The API follows a consistent error response format.
code
JSON
{
  "success": false,
  "statusCode": 400,
  "message": "Something went wrong",
  "errors": []
}
✅ Success Response Format
Successful requests follow a consistent structure:
code
JSON
{
  "success": true,
  "statusCode": 200,
  "message": "Operation successful",
  "data": {}
}
💰 Order & Payment Flow
The main order/payment flow is:
Customer
↓
Create Order
↓
Order Status = PENDING
↓
Create bKash Payment
↓
Redirect to bKash
↓
Customer Completes Payment
↓
bKash Callback
↓
Execute Payment
↓
Payment Status = PAID
↓
Order Status = CONFIRMED
🗄️ Database
The project uses:
PostgreSQL
Prisma ORM
Main entities include:
User
Category
Product
Order
OrderItem
Payment
Relationships and constraints are implemented using Prisma.
Indexes are added for frequently queried fields such as:
customerId
order status
createdAt
productId
orderId
payment status
payment gateway
🔄 Order Status Flow
Orders follow a controlled status workflow:
PENDING
↓
CONFIRMED
↓
PROCESSING
↓
SHIPPED
↓
DELIVERED
Cancellation:
PENDING
↓
CANCELLED
When an order is cancelled, purchased product stock is restored.
💳 Payment Status
Available payment statuses:
PENDING
PAID
FAILED
REFUNDED
Payment gateway:
BKASH
STRIPE
SSLCOMMERZ
CASH_ON_DELIVERY
The current implementation uses:
bKash Sandbox
🧪 Testing
The API can be tested using Postman.
Recommended testing order:
Register
Verify Email
Login
Create Category
Create Product
Get Products
Create Order
Get My Orders
Create bKash Payment
Complete bKash Payment
Verify Payment
Verify Order Status
Get My Payments
Admin Payment Management
Test Validation
Test Role Authorization
📮 Postman
A Postman collection is included with the project.
Import the collection into Postman and configure:
baseUrl
accessToken
Example:
baseUrl = http://localhost:5000/api/v1
🔒 Security
The project implements:
JWT authentication
HTTP-only cookies
Password hashing using bcrypt
Role-based authorization
Request validation using Zod
Protected admin/manager/customer routes
Ownership validation
Environment variables for sensitive credentials
🚀 Deployment
The backend can be deployed to platforms such as:
Vercel
Render
Railway
Other Node.js compatible hosting platforms
Make sure the production environment contains all required environment variables.
👨‍💻 Developer
Siam Ahmed
Frontend / Backend Developer
GitHub: YOUR_GITHUB_PROFILE
LinkedIn: YOUR_LINKEDIN_PROFILE
