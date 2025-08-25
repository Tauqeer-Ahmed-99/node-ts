# NodeJS with Typescript (TSX), Express, Env Variables & Loggers Boilerplate

NodeJS boilerplate code with Typescript (TSX in dev, tsc for transpilation), Express framework with modular middlewares, Env variables propmpter and multiple loggers.

---

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Running the Application](#running-the-application)
  - [Scripts](#scripts)
- [Project Structure](#project-structure)
- [Code Overview](#code-overview)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- RESTful API server using Express
- Authentication with WorkOS AuthKit
- PostgreSQL database access via Drizzle ORM
- Modular code structure for controllers, services, database, and utilities
- TypeScript for type safety

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [PostgreSQL](https://www.postgresql.org/) (for local development)

### Installation

1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd node-ts
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```

### Environment Variables

Create a `.env` file in the root directory. Example:

```env
NODE_ENV=development
PORT=8000
WORKOS_AUTHKIT_CLIENT_KEY=your_client_key
WORKOS_AUTHKIT_SECRET_KEY=your_secret_key
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/db-name
```

- `NODE_ENV`: Set to `development` or `production`.
- `PORT`: Port for the server to run on.
- `WORKOS_AUTHKIT_CLIENT_KEY` and `WORKOS_AUTHKIT_SECRET_KEY`: Credentials for WorkOS AuthKit.
- `DATABASE_URL`: PostgreSQL connection string.

### Database Setup

1. **Configure your PostgreSQL instance** and ensure the database in `DATABASE_URL` exists.
2. **Generate Drizzle ORM migrations and schema:**
   ```sh
   npm run db-gen
   ```
3. **Run database migrations:**
   ```sh
   npm run db-migrate
   ```

### Running the Application

- **Development mode (with auto-reload):**
  ```sh
  npm run dev
  ```
- **Production build:**
  ```sh
  npm run build
  npm start
  ```

### Scripts

- `npm run dev`: Start server in development mode with hot reload
- `npm run build`: Compile TypeScript to JavaScript
- `npm start`: Run compiled server
- `npm run db-gen`: Generate Drizzle ORM migrations
- `npm run db-migrate`: Run database migrations

---

## Project Structure

```
├── drizzle.config.ts         # Drizzle ORM configuration
├── package.json             # Project metadata and scripts
├── tsconfig.json            # TypeScript configuration
├── .env                     # Environment variables (not committed)
└── src/
    ├── server.ts            # Entry point for the Express server
    ├── controllers/         # API route controllers
    │   ├── auth/            # Authentication logic
    │   │   └── authenticate.ts
    │   ├── error/           # Error handling
    │   │   └── handler.ts
    │   └── service/         # Service status endpoints
    │       └── status.ts
    ├── database/            # Database layer
    │   ├── enums.ts         # Enum definitions
    │   ├── index.ts         # DB connection setup
    │   ├── schema.ts        # Drizzle ORM schema
    │   ├── access-layer/    # Data access layer (DAL)
    │   │   ├── index.ts
    │   │   ├── trace-logs-dal.ts
    │   │   └── wallet-dal.ts
    │   └── tables/          # Table definitions
    │       └── trace-logs.ts
    ├── env/                 # Environment variable loader
    │   └── index.ts
    ├── logger/              # Logging utilities
    │   ├── cli.ts
    │   ├── database.ts
    │   └── index.ts
    ├── models/              # TypeScript models
    │   ├── api-response.ts
    │   └── http-error.ts
    ├── services/            # Business logic services
    │   ├── index.ts
    │   ├── trace-logs-service.ts
    │   └── wallet-service.ts
    ├── types/               # Type definitions
    │   ├── auth.ts
    │   └── globals.d.ts
    └── utils/               # Utility functions
        └── config.ts
```

---

## Code Overview

- **`src/server.ts`**: Main entry point. Sets up Express app, middleware, routes, and error handling.
- **Controllers (`src/controllers/`)**: Handle HTTP requests and responses. Organized by feature (e.g., `auth`, `error`, `service`).
- **Database (`src/database/`)**: Contains schema, enums, and data access logic. Uses Drizzle ORM for type-safe SQL.
  - **Access Layer**: DAL files (`trace-logs-dal.ts`, `wallet-dal.ts`) encapsulate database queries.
  - **Tables**: Table definitions for Drizzle ORM.
- **Services (`src/services/`)**: Business logic, orchestrates between controllers and database.
- **Models (`src/models/`)**: TypeScript interfaces and classes for API responses and errors.
- **Logger (`src/logger/`)**: Logging utilities for CLI and database events.
- **Env (`src/env/`)**: Loads and validates environment variables.
- **Types (`src/types/`)**: Shared type definitions and global types.
- **Utils (`src/utils/`)**: Helper functions and configuration utilities.

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Create a new Pull Request

---

## License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.
