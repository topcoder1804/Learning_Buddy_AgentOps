# Learning Buddy


Welcome to **Learning Buddy**, an AI-powered learning assistant designed to make education accessible, personalized, and effective — especially for students in underserved and rural areas of India.

EduBuddy addresses the lack of personalized support in large-scale, low-cost online learning models by delivering 24/7 guidance, real-time feedback, adaptive content, and intelligent progress tracking.

---

## Problem Statement

Millions of learners across India, particularly in rural areas, lack access to affordable and personalized digital education. Existing platforms often rely on static, one-size-fits-all content, leading to high dropout rates and poor learner engagement.

**Learning Buddy bridges this gap** by offering a virtual AI companion that supports personalized learning journeys at scale.

---

## Stakeholders

- **Students**: School and college learners in urban and rural areas seeking affordable, personalized help.
- **Working Professionals**: Individuals aiming to upskill or reskill with flexible, self-paced learning.
- **EdTech Companies**: Platforms striving to improve engagement and outcomes while minimizing support costs.

---

## Key Features

### Seamless Onboarding
Personalized learning plans created via a smart onboarding wizard that captures learner goals, skill levels, and time constraints.

### AI-Powered Learning Buddy
24/7 adaptive support with real-time feedback, tailored content, and dynamic learning paths.

### Centralized Dashboard
One dashboard to rule them all — track progress, manage modules, and resume learning effortlessly.

### Smart Resource Management
Upload/download organized content and access curated materials for each topic.

### Adaptive Study Flow
Each topic includes:
- Diagnostic quizzes
- Personalized lessons
- AI Q&A
- Instant quizzes and assignments
- Deadline reminders

### Progress Tracking & Nudges
Visual progress trackers and motivational nudges to keep learners engaged and on track.

### Inclusive Accessibility
Multilingual support (e.g., regional languages) and offline functionality to ensure reach across all geographies.

---

## Backend (Node.js + Express + MongoDB)
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

## Frontend (React + Vite)
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
cd Backend <br>
npm install <br>
cp .env.example .env   # Set your MongoDB URI and Clerk keys here <br>
npm start <br> 


### Frontend
cd react <br>
npm install <br>
npm run dev <br> 


### Cloudflare worker
Configure and deploy using Wrangler:<br>
cd cloudflare-worker <br>
npm install <br>
wrangler publish <br> ---

## Authentication
- Clerk is used for user authentication (SSO support)
- Auth middleware is integrated into protected routes

---

## Tech Stack

- **Frontend**: React, Vite  
- **Backend**: Node.js, Express.js, MongoDB  
- **Auth**: Clerk  
- **AI/Embedding**: Cloudflare Workers  
- **Other**: Groq integration, REST API

---

## Contact
For queries or collaboration requests, feel free to reach out to the contributors on GitHub.

---

> Empowering every learner — anywhere, anytime — with the guidance they deserve
