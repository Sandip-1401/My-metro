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

### Sub-Step 2.3: Dijkstra's Shortest Path & Fare Calculation Engine
- **Date Completed:** 2 November 2026
- **Status:** ✅ 100% Complete & Verified
- **Verification:**
  - Vitest test suite: `npm test` runs cleanly (`3 passed (3)` files, `11 passed (11)` tests in 811ms).
  - TypeScript compiler check: `npx tsc --noEmit` passes with 0 errors.

- **Files Created / Modified:**
  - `src/lib/routing/dijkstra.ts`:
    - `calculateFare(distanceKm, fareRules)`: GMRC distance slab fare matcher with defensive ₹5 fallback.
    - `findShortestRoute(graph, originCode, destinationCode, fareRules)`: Complete Dijkstra engine returning full `RouteResult`.
  - `src/lib/routing/dijkstra.test.ts`:
    - 8 comprehensive unit tests verifying slab fares, empty rules fallback, invalid stations (`null`), same-station zero-distance trip, single-hop same line (`BOARD` + `ALIGHT`), multi-hop same line (`BOARD` + `RIDE` + `ALIGHT`), interchange line transfer detection at Old High Court (`INTERCHANGE` step, `interchangeCount`, `interchangeStations`), and disconnected/isolated station safety (`null`).

- **Key Concepts Learned & Discussed in Detail:**
  - **Phase 1: GMRC Fare Calculation Logic (`calculateFare`)**:
    - Slab matching algorithm using `minDistanceKm` and `maxDistanceKm`.
    - Handled the unbounded highest slab ($> 12\text{ km}$) with `maxDistanceKm === null`.
    - Fallback minimum base fare (₹5) for defensive programming.
  - **Where `distanceKm` Originates (End-to-End Pipeline)**:
    - Trace from DB (`station_connections`) $\rightarrow$ in-memory graph (`GraphEdge.distanceKm`) $\rightarrow$ Dijkstra relaxation accumulator (`currentDist + edge.distanceKm`) $\rightarrow$ final extraction via `distances.get(destinationCode)` $\rightarrow$ passed into `calculateFare()`.
  - **Phase 2: Guard Clauses & Same-Station Edge Case**:
    - Station validation (`!origin || !destination`) returning `null` to prevent runtime crashes.
    - Same-station short-circuit (`originCode === destinationCode`) returning 0 km, 0 min, single `BOARD` step, and base fare without wasting CPU on graph search.
  - **Phase 3: The 4 Core Trackers**:
    - `distances`: Map initialized to `Infinity` for all nodes, `0` for origin (scoreboard).
    - `travelTimes`: Map tracking cumulative trip time in minutes.
    - `unvisited`: Set checklist of unfinalized stations.
    - `previous`: `Map<string, { fromCode: string; edge: GraphEdge }>` mental model as "Footprints / Breadcrumbs" storing current station, previous station code, and full edge object (line code, distance, travel time) to enable backtracking and line interchange detection.
  - **Phase 4: Dijkstra Main Loop (Lines 78–117)**:
    - **Minimum Distance Node Selection**: Picking unvisited station with lowest tentative distance.
    - **Early Break & Safety**: Stopping when destination is finalized or remaining nodes are unreachable (`smallestDistance === Infinity`).
    - **Cycle Prevention**: Skipping already finalized stations using `if (!unvisited.has(edge.toStationCode)) continue;`.
    - **Current Distance Retrieval**: `distances.get(currentCode) ?? 0` with nullish coalescing defensive guard.
    - **Floating-Point Accuracy**: Resolving JS IEEE-754 precision issues via `parseFloat((currentDist + edge.distanceKm).toFixed(2))`.
    - **The Relay Race Mental Model**: Writing relaxed distance in round $N$ and reading it in round $N+1$.
  - **Phase 5: Unreachable Check & Backtracking (Lines 119–133)**:
    - **Unreachable Gate**: `if (!previous.has(destinationCode)) return null;` handles disconnected nodes gracefully.
    - **Typing `hops: Array<{ fromCode: string; toCode: string; edge: GraphEdge }>`**: Storing origin code, destination code, and full edge data (line code, hop distance, travel time) for rich itinerary generation.
    - **The Backward Walk (`while (curr !== originCode)`)**: Tracing footsteps backward using `previous.get(curr)` and updating `curr = prevInfo.fromCode`.
    - **The `unshift()` Array Magic**: Adding each new hop to the front (index 0) naturally reverses backward exploration into a clean forward (Origin $\rightarrow$ Destination) itinerary.
  - **Phase 6: Passenger Directions & Interchange Detection (Lines 135–202)**:
    - **Boarding Step**: Generating Step 1 at origin with `action: 'BOARD'`, 0 km, 0 min, and note indicating heading station (`notes: Board train towards ...`).
    - **Action Classification**:
      - `action: 'ALIGHT'` when reaching the destination station (`i === hops.length - 1`).
      - `action: 'INTERCHANGE'` when adjacent hops differ in line (`hop.edge.lineCode !== nextHop.edge.lineCode`), tracking `interchangeCount++` and `interchangeStations.push(...)`.
      - `action: 'RIDE'` for regular intermediate stops.
    - **Final Payload**: Returning complete `RouteResult` including `totalDistanceKm` (safely formatted), `totalTravelTimeMinutes`, and `fareInr`.

