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
- **Sub-Step Branch:** `feature/step-3.1-db-queries`

### Sub-Step 3.1: Data Access Layer & Drizzle Query Engine (In Progress)
- **Date Started:** 2 November 2026
- **Status:** 🟡 In Progress (Core types & `getAllStations()` implemented and verified; detail queries pending)
- **Files Modified / Created:**
  - `src/lib/stations.ts`:
    - `StationLineInfo`: TypeScript interface for metro line details (code, displayName, color, sequenceOrder).
    - `StationWithLines`: Clean domain interface for stations with associated lines array.
    - `getAllStations(lineCode?: string)`: Drizzle relational query with optional line filtering and sequence sorting.
- **Verification:**
  - `npx tsc --noEmit` passes cleanly with 0 errors.

- **Key Concepts Learned & Discussed in Detail:**
  - **Git Branching Mastery:**
    - The Tree / Parallel Universe mental model for feature branches.
    - Difference between `git switch -c <name>` and `git checkout -b <name>` (both create and switch, `switch` is the modern Git 2.23+ dedicated command for branches).
    - Managing micro-branches for sub-steps (`feature/step-3.1-db-queries` off `feature/step-3-station-directory`).
  - **Next.js 15 App Router vs Normal React (RSC Paradigm Shift):**
    - Why RSC (React Server Components) eliminate the need for separate Express backends, `fetch()`, `useEffect()`, and `useState()`.
    - Server components directly query PostgreSQL in milliseconds, returning pre-rendered HTML with 0ms client loading spinners and optimal SEO.
    - Next.js folder-based routing: `src/app/stations/page.tsx` $\rightarrow$ `/stations`, and dynamic segments `[code]` $\rightarrow$ `/stations/[code]`.
  - **Incremental Pair-Programming Strategy:**
    - Agreement on writing code bite-by-bite (10-15 lines) rather than dumping 100+ line files, ensuring full comprehension of syntax, types, and architecture before proceeding.
  - **Drizzle ORM Relational Queries (`with` clause):**
    - How `db.query.stations.findMany({ with: { stationLines: { with: { line: true } } } })` works under the hood.
    - How Drizzle uses predefined relations in `schema.ts` (`stationsRelations`, `stationLinesRelations`) to execute automatic SQL `LEFT JOIN`s without manual SQL boilerplate.
  - **Domain Mould / Saancha (`StationWithLines`):**
    - Why we map raw DB rows to `StationWithLines`: stripping internal DB timestamps, secret IDs, and packaging only passenger-relevant attributes (Gujarati, Hindi names, facilities, line colors).
  - **Line Filtering & Sequence Sorting Mechanics:**
    - Using `lines.some(l => l.lineCode === normalized)` for filtering.
    - The School Assembly mental model for `array.sort((a, b) => aSeq - bSeq)`:
      - If $(a - b)$ is negative, $a$ comes first; if positive, $b$ comes first.
    - **The End-to-End Lifecycle of `sequenceOrder`:**
      - Traced from GMRC metro map stop numbers $\rightarrow$ `src/db/seed.ts` (1, 2, 3...) $\rightarrow$ PostgreSQL DB (`station_lines.sequence_order`) $\rightarrow$ Drizzle query `sl.sequenceOrder` $\rightarrow$ `StationLineInfo` $\rightarrow$ `sort((a, b) => aSeq - bSeq)` so stations render in train travel order.

- **Checkpoint & Next Steps for Next Session:**
  - **MANDATORY CODING STYLE & PEDAGOGY RULE:**
    - Always follow incremental pair-programming: write code in small, bite-sized chunks (10-15 lines at a time).
    - NEVER dump a large multi-function file all at once.
    - Explain syntax, origin of every variable/property, mental model, and architecture (Kya - Kyu - Kaise - Kahan) before and after writing.
  - **Immediate Next Tasks in `src/lib/stations.ts` (Current line count: ~68 lines):**
    - 1. Add `ConnectedStation` and `StationDetail` interfaces (for dynamic station details and adjacent stops).
    - 2. Implement `getStationByCode(code: string)` using `db.query.stations.findFirst(...)` with `outgoingConnections` relation.
    - 3. Implement `getAllMetroLines()` querying `metroLines` table for active lines.
    - 4. Test/Verify with `npx tsc --noEmit`.
    - 5. Git commit on `feature/step-3.1-db-queries`, switch to `feature/step-3-station-directory`, and merge.
  - **Upcoming Sub-Steps in Step 3:**
    - Sub-Step 3.2: Reusable UI Components (`src/components/LineBadge.tsx` and `src/components/StationCard.tsx`).
    - Sub-Step 3.3: Directory Listing (`src/app/stations/page.tsx`) with search params line filtering (`?line=BLUE_LINE`).
    - Sub-Step 3.4: Dynamic Station Page (`src/app/stations/[code]/page.tsx`).
