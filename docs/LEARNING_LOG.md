# Learning Log & Progress Tracker

## Step 1: Project Setup, Database Schema & Ahmedabad Metro Seeds
- **Date Completed:** October 2026
- **Status:** Complete & Verified
- **Key Concepts Mastered:**
  - Database connection pooling in Next.js (`globalThis.__dbPool` pattern) to avoid connection leaks during Turbopack hot reloading.
  - Relational schema modeling with Drizzle ORM: Many-to-many junction (`station_lines`), Graph edge table (`station_connections`), and immutable historical snapshots on `bookings`.
  - Official Ahmedabad Metro data verification (GMRC Blue Line & Red Line, Old High Court interchange, and distance slab fare matrix).
- **Files Created/Modified:**
  - `src/db/schema.ts`
  - `src/db/index.ts`
  - `src/db/seed.ts`
  - `drizzle.config.ts`
  - `.env.example`
  - `src/components/Navbar.tsx`
  - `src/app/page.tsx`
  - `package.json`
