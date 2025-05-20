# Learning Buddy AgentOps


A full-stack intelligent learning assistant platform that helps users manage courses, quizzes, assignments, and progress using AI-powered vector embeddings and Cloudflare Workers.

---

## Features

### Backend (Node.js + Express + MongoDB)
- RESTful APIs for managing:
  - Users
  - Courses
  - Quizzes
  - Assignments
  - File uploads (DataRoom)
- Authentication via Clerk with SSO callback support
- User progress tracking and profile updates
- MongoDB models for structured data storage

### Cloudflare Worker
- Integrates AI via vector embeddings for smarter recommendations
- Used for efficient serverless operations and vector handling

### Frontend (React + Vite)
- Authentication and structured routing (Private & Public Layouts)
- Course and Quiz Management UIs
- Modals and Cards for adding/viewing course data
- Components include:
  - `HomePage`, `QuizRunner`, `NewCourseModal`, `CourseCard`, `SideNav`, and more
- Resources tab for course-specific learning materials

---

## Project Structure

```bash
├── Backend                 # Express server with routes and controllers
├── cloudflare-worker      # Cloudflare functions for vector operations
├── react                  # Frontend React app using Vite
├── README.md              # This file
├── .gitignore             # Git ignore rules
└── package-lock.json      # NPM dependency lock
```

## Setup Instructions

### Backend
cd Backend
npm install
cp .env.example .env   # Set your MongoDB URI and Clerk keys here
npm start


### Frontend
cd react
npm install
npm run dev


### Cloudflare worker
Configure and deploy using Wrangler:<br>
cd cloudflare-worker
npm install
wrangler publish

## Authentication
- Clerk is used for user authentication (SSO support)
- Auth middleware is integrated into protected routes

## Tech Stack

- **Frontend**: React, Vite  
- **Backend**: Node.js, Express.js, MongoDB  
- **Auth**: Clerk  
- **AI/Embedding**: Cloudflare Workers  
- **Other**: Groq integration, REST API  

## Contact
For queries or collaboration requests, feel free to reach out to the contributors on GitHub.
