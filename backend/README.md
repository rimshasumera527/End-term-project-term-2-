# TutorSlot backend

Express + Mongoose API for TutorSlot. See the repo root README for the full product overview.

- `npm start` — production start
- `npm run dev` — watch mode
- `npm test` — 27-check smoke suite (in-memory MongoDB)
- `npm run seed` — seed demo data into `MONGODB_URI`
- `npm run atlas-check` — verify the Atlas connection string

Zero-config demo: `USE_MEMORY_DB=1 npm start` boots an ephemeral database,
seeds it if empty, and logs the demo credentials.
