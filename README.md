# GGI Backend Test Posture

A robust AI Chat and Subscription Bundle Management System built with TypeScript, Express.js, and PostgreSQL. This project follows Domain-Driven Design (DDD) and Clean Architecture principles.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Running the Project](#running-the-project)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Scripts](#scripts)
- [Testing](#testing)

## ✨ Features

- **AI Chat System**: Send messages and get AI-powered responses with token tracking
- **Subscription Management**: Create, view, and manage subscription bundles
- **Quota Management**: 
  - Free tier: 3 messages per month
  - Subscription tiers: Basic, Pro, and Enterprise with different message limits
  - Automatic quota reset on the 1st of each month
- **Monthly Usage Tracking**: Track user message usage per month
- **Auto-renewal Support**: Subscription bundles with auto-renewal functionality
- **Clean Architecture**: Domain-Driven Design with separation of concerns
- **Type Safety**: Full TypeScript implementation
- **Database Migrations**: Version-controlled database schema changes

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM/Migrations**: node-pg-migrate
- **Security**: Helmet, CORS
- **Date Handling**: date-fns
- **Validation**: Zod

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (v12 or higher)
- Git

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ahtishamqayyum/GGI-Backend.git
   cd GGI-Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp env.example .env
   ```

## ⚙️ Environment Setup

Edit the `.env` file with your configuration:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/ggi_backend_db

# Server Configuration
PORT=3000

# Environment (development, production, test)
NODE_ENV=development

# OpenAI Mock Configuration
OPENAI_MOCK_DELAY_MS=1000
```

### Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production/test)
- `OPENAI_MOCK_DELAY_MS`: Mock delay for OpenAI API simulation (in milliseconds)

## 🗄 Database Setup

1. **Create PostgreSQL database**
   ```sql
   CREATE DATABASE ggi_backend_db;
   ```

2. **Run migrations**
   ```bash
   npm run migrate:up
   ```

   This will create the following tables:
   - `users`: User accounts
   - `chat_messages`: Chat message history
   - `subscription_bundles`: Subscription plans and usage
   - `user_monthly_usage`: Monthly quota tracking

3. **Create a test user (optional)**
   ```bash
   # Run the SQL script in your PostgreSQL client
   psql -d ggi_backend_db -f scripts/create-test-user.sql
   ```

## 🏃 Running the Project

### Development Mode

```bash
npm run dev
```

The server will start on `http://localhost:3000` (or your configured PORT).

### Production Mode

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Start the server**
   ```bash
   npm start
   ```

### Health Check

Visit `http://localhost:3000/health` to verify the server is running.

## 📡 API Endpoints

### Health Check

```
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "service": "ggi-backend",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Chat Endpoints

#### Send Message
```
POST /api/chat/users/:userId/messages
```

**Request Body:**
```json
{
  "question": "What is TypeScript?"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "question": "What is TypeScript?",
    "answer": "This is a mocked response...",
    "tokensUsed": 25
  }
}
```

#### Get Chat History
```
GET /api/chat/users/:userId/messages?limit=50
```

**Query Parameters:**
- `limit` (optional): Number of messages to retrieve (default: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "question": "What is TypeScript?",
      "answer": "This is a mocked response...",
      "tokensUsed": 25,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Subscription Endpoints

#### Create Subscription
```
POST /api/subscriptions/users/:userId/subscriptions
```

**Request Body:**
```json
{
  "tier": "Basic",
  "billingCycle": "monthly",
  "autoRenew": false
}
```

**Tier Options:**
- `Basic`: 10 messages/month - $9.99/month or $99.99/year
- `Pro`: 100 messages/month - $29.99/month or $299.99/year
- `Enterprise`: Unlimited messages - $99.99/month or $999.99/year

**Billing Cycle Options:**
- `monthly`
- `yearly`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "tier": "Basic",
    "billingCycle": "monthly",
    "maxMessages": 10,
    "price": 9.99,
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-02-01T00:00:00.000Z",
    "renewalDate": null,
    "autoRenew": false,
    "isActive": true,
    "messagesUsed": 0
  }
}
```

#### Get User Subscriptions
```
GET /api/subscriptions/users/:userId/subscriptions
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "tier": "Basic",
      "billingCycle": "monthly",
      "maxMessages": 10,
      "price": 9.99,
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-02-01T00:00:00.000Z",
      "isActive": true,
      "messagesUsed": 5
    }
  ]
}
```

#### Get Active Subscriptions
```
GET /api/subscriptions/users/:userId/subscriptions/active
```

**Response:** Same format as Get User Subscriptions, but only returns active subscriptions.

#### Cancel Subscription
```
POST /api/subscriptions/users/:userId/subscriptions/:bundleId/cancel
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "tier": "Basic",
    "billingCycle": "monthly",
    "autoRenew": false,
    "isActive": true
  },
  "message": "Subscription cancelled successfully. It will remain active until the end of the current billing cycle."
}
```

### Error Responses

All endpoints return standardized error responses:

```json
{
  "error": "ERROR_CODE",
  "message": "Error description"
}
```

**Common Error Codes:**
- `VALIDATION_ERROR`: Invalid input data (400)
- `NOT_FOUND`: Resource not found (404)
- `QUOTA_EXCEEDED`: User has exceeded their message quota (403)
- `INTERNAL_SERVER_ERROR`: Unexpected server error (500)

## 📁 Project Structure

```
GGI-Backend-Test-Posture/
├── src/
│   ├── chat/
│   │   ├── controllers/
│   │   │   └── chat-controller.ts
│   │   ├── routes/
│   │   │   └── chat-routes.ts
│   │   └── services/
│   │       └── chat-service.ts
│   ├── subscriptions/
│   │   ├── controllers/
│   │   │   └── subscription-controller.ts
│   │   ├── routes/
│   │   │   └── subscription-routes.ts
│   │   └── services/
│   │       └── subscription-service.ts
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── chat-message.ts
│   │   │   ├── subscription-bundle.ts
│   │   │   ├── user.ts
│   │   │   └── user-monthly-usage.ts
│   │   ├── errors/
│   │   │   └── app-error.ts
│   │   └── repositories/
│   │       ├── i-chat-message-repository.ts
│   │       ├── i-subscription-bundle-repository.ts
│   │       ├── i-user-repository.ts
│   │       └── i-user-monthly-usage-repository.ts
│   ├── infrastructure/
│   │   ├── database/
│   │   │   └── database.ts
│   │   └── repositories/
│   │       ├── chat-message-repository.ts
│   │       ├── subscription-bundle-repository.ts
│   │       ├── user-repository.ts
│   │       └── user-monthly-usage-repository.ts
│   └── index.ts
├── migrations/
│   ├── 000001_create_users_table.js
│   ├── 000002_create_chat_messages_table.js
│   ├── 000003_create_subscription_bundles_table.js
│   └── 000004_create_user_monthly_usage_table.js
├── scripts/
│   └── create-test-user.sql
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## 🏗 Architecture

This project follows **Clean Architecture** and **Domain-Driven Design** principles:

### Layers

1. **Domain Layer** (`src/domain/`)
   - Entities: Core business objects
   - Repositories: Interfaces defining data access contracts
   - Errors: Custom error classes

2. **Application Layer** (`src/chat/`, `src/subscriptions/`)
   - Services: Business logic implementation
   - Controllers: Request/response handling
   - Routes: API endpoint definitions

3. **Infrastructure Layer** (`src/infrastructure/`)
   - Database: Database connection management
   - Repositories: Concrete implementations of repository interfaces

### Key Principles

- **Dependency Inversion**: High-level modules don't depend on low-level modules
- **Separation of Concerns**: Each layer has a specific responsibility
- **Testability**: Easy to mock dependencies for testing
- **Maintainability**: Clear structure makes code easy to understand and modify

## 📜 Scripts

```bash
# Development
npm run dev              # Start development server with hot reload

# Build
npm run build            # Compile TypeScript to JavaScript

# Production
npm start                # Start production server

# Database Migrations
npm run migrate          # Run pending migrations
npm run migrate:up       # Run all pending migrations
npm run migrate:down     # Rollback last migration

# Code Quality
npm run lint             # Check code for linting errors
npm run lint:fix         # Fix linting errors automatically
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting

# Testing
npm test                 # Run API tests
```

## 🧪 Testing

### Manual Testing

1. **Create a test user** using the SQL script:
   ```sql
   INSERT INTO users (id, email, created_at, updated_at)
   VALUES (gen_random_uuid(), 'test@example.com', NOW(), NOW())
   RETURNING id, email;
   ```

2. **Test API endpoints** using tools like:
   - Postman
   - cURL
   - Thunder Client (VS Code extension)

### Example cURL Commands

**Send a message:**
```bash
curl -X POST http://localhost:3000/api/chat/users/{userId}/messages \
  -H "Content-Type: application/json" \
  -d '{"question": "Hello, how are you?"}'
```

**Create a subscription:**
```bash
curl -X POST http://localhost:3000/api/subscriptions/users/{userId}/subscriptions \
  -H "Content-Type: application/json" \
  -d '{"tier": "Basic", "billingCycle": "monthly", "autoRenew": false}'
```

## 🔒 Security Features

- **Helmet**: Sets various HTTP headers for security
- **CORS**: Configurable Cross-Origin Resource Sharing
- **Input Validation**: Request validation to prevent invalid data
- **Error Handling**: Secure error messages without exposing internals

## 📝 Notes

- The OpenAI integration is currently mocked. In production, replace the mock implementation with actual OpenAI API calls.
- Free tier users get 3 messages per month, automatically reset on the 1st of each month.
- Subscription bundles remain active until their `endDate`, even after cancellation.
- Enterprise tier (`maxMessages: -1`) provides unlimited messages.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

ISC

## 👤 Author

GGI Backend Test Posture

---

For questions or support, please open an issue in the repository.

