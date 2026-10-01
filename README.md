# Team Task Manager

A full-stack web application for managing team projects and tasks with role-based access control.

## Tech Stack

**Backend:**
- Node.js + Express.js
- PostgreSQL (with Sequelize ORM)
- JWT authentication
- bcryptjs for password hashing

**Frontend:**
- React 18
- Vite
- React Router DOM
- Axios
- Tailwind CSS

## Features

✅ User authentication (Signup/Login with JWT)
✅ Role-based access control (Admin/Member)
✅ Project management (Admin only)
✅ Task creation, assignment, and status tracking
✅ Dashboard with task filtering and overdue tracking
✅ Responsive UI with Tailwind CSS

## Local Setup

### Prerequisites

- Node.js (v14+)
- PostgreSQL (local or remote)
- npm or yarn

### Backend Setup

1. Navigate to `team/backend`:
   ```bash
   cd team/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure `.env` file with your PostgreSQL credentials:
   ```
   DATABASE_URL=postgres://user:password@localhost:5432/team_task_manager
   JWT_SECRET=your_secure_secret_key_here
   PORT=5000
   ```

4. Start the server:
   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to `team/frontend`:
   ```bash
   cd team/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. The `.env` file is pre-configured:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

4. Start the dev server:
   ```bash
   npm run dev
   ```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login and get JWT token

### Projects (Admin only for POST/PUT/DELETE)
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks (Admin can manage all, Members can update their own)
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task (Admin only)
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task status
- `DELETE /api/tasks/:id` - Delete task (Admin only)

## Role-Based Access

**Admin:**
- Create, update, delete projects
- Create, delete tasks
- Assign tasks to members
- See all tasks and projects

**Member:**
- View all projects and tasks
- Update their own task status only
- Cannot create, delete, or manage projects

## Database Models

**User:**
- id (UUID, primary key)
- name (string)
- email (string, unique)
- password (hashed)
- role (enum: admin, member)

**Project:**
- id (UUID, primary key)
- name (string)
- description (text)
- ownerId (UUID, foreign key to User)

**Task:**
- id (UUID, primary key)
- title (string)
- description (text)
- status (enum: todo, in-progress, done)
- dueDate (date)
- projectId (UUID, foreign key to Project)
- assigneeId (UUID, foreign key to User, nullable)

## Deployment Notes

This app is designed for deployment on Railway or similar PaaS platforms.

**Key considerations:**
- Set environment variables on the deployment platform
- Ensure PostgreSQL database is configured (use Railway's managed PostgreSQL)
- Frontend can be deployed separately or built and served from backend
- Update VITE_API_URL to your production backend URL

## Development Notes

- Frontend and backend are completely separated
- No shared files between frontend and backend folders
- Backend uses Sequelize models with automatic sync
- Frontend uses protected routes with localStorage token storage
- All API calls use axios with automatic token injection

## Running Both Servers

Terminal 1 (Backend):
```bash
cd team/backend
npm start
```

Terminal 2 (Frontend):
```bash
cd team/frontend
npm run dev
```
