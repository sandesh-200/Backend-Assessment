# Task Management API

A RESTful API for managing tasks with user authentication. Built with Node.js, Express, and MongoDB.

## Quick Start

### Prerequisites

Make sure you have these installed:
- Node.js (v20 or higher)
- MongoDB (v7 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd Assestment2
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables

Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

Required environment variables:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/taskdb
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=30d
NODE_ENV=development
```

4. Start the server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The API will be running at `http://localhost:5000`

### Using Docker

If you prefer Docker, it's even simpler:

```bash
docker-compose up
```

This will start both the API and MongoDB in containers. No need to install MongoDB locally.

---

## API Overview

### Authentication Endpoints

#### Register a new user
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Sandesh Dhakal",
  "email": "sandesh@example.com",
  "password": "securepassword123"
}
```

Response:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Sandesh Dhakal",
  "email": "sandesh@example.com",
  "role": "user",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "sandesh@example.com",
  "password": "S@ndesh1123"
}
```

Response: Same as registration

### Task Endpoints

All task endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <token-here>
```

#### Get all tasks (for logged-in user)
```http
GET /api/tasks
Authorization: Bearer <token>
```

#### Create a new task
```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Complete project documentation",
  "description": "Write comprehensive README",
  "status": "pending"
}
```

#### Get a specific task
```http
GET /api/tasks/:id
Authorization: Bearer <token>
```

#### Update a task
```http
PUT /api/tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "completed"
}
```

#### Delete a task
```http
DELETE /api/tasks/:id
Authorization: Bearer <token>
```

---

## Folder Structure

```
Assestment2/
├── src/
│   ├── config/
│   │   └── db.js                 # MongoDB connection setup
│   ├── controllers/
│   │   ├── auth.controller.js    # Register & login logic
│   │   └── task.controller.js    # CRUD operations for tasks
│   ├── middleware/
│   │   └── auth.js               # JWT verification middleware
│   ├── models/
│   │   ├── user.model.js         # User schema with password hashing
│   │   └── task.model.js         # Task schema with user reference
│   ├── routes/
│   │   ├── auth.routes.js        # Auth endpoint definitions
│   │   └── task.routes.js        # Task endpoint definitions
│   └── server.js                 # App entry point
├── .env                          # Environment variables (not in git)
├── .env.example                  # Template for environment setup
├── Dockerfile                    # Container configuration
├── docker-compose.yml            # Multi-container setup
└── package.json                  # Dependencies and scripts
```

### What each part does:

- **config/**: Database connection logic lives here
- **controllers/**: Business logic for handling requests
- **middleware/**: Reusable functions that run before route handlers (like auth checks)
- **models/**: MongoDB schemas that define data structure
- **routes/**: API endpoint definitions and their HTTP methods
- **server.js**: Ties everything together and starts the Express server

---

## Key Technical Decisions

### Why Express?
It's lightweight, has a huge ecosystem, and gets out of our way. Perfect for building APIs quickly without unnecessary overhead.

### Why MongoDB?
Tasks and users have a simple structure that fits well with document-based storage. MongoDB's flexibility makes it easy to add fields later without migrations. Plus, Mongoose gives us nice schema validation.

### Why JWT for authentication?
Stateless authentication means we don't need session storage. The server doesn't have to remember who's logged in—just verify the token. This makes horizontal scaling much easier.

### Password hashing with bcrypt
Storing plain passwords is a security nightmare. Bcrypt adds salt and hashing automatically. We use a Mongoose pre-save hook so developers can't accidentally forget to hash passwords.

### Indexing strategy
- Email field is indexed for faster login lookups
- User ID is indexed in tasks for quick filtering by user
- These indexes matter as the database grows

### Error handling
Global error middleware catches any unhandled errors and returns a consistent JSON response. Keeps error handling DRY.

### Environment variables
Sensitive data (JWT secret, DB credentials) never goes in code. This makes it safe to commit code to public repos and easy to change configs per environment.

---

## How This System Can Scale

### Current limitations
Right now, everything runs on a single server. This works fine for small to medium loads, but here's what happens as we grow:

### Horizontal scaling (multiple servers)
Since we're using JWT (stateless auth), we can run multiple instances of this API behind a load balancer. Each instance is independent—no shared session state to worry about.

**How to do it:**
- Deploy multiple instances of the app
- Put them behind a load balancer (AWS ALB, Nginx, etc.)
- All instances connect to the same MongoDB

### Database scaling
MongoDB supports:
- **Replica sets**: Multiple copies of data for high availability
- **Sharding**: Split data across multiple servers

For this app, I'd start with replica sets. Sharding is not so good unless we have millions of users.

### Caching layer
We can use Redis in this case
- User data (reduce DB lookups on every request)
- Frequently accessed tasks
- JWT blacklist (for logout functionality)

### Rate limiting

### Monitoring
Add logging (Winston, Pino) and monitoring (Datadog, New Relic) to track:
- Response times
- Error rates
- Database query performance

---

## CI/CD & AWS Deployment Strategy

### CI/CD Pipeline (GitHub Actions example)

**What it would do:**
1. Run tests on every push
2. Build Docker image
3. Push image to AWS ECR (Elastic Container Registry)
4. Deploy to AWS ECS or EC2