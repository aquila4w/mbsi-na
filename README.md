# MBSI NA — Maranatha Bible School International (North America)

A full-featured **Learning Management System** built for [Maranatha Bible School International's North America extension](https://mbsina.org). The platform combines traditional LMS capabilities — courses, assignments, quizzes, gradebooks — with specialized tools for ministry training, student advancement, and pastoral performance tracking.

**"Called, Consecrated, Competent for the End-Time Mission"**

---

## Features

### Academic

- **Course Management** — Create, publish, and organize courses with modules, pages, and content items
- **Assignments & Submissions** — Teachers create assignments; students submit work; teachers grade with rubrics and feedback
- **Quiz Engine** — Timed quizzes with multiple-choice, true/false, and short-answer questions; question banks with categories; auto-grading; multiple attempts
- **Gradebook** — Per-course grade tracking with export functionality
- **Discussions** — Threaded and side-comment discussion boards
- **Announcements** — Pinned and unpinned course announcements
- **Groups** — Student groups with leader/member roles
- **Calendar** — Academic calendar view
- **Modules** — Organized course content with pages, assignments, and discussions

### Ministry-Specific

- **Student Metrics** — Track ministry performance: guest attendance, baptisms, thanksgiving offerings, evangelism, and caroling goals with year-over-year analytics (bar, line, and radar charts)
- **Advancement System** — Formal deliberation sessions for student promotion through MBSI's four-level hierarchy:
  - AMP Internship → Probationary Minister → MBSI Minister → Terminal/Graduate
- **Place Assignments** — Assign students to churches and ministry locations
- **Student Evaluations** — Pastoral evaluations and profile management

### Platform

- **Role-Based Access** — Seven roles: Admin, Teacher, Student, TA, Designer, Observer, Minister
- **Observer System** — Parents and mentors can monitor student progress via linked accounts
- **Demo Data Seeder** — One-click demo data generation with 12 sample users and 3 full courses (admin only)
- **Proctoring** — Browser-based test proctoring with environment checks

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 13 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth |
| UI | Tailwind CSS + shadcn/ui (Radix) |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Icons | Heroicons, Lucide |

## Project Structure

```
mbsi-na/
├── app/                    # Next.js App Router pages
│   ├── admin/demo/         # Demo data seeder (admin only)
│   ├── advancement/        # Student advancement & deliberation
│   ├── api/demo/           # API routes for demo seed/cleanup
│   ├── assignments/        # Assignment management
│   ├── calendar/           # Academic calendar
│   ├── courses/            # Course pages (list, detail, create)
│   │   └── [id]/           # Announcements, discussions, gradebook,
│   │                       # groups, modules, quizzes
│   ├── dashboard/          # Role-based dashboard
│   ├── faculty/            # Faculty directory
│   ├── login/              # Authentication
│   ├── metrics/            # Student ministry metrics & analytics
│   ├── notifications/      # User notifications
│   ├── observers/          # Observer/parent monitoring
│   ├── programs/           # Academic programs
│   ├── register/           # User registration
│   ├── settings/           # User settings
│   ├── test-proctoring/    # Proctored testing
│   └── users/              # User administration
├── components/             # React components
│   ├── advancement/        # Advancement session components
│   ├── analytics/          # Charts and analytics
│   ├── assignments/        # Assignment UI components
│   ├── courses/            # Course management components
│   ├── dashboard/          # Dashboard widgets
│   ├── grades/             # Gradebook and export
│   ├── layouts/            # Layout and navigation
│   ├── proctoring/         # Proctoring UI
│   ├── studentMetrics/     # Metrics tracking components
│   └── ui/                 # shadcn/ui base components
├── contexts/               # React contexts (AuthContext)
├── hooks/                  # Custom React hooks
├── lib/                    # Services and utilities
│   ├── advancement/        # Advancement service & types
│   ├── analytics/          # Analytics utilities
│   ├── courses/            # Course service
│   ├── demo/               # Demo seeder service
│   ├── discussions/        # Discussion service
│   ├── proctoring/         # Proctoring service
│   ├── quiz/               # Quiz service
│   ├── studentMetrics/     # Metrics service & types
│   ├── supabase.ts         # Client-side Supabase
│   └── supabase-admin.ts   # Server-side admin client
└── supabase/
    └── migrations/         # Database migrations
```

## Database Schema

15 migrations define the full schema with Row Level Security (RLS) on all tables:

- **Users** — `profiles`, `enrollments`, `observer_links`
- **Courses** — `courses`, `modules`, `module_items`, `announcements`
- **Assessments** — `assignments`, `submissions`, `quizzes`, `quiz_questions`, `quiz_answers`, `quiz_attempts`
- **Discussions** — `discussions`, `discussion_posts`
- **Groups** — `groups`, `group_members`
- **Rubrics** — `rubrics`, `rubric_criteria`
- **Question Banks** — `question_banks`, `question_categories`, `question_bank_items`
- **Proctoring** — `proctoring_sessions`
- **Student Metrics** — `student_metrics_students`, `student_metrics_records`, `student_evaluations`
- **Advancement** — `mbsi_levels`, `student_enrollments`, `student_place_assignments`, `student_year_profiles`, `advancement_sessions`, `advancement_decisions`

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project (database URL + keys)

### Setup

```bash
# Install dependencies
npm install

# Create .env.local with your Supabase credentials
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
EOF

# Apply database migrations
# Either use Supabase CLI or paste each migration into the SQL Editor

# Run the dev server
npm run dev
```

### Demo Data

Log in as admin, then visit `/admin/demo` to seed sample data:

- 3 teachers, 1 TA, 8 students
- 3 courses with modules, quizzes, assignments, discussions, and groups
- All demo emails use `@demo.mbsina.org` — one click to clean up

## Programs

MBSI NA offers two academic programs:

| Program | Duration | Description |
|---|---|---|
| Apostolic Missionary Program (AMP) | 2 years | Foundational ministry training |
| Bachelor of Theology (B.Th.) | 4+ years | Advanced theological education |

---

*Built for [MBSI North America](https://mbsina.org) — established 1997.*
