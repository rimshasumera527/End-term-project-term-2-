# TutorSlot — Book the tutor, not the queue

A tutoring marketplace built around a real **availability engine**: tutors
publish weekly slots, students book conflict-free sessions, and a 12-hour
cancellation policy keeps everyone honest.

---

## Problem Statement

Students find tutors on notice boards and WhatsApp groups, then book over chat.
The results are predictable: double-bookings, unrecorded no-shows, price
haggling in DMs, and no trustworthy signal of teaching quality. TutorSlot turns
that chaos into a structured booking workflow with conflict validation and
post-session reviews.

## Target Users

- **Students** who want to find and reliably book subject tutors.
- **Tutors** who want structured availability, fewer no-shows, and a review
  history that builds their reputation.

## Solution

Tutors register with subjects, rate and city, and publish weekly availability
windows. Students search and filter, pick a date, and see only genuinely free
hour-slots. The backend validates every booking against both the availability
grid and existing bookings (for the tutor *and* the student), enforcing a
12-hour cancellation policy and one-review-per-session authenticity.

## Key Features

- **Availability engine** — tutors add weekday windows; overlapping or inverted
  ranges are rejected; sessions must fall inside a published window.
- **Conflict-checked bookings** — double-booking a tutor slot or a student's own
  overlapping session returns 409; reschedules re-run the checks.
- **Cancellation policy** — free up to 12 hours before start; inside the window
  the cancel is flagged `lateCancel` and shows on the tutor's dashboard.
- **Session lifecycle & reviews** — tutors mark completed / no-show; completed
  sessions unlock a 1–5 star review (one per booking, student-only), which
  updates the tutor's cached rating.
- **Role-scoped dashboards** — tutors see earnings, late cancellations and
  rating; students see upcoming sessions and review counts.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS 4, React Router 6, Axios |
| Backend | Node.js, Express 4, Mongoose 8, Zod validation |
| Auth | JWT (7-day), bcryptjs, role-based access (`student` / `tutor`), rate-limited auth |
| Database | MongoDB (Atlas or local); `USE_MEMORY_DB=1` zero-config demo |
| Tests | `node:test` + `mongodb-memory-server` (27-check smoke suite) |
| Deployment | Render (backend `render.yaml`) + Vercel (frontend `vercel.json`) |

## Architecture

```text
React SPA (Vercel)
   │  axios + JWT bearer
   ▼
Express API (Render)
   │   /api/auth            register (student|tutor), login, me
   │   /api/tutors          search+filters (public), detail (public)
   │   /api/tutors/…        availability, bookings, reviews, dashboards (JWT)
   │
   │   engines:
   │   ├─ time.js            "HH:MM" → minutes, overlap math
   │   ├─ assertFree()       availability grid × existing bookings × student calendar
   │   └─ review → rating    aggregation refreshes the tutor's cached rating
   ▼
MongoDB: User · Availability · Booking · Review
```

## Major Workflows

1. **Tutor publishes availability** — per-weekday windows with overlap and
   range validation (409/400).
2. **Student discovers & books** — filter by subject / max price / min rating /
   city; pick a date to see free 60-minute slots; booking validates against
   availability and all existing bookings on both sides.
3. **Reschedule / cancel with notice rules** — participants only; cancels
   inside 12 hours are flagged as late.
4. **Session lifecycle** — tutor marks completed or no-show; students review
   completed sessions once; tutor rating cache updates via aggregation.
5. **Dashboards** — role-scoped stats: earnings and late-cancels for tutors;
   upcoming sessions and review count for students.

## Local Setup

```bash
# 1. Backend
cd backend
npm install
npm test                       # 27-check smoke suite (no database needed)

# Zero-config demo:
USE_MEMORY_DB=1 npm start      # API on http://localhost:5102

# Or with a real MongoDB:
cp .env.example .env           # set MONGODB_URI + JWT_SECRET
npm run seed
npm start

# 2. Frontend
cd ../frontend
npm install
npm run dev                    # app on http://localhost:5302
```

**Demo credentials** (password `Demo@1234`): tutors `meera@demo.com`,
`arjun@demo.com`, `fatima@demo.com`; student `rahul@demo.com`. The seed
includes Mon–Sat availability, two completed+reviewed sessions and one upcoming
booking.

## Environment Variables

### backend/.env

| Name | Purpose |
|---|---|
| `PORT` | API port (default 5102) |
| `MONGODB_URI` | MongoDB connection string (empty + `USE_MEMORY_DB=1` for demo mode) |
| `USE_MEMORY_DB` | `1` = ephemeral in-memory MongoDB, auto-seeded on boot |
| `JWT_SECRET` | Secret used to sign JWTs — long random string in production |
| `CLIENT_ORIGIN` | Frontend origin allowed by CORS (default http://localhost:5302) |

### frontend/.env

| Name | Purpose |
|---|---|
| `VITE_API_URL` | Backend API base URL (default http://localhost:5102/api) |

## API Overview

| Method & path | Purpose |
|---|---|
| `POST /api/auth/register` · `POST /api/auth/login` · `GET /api/auth/me` | Auth with role |
| `GET /api/tutors` · `GET /api/tutors/:id` · `GET /api/tutors/:id/availability` | Public discovery |
| `POST /api/tutors/availability` · `DELETE /api/tutors/availability/:slotId` | Manage availability (tutor) |
| `POST /api/tutors/bookings` · `GET /api/tutors/bookings` | Book / list sessions |
| `PATCH /api/tutors/bookings/:id/reschedule` · `PATCH …/cancel` · `PATCH …/complete` | Lifecycle |
| `POST /api/tutors/bookings/:id/review` | One review per completed session |
| `GET /api/tutors/dashboard/tutor` · `GET /api/tutors/dashboard/student` | Role dashboards |
| `GET /api/health` | Health probe |

## Deployment

- **Backend**: Render web service from `backend/render.yaml` — set `MONGODB_URI`,
  `JWT_SECRET`, `CLIENT_ORIGIN` in the dashboard; health check `/api/health`.
- **Frontend**: Vercel from `frontend/` (SPA rewrite via `vercel.json`); set
  `VITE_API_URL` to the Render URL.

Live links: backend — [add URL] · frontend — [add URL]

## Error Handling & Security

- Zod validation on every route; malformed ObjectIds return 404, not 500.
- Role guards on tutor-only and student-only operations; booking mutations
  check participant identity before touching anything.
- bcrypt(12) hashing, no account enumeration on login, rate-limited auth,
  7-day JWT expiry with frontend auto-logout on 401.
- Central error middleware → `{ error: { message } }`; the frontend shows
  loading/empty/error/success states everywhere and toasts every mutation.

## Roadmap

- Online payments with escrow release after session completion.
- Recurring weekly bookings.
- Tutor holiday blackout dates.
- Waiting lists for fully booked windows.
