# `El-Helal` - The Interactive Learning Platform

> _Initiating secure connection to knowledge base..._
> _Authentication successful. Welcome, developer._

## 🚀 Overview

`El-Helal` is a cutting-edge interactive learning platform designed to provide an engaging and personalized educational experience. Built with the modern web in mind, it leverages the power of Next.js, React, and 3D graphics to create an immersive environment for students, while offering robust management tools for teachers and administrators.

This platform is structured around distinct user roles: **Admin**, **Teacher**, and **Student**, each with tailored functionalities and access levels. From dynamic 3D hero sections to secure video streaming and comprehensive quiz systems, `El-Helal` aims to redefine online education.

## ✨ Core Features

```bash
# System Status: Operational
# Core Modules Loaded:
```

-   **Interactive 3D User Interface (`@react-three/fiber`):**
    -   Experience dynamic and visually stunning 3D elements, such as the `Hero3DBook` and a `Global3DBackground`, enhancing user engagement and providing a modern aesthetic.
-   **Role-Based Access Control (RBAC):**
    -   **Admin:** Full control over user management (teachers, students), content oversight, and system configurations.
    -   **Teacher:** Manages their own video content, creates and assigns quizzes, monitors student progress, and interacts via a dedicated community chat.
    -   **Student:** Accesses assigned video lessons, takes quizzes, tracks their learning progress, and engages in a floating chat for support.
-   **Comprehensive Video Management:**
    -   Teachers can upload, categorize, and manage educational video content.
    -   Students can securely stream videos with `hls.js`, ensuring a smooth and adaptive viewing experience.
-   **Dynamic Quiz System:**
    -   Teachers can create, edit, and assign quizzes to students.
    -   Students can take interactive quizzes, with results and progress tracked.
-   **Secure Authentication & Authorization:**
    -   Robust session management ensures secure login and protects routes based on user roles, redirecting unauthorized access.
-   **Real-time Communication:**
    -   **Student Floating Chat:** Provides immediate support and interaction for students.
    -   **Teacher Community Chat:** Facilitates collaboration and communication among teachers.
-   **Modern & Responsive UI/UX:**
    -   Crafted with Next.js, React, Tailwind CSS, and Radix UI for a fast, responsive, and visually appealing interface across all devices.
-   **Scalable Data Persistence:**
    -   Utilizes Neon Database (PostgreSQL compatible) for efficient and scalable data storage.
-   **Integrated Blob Storage (`@vercel/blob`):**
    -   Seamlessly handles storage for media files such as video thumbnails, user avatars, and other assets.

## 🛠️ Technologies & Stack

```bash
# Initializing tech stack scan...
# Scan complete. Dependencies identified.
```

### Frontend

-   **Next.js:** React framework for building performant web applications.
-   **React:** A JavaScript library for building user interfaces.
-   **TypeScript:** Superset of JavaScript that adds static typing.
-   **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
-   **Radix UI:** Unstyled, accessible components for building high-quality design systems.
-   **`@react-three/fiber` & `drei`:** React renderer for Three.js, enabling declarative 3D scenes.
-   **`hls.js`:** JavaScript library for playing HLS (HTTP Live Streaming) videos.
-   **Geist Fonts:** Modern, open-source fonts for a clean aesthetic.

### Backend

-   **Next.js API Routes / Server Actions:** For handling server-side logic and API endpoints.
-   **Neon Database:** Serverless PostgreSQL database for robust data storage.
-   **`@vercel/blob`:** Vercel's solution for storing and serving files.
-   **`bcryptjs`:** Library for hashing passwords securely.

### Authentication

-   **Custom Session Management:** Implemented using `middleware.ts` and `lib/auth.ts` for secure, role-based authentication.

### Development Tools

-   **ESLint:** Pluggable JavaScript linter.
-   **Prettier:** Opinionated code formatter.
-   **npm:** Package manager for JavaScript.
-   **Vercel:** Platform for deployment (implied by `@vercel/blob` and Next.js).

## 📂 Project Structure

```bash
# Navigating filesystem...
# Displaying directory tree:
```

