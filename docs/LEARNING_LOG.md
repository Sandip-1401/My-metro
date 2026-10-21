# Learning Log & Progress Tracker

## Step 1: Project Setup, Database Schema & Ahmedabad Metro Seeds
- **Date Completed:** 22 October 2026
- **Status:** ✅ 100% Complete & Verified
- **Database Status:**
  - Database `ahmedabad_metro` created on PostgreSQL 17.
  - All 8 tables successfully pushed via Drizzle Kit: `metro_lines`, `stations`, `station_lines`, `station_connections`, `fare_rules`, `users`, `bookings`, `tickets`.
  - Database successfully seeded:
    - 2 Metro lines (Blue Line, Red Line)
    - 32 Unique physical stations
    - 33 Station-line mappings (Interchange at Old High Court correctly mapped to both lines)
    - 62 Graph connections (bidirectional edges with distances & travel times)
    - 5 Official GMRC fare slabs (₹5 to ₹25)
- **Key Concepts Learned:**
  - Next.js Turbopack connection pooling singleton pattern (`globalThis.__dbPool`).
  - Drizzle ORM schema design, compound unique indexes, and foreign key cascades.
  - Difference between `npm run db:push` (creating tables) and `npm run db:seed` (populating data).
- **Git Commit:** `feat: complete step 1 - database schema, drizzle orm setup, and verified ahmedabad metro seeds`

---

## Next Step to Resume: Step 2 — Route Planning Algorithm & Fare Logic
- **Goal:** Pure TypeScript graph traversal engine (BFS / Dijkstra) to find the shortest path between any two stations, detect line changes (interchanges at Old High Court), and calculate the exact official fare based on distance slabs.
- **Testing:** Unit tests with Vitest to verify routes before hooking up the UI.
