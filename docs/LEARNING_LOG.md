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

## Step 2: Route Planning Algorithm & Fare Logic (In Progress)

### Sub-Step 2.1: Testing Infrastructure (Vitest) & Metro Routing Domain Types
- **Date Completed:** 24 October 2026
- **Status:** ✅ 100% Complete & Verified
- **Verification:**
  - Vitest test runner: `npm test` runs cleanly (`1 passed (1)` in 588ms).
  - TypeScript compiler check: `npx tsc --noEmit` passes with 0 errors.

- **Packages Installed:**
  - `vitest@^3.2.7` (installed as `devDependency`, compatible with project's `@types/node@20`).

- **Files Created / Modified:**
  - `package.json`: Added `vitest` dependency and `"test": "vitest run"` script.
  - `vitest.config.ts`: Vitest configuration file with `@/*` path alias mapping to `./src/*`.
  - `src/lib/routing/types.ts`: Domain types & contracts for the routing engine:
    - `StationNode`: Station metadata, lines array, interchange flag.
    - `GraphEdge`: Edge connecting stations with `distanceKm` and `travelTimeMinutes`.
    - `AdjacencyList` & `MetroGraph`: Graph structure representing the metro network in memory.
    - `RouteAction` & `RouteStep`: Step-by-step route directions (`BOARD`, `RIDE`, `INTERCHANGE`, `ALIGHT`).
    - `RouteResult`: Final payload containing origin, destination, path, total distance, travel time, interchange details, and fare.
    - `FareRule`: GMRC distance slab model.
  - `src/lib/routing/types.test.ts`: Smoke test verifying Vitest configuration and type compatibility.

- **Key Concepts Learned & Discussed:**
  - **BFS vs Dijkstra for Metro**: BFS works for unweighted fewest-stops, but Dijkstra is required for Ahmedabad Metro because fares are distance-slab-based and travel time requires edge weights and interchange penalties.
  - **Why Vitest**: Running unit tests in terminal takes <1 second without needing browser interaction or server boot.
  - **Why Types First**: Defining contracts before implementing logic ensures IDE autocomplete, prevents runtime typos, and unifies data across Dijkstra, UI, and ticket booking modules.
  - **Smoke Test / Sanity Check**: Verifying that test tools and imports function before writing 200+ lines of algorithmic code.

---

## Next Step to Resume: Sub-Step 2.2 — Graph Builder Engine
- **Goal:** Build in-memory `MetroGraph` (Adjacency List) from the verified database seeds.
- **Files to create:**
  - `src/lib/routing/graph.ts`: Function `buildMetroGraph()` to construct graph from stations and connections.
  - `src/lib/routing/graph.test.ts`: Vitest unit tests verifying that 32 stations, 62 bidirectional connections, and the Old High Court interchange junction are correctly loaded into memory.
- **Sub-Step 2.3 (Follow-up):** Implement Dijkstra's shortest path algorithm using the graph and calculate official GMRC fare.