```
.
├── app/                  # Next.js App Router: Contains all routes, layouts, and pages.
│   ├── (admin)/          # Admin-specific routes and dashboard.
│   │   └── admin/        # Admin dashboard, quizzes management.
│   ├── (student)/        # Student-specific routes and dashboard.
│   │   └── student/      # Student dashboard, video access, quiz taking.
│   ├── (teacher)/        # Teacher-specific routes and dashboard.
│   │   └── teacher/      # Teacher dashboard, student/video/quiz management, chat.
│   ├── api/              # Backend API routes for various functionalities.
│   ├── about-us/         # About Us page.
│   ├── access-denied/    # Page for unauthorized access.
│   ├── community-chat/   # Global community chat interface.
│   ├── login/            # User login page.
│   ├── paymob/           # Payment gateway integration (Paymob).
│   ├── photos/           # Photo sharing/management feature.
│   ├── qr-login/         # QR code based login functionality.
│   ├── quiz/             # General quiz related pages.
│   ├── teachers/         # Public teacher profiles/listings.
│   └── watch/            # Video watching interface.
├── components/           # Reusable React components used throughout the application.
│   ├── ui/               # Shadcn UI components (e.g., Card, Button, Input).
│   ├── messaging/        # Components related to chat functionalities.
│   └── ...               # Various other components like video players, forms, 3D elements.
├── docs/                 # Project documentation, setup guides, and notes.
│   ├── hls-ffmpeg-cheatsheet.md # HLS streaming related notes.
│   ├── README_BUNNY.md   # Documentation for Bunny.net integration.
│   └── secure-video-setup.md # Notes on secure video setup.
├── hooks/                # Custom React hooks for shared logic.
│   ├── use-mobile.ts     # Hook to detect mobile devices.
│   └── use-toast.ts      # Hook for toast notifications.
├── lib/                  # Utility functions, authentication logic, and external service integrations.
│   ├── auth.ts           # Core authentication logic and user session handling.
│   ├── auth-provider.tsx # React Context provider for authentication state.
│   ├── bunny.ts          # Integration with Bunny.net for video/asset delivery.
│   ├── gdrive.ts         # Google Drive integration utilities.
│   ├── messaging-types.ts# TypeScript types for messaging.
│   ├── utils.ts          # General utility functions (e.g., `clsx`, `tailwind-merge`).
│   ├── vimeo.ts          # Vimeo integration utilities.
│   └── youtube.ts        # YouTube integration utilities.
├── public/               # Static assets served directly by Next.js (images, favicons, etc.).
├── scripts/              # Utility scripts (e.g., database migrations, setup scripts).
│   └── sql/              # SQL scripts for database management.
├── server/               # Server-side logic, database interactions, and server actions.
│   ├── admin-actions.ts  # Server actions for admin functionalities.
│   ├── auth-actions.ts   # Server actions for authentication processes.
│   ├── bunny-actions.ts  # Server actions for Bunny.net interactions.
│   ├── db.ts             # Database connection and utility.
│   ├── group-chat-actions.ts # Server actions for group chat.
│   ├── live-actions.ts   # Server actions for live features.
│   ├── messaging-actions.ts # Server actions for messaging.
│   ├── notification-queries.ts # Database queries for notifications.
│   ├── photo-actions.ts  # Server actions for photo management.
│   ├── photo-queries.ts  # Database queries for photos.
│   ├── public-queries.ts # Database queries for publicly accessible data (e.g., featured videos).
│   ├── qr-actions.ts     # Server actions for QR code functionalities.
│   ├── quiz-actions.ts   # Server actions for quiz management.
│   ├── quiz-queries.ts   # Database queries for quizzes.
│   ├── resource-actions.ts # Server actions for resource management.
│   ├── student-actions.ts # Server actions for student management.
│   ├── student-queries.ts # Database queries for students.
│   ├── teacher-actions.ts # Server actions for teacher management.
│   └── video-access.ts   # Logic for controlling video access.
├── styles/               # Global styles and CSS files.
│   └── globals.css       # Main global CSS file.
├── middleware.ts         # Next.js middleware for request handling, authentication, and routing.
├── next.config.mjs       # Next.js configuration file.
├── package.json          # Project metadata and dependency list.
├── tsconfig.json         # TypeScript compiler configuration.
└── .env                  # Environment variables (local development).
```

## ⚙️ Setup & Installation

```bash
# Initializing setup sequence...
# Please ensure all prerequisites are met.
```

### Prerequisites

-   Node.js (v18 or higher recommended)
-   npm (or yarn/pnpm)
-   A Neon Database instance (or any PostgreSQL compatible database)

### Steps

1.  **Clone the Repository:**

    ```bash
    git clone <repository-url>
    cd El-Helal
    ```

2.  **Install Dependencies:**

    ```bash
    npm install
    # or yarn install
    # or pnpm install
    ```

