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

### Sub-Step 2.2: In-Memory Metro Graph Builder Engine
- **Date Completed:** 27 October 2026
- **Status:** ✅ 100% Complete & Verified
- **Verification:**
  - Vitest test suite: `npm test` runs cleanly (`2 passed (2)` files, `3 passed (3)` tests in 1.11s).
  - TypeScript compiler check: `npx tsc --noEmit` passes with 0 errors.

- **Files Created:**
  - `src/lib/routing/graph.ts`:
    - `RawConnection` interface for connection input data.
    - `buildMetroGraph()` function converting station list and raw connections into an in-memory `MetroGraph` (consisting of `stations` Map and `adjacencyList` Map).
  - `src/lib/routing/graph.test.ts`:
    - Unit tests verifying graph building, station lookup, bidirectional edges, middle station connections, and isolated station handling without errors.

- **Key Concepts Learned & Discussed:**
  - **Why In-Memory Graph**: Querying the database row-by-row on every path hop during graph search is slow; loading data once into memory RAM Maps gives microsecond-level lookups.
  - **Why Both `stations` & `adjacencyList`**:
    - `adjacencyList` acts as the GPS/network graph (telling the algorithm where edges go and what distance/time they cost).
    - `stations` Map acts as the station directory/counter (providing passenger display names, language names, and validation).
  - **The "Lifafa" (Envelope/Drawer) Mental Model**:
    - `Map` key is the envelope label (e.g. `'THGM'`, `'OHCT'`).
    - Inside the envelope is an array (`[]`) where every outgoing connection chit is pushed (`push(...)`).
  - **Pragmatic Learning Strategy**:
    - Understand Kya-Kyu-Kaise-Kahan -> Implement with complete comprehension -> Test with Vitest assertions.

---

### Sub-Step 2.3: Dijkstra's Shortest Path & Fare Calculation Engine (In Progress — Paused for Next Session)
- **Date Started:** 27 October 2026
- **Status:** 🟡 In Progress (Drafted & Type-Checked; Deep Understanding & Tests Pending)
- **Current State:**
  - `src/lib/routing/dijkstra.ts` has been written and passes `npx tsc --noEmit` with 0 errors.
  - Implements `calculateFare(distanceKm, fareRules)` based on official GMRC distance slabs.
  - Implements `findShortestRoute(graph, originCode, destinationCode, fareRules)` handling:
    - Origin/Destination validation and same-station edge cases.
    - Dijkstra distances, travel times, and previous node trackers.
    - Backtracking from destination to origin.
    - Building user-facing `RouteStep[]` with actions (`BOARD`, `RIDE`, `INTERCHANGE`, `ALIGHT`).

- **Checkpoint & Agenda for Tomorrow:**
  - 1. Walk through the Dijkstra loop and backtracking logic slowly and simply in Hinglish.
  - 2. Understand how interchange station detection works (detecting line change between Blue and Red lines).
  - 3. Create `src/lib/routing/dijkstra.test.ts` and verify with Vitest tests.