- **Git Commit:** `d0d9916 dijkstra shortest path engine, fare calculation, and vitest test suite` (committed & pushed to GitHub)

---

## Step 3: Verified Station Directory & Line Filtering (In Progress)
- **Feature Branch:** `feature/step-3-station-directory` (pushed to GitHub remote)
- **Sub-Step Branch:** `feature/step-3.1-db-queries` (merged into `feature/step-3-station-directory`)

### Sub-Step 3.1: Data Access Layer & Drizzle Query Engine
- **Date Completed:** 3 November 2026
- **Status:** ✅ 100% Complete & Verified
- **Verification:**
  - `npx tsc --noEmit` passes cleanly with 0 errors.
  - Vitest test suite: `npm test` runs cleanly (`3 passed (3)` files, `11 passed (11)` tests in 714ms).
  - Real DB queries verified via `npx tsx -r dotenv/config`:
    - `getAllStations()`: 32 stations with line associations.
    - `getAllStations('BLUE_LINE')`: 18 stations in sequence order (Thaltej Gam to Vastral Gam).
    - `getAllStations('RED_LINE')`: 15 stations in sequence order (APMC to Motera Stadium).
    - `getStationByCode('OHCT')`: Old High Court with both Blue & Red lines and 4 adjacent connected stations.
    - `getAllMetroLines()`: Active Blue Line (#2563eb) and Red Line (#dc2626).

- **Files Modified / Created:**
  - `src/lib/stations.ts`:
    - `StationLineInfo`: Metro line details (code, displayName, color, sequenceOrder).
    - `StationWithLines`: Station domain model with associated lines array.
    - `ConnectedStation`: Adjacent station hop (code, name, lineCode, lineColor, distanceKm, travelTimeMinutes).
    - `StationDetail`: Comprehensive station model extending `StationWithLines` with coordinates, operational status, and connected stations list.
    - `MetroLineItem`: Active metro corridor model for UI filter buttons.
    - `getAllStations(lineCode?: string)`: Relational Drizzle query with line filtering and sequence sorting.
    - `getStationByCode(code: string)`: Single station fetch with uppercase normalization, safe float conversions, and outgoing connections relation.
    - `getAllMetroLines()`: Fetches active metro lines for UI filter pills.

- **Key Concepts Learned & Discussed in Detail:**
  - **Git Branching & Merge Flow:**
    - Sub-step branch `feature/step-3.1-db-queries` created, committed, and fast-forward merged into `feature/step-3-station-directory` and pushed to GitHub.
  - **Next.js 15 App Router vs Normal React (RSC Paradigm Shift):**
    - Why RSC (React Server Components) eliminate the need for separate Express backends, `fetch()`, `useEffect()`, and `useState()`.
    - Server components directly query PostgreSQL in milliseconds, returning pre-rendered HTML with 0ms client loading spinners and optimal SEO.
  - **Drizzle ORM Relational Queries (`with` clause):**
    - How `db.query.stations.findMany` and `findFirst` work with nested relations (`stationLines.line`, `outgoingConnections.toStation`, `outgoingConnections.line`).
    - Using callback predicates `where: (stations, { eq }) => eq(...)` without manual SQL imports.
  - **Defensive Data Formatting:**
    - Trimming and uppercasing codes (`code.trim().toUpperCase()`) for fault-tolerant dynamic routes.
    - Safely parsing PostgreSQL `numeric` strings to JavaScript numbers via `parseFloat()`.
    - Return `null` guard on non-existent station codes for clean Next.js `notFound()` 404 integration.

---

### 🚨 GOLDEN PAIR-PROGRAMMING & WORKFLOW RULES (MANDATORY)
1. **User Controls The Terminal 100%**:
   - The AI Assistant must NEVER run bash/powershell commands (git, npm, npx, verification scripts, tsx, test runners) behind the user's back.
   - ALL terminal commands must be run by the USER directly in their own terminal.
   - The AI's job is to provide the exact command, explain **KYA** it does, **KYU** we run it, and what output to expect.
2. **Bite-Sized Incremental Coding**:
   - Write code in 10-15 line chunks at a time.
   - Explain syntax, origin of variables, architecture, and mental models before/after every step.
   - Full user alignment before writing files.

---

### Sub-Step 3.2: Reusable UI Components (In Progress)
- **Feature Branch:** `feature/step-3-station-directory`
- **Sub-Step Branch:** `feature/step-3.2-ui-components`
- **Components to Build:**
  - 1. `src/components/LineBadge.tsx`: Reusable pill/badge displaying metro line badge with dynamic background color, text color, and responsive sizing.
  - 2. `src/components/StationCard.tsx`: Reusable card displaying station name, Gujarati/Hindi typography, interchange indicator, facilities chips (elevator, parking), and line badges.
  - 3. Verification: Component render verification with Next.js & Tailwind CSS.