3.  **Environment Configuration:**
    Create a `.env` file in the root of your project and populate it with the following variables:

    ```dotenv
    # Database Connection String (e.g., from Neon)
    DATABASE_URL="postgresql://user:password@host:port/database"

    # A strong, random string for session signing (e.g., generated by `openssl rand -base64 32`)
    NEXTAUTH_SECRET="your_super_secret_key_here"

    # Vercel Blob Storage (if used for asset uploads)
    BLOB_READ_WRITE_TOKEN="your_vercel_blob_token"

    # Other potential environment variables (e.g., for Bunny.net, Vimeo, YouTube APIs)
    # BUNNY_API_KEY="your_bunny_api_key"
    # VIMEO_ACCESS_TOKEN="your_vimeo_access_token"
    # YOUTUBE_API_KEY="your_youtube_api_key"
    # PAYMOB_API_KEY="your_paymob_api_key"
    ```

    _Note: The `NEXTAUTH_SECRET` is crucial for session security. Ensure it's a long, random, and securely stored string._

4.  **Database Setup:**
    Ensure your Neon Database (or equivalent) is provisioned and accessible via the `DATABASE_URL`. The application expects certain tables (`users`, `sessions`, `videos`, `quizzes`, etc.) to be present. If this is a fresh setup, you might need to run database migrations. Check the `scripts/sql` directory or `server/db.ts` for any migration-related logic.

## ▶️ Running the Application

```bash
# Executing application startup script...
# Initiating development server.
```

### Development Mode

To run the application in development mode with hot-reloading:

```bash
npm run dev
# The application will be accessible at http://localhost:3000 (or another port if configured).
```

### Production Build

To build the application for production deployment:

```bash
npm run build
```

### Start Production Server

To start the application in production mode (after building):

```bash
npm run start
```

## 🛡️ Authentication & Authorization Deep Dive

```bash
# Security Protocol: Active
# Analyzing access matrix...
```

The platform implements a robust authentication and authorization system to ensure data integrity and user privacy.

-   **`middleware.ts`:** This Next.js middleware intercepts all incoming requests. It checks for a `session_id` cookie, validates it using `getCurrentUser` from `lib/auth.ts`, and determines the user's role.
    -   **Public Routes:** `/`, `/login`, `/_next/*`, `/api/*` are accessible to all. If a logged-in user tries to access `/login`, they are redirected to their respective dashboard.
    -   **Protected Routes:**
        -   `/admin/*`: Only accessible by users with the `admin` role. Unauthorized users are redirected to `/login` or `/access-denied`.
        -   `/teacher/*`: Accessible by users with `teacher` or `admin` roles. Unauthorized users are redirected.
        -   `/student/*`: Accessible by users with `student` or `admin` roles. Unauthorized users are redirected.
-   **`lib/auth.ts`:** Contains the core logic for `getCurrentUser`, which queries the database to validate session IDs and retrieve user details (ID, role, name, grade, avatar_url).
-   **`lib/auth-provider.tsx`:** A React Context provider that makes the authenticated user's session data available to client-side components via the `useAuth` hook, enabling dynamic UI based on user roles.

## 📊 Data Model (High-Level Overview)

```bash
# Database Schema: Loading...
# Entity-Relationship Diagram (Conceptual):
```

The application interacts with a PostgreSQL-compatible database (e.g., Neon Database) with a schema designed to support the various functionalities. Key entities include:

-   **`users`:** Stores user information (ID, name, email, password hash, role, grade, avatar_url, phone, etc.).
-   **`sessions`:** Manages user sessions for authentication.
-   **`videos`:** Stores details about educational videos (ID, title, description, category, URL, thumbnail_url, teacher_id, is_free, month, created_at, etc.).
-   **`quizzes`:** Stores quiz definitions (ID, title, description, teacher_id, etc.).
-   **`questions`:** Stores individual quiz questions.
-   **`answers`:** Stores possible answers for quiz questions.
-   **`student_quiz_attempts`:** Records student attempts on quizzes.
-   **`messages`:** For chat functionalities (sender, receiver, content, timestamp).
-   **`photos`:** For photo sharing features (ID, user_id, url, caption, etc.).
-   **`likes`:** Records likes on photos or other content.
-   **`comments`:** Stores comments on photos or other content.

_Note: This is a high-level overview. Refer to the `server/sql` directory or relevant server-side query files for exact schema details._

## 🤝 Contributing

```bash
# Contribution Protocol: Initiated
# Awaiting pull requests...
```

We welcome contributions to `El-Helal`! If you'd like to contribute, please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes and ensure they adhere to the project's coding standards.
4.  Write clear, concise commit messages.
5.  Push your branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request with a detailed description of your changes.

## 📄 License

```bash
# License Check: Complete
# Status: MIT Licensed
```

This project is licensed under the MIT License. See the `LICENSE` file (if present) for more details.

---

> _Session terminated. Thank you for your inquiry._
> _`El-Helal` - Empowering Education._
