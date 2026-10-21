# Ahmedabad Metro Project — Learning Roadmap

| Step | Feature Scope | Architecture & Next.js Focus |
|---|---|---|
| **Step 1** | Project Setup, Git, Drizzle ORM, Schema & Verified Seeds | Next.js configs, Server-only DB singleton, Drizzle migrations, `.env` security |
| **Step 2** | Graph Algorithm (BFS/Dijkstra) & Fare Calculator Engine | Pure domain TypeScript logic, Vitest unit testing, edge case handling |
| **Step 3** | Verified Station Directory & Line Filtering | React Server Components (RSC), dynamic routes `[code]`, Streaming & Suspense |
| **Step 4** | Route Planner UI & Interactive Station Picker | Client Components (`'use client'`), React Hook Form + Zod, URL search params |
| **Step 5** | Authentication, Sessions & RBAC | HTTP-only Cookies, Password Hashing, Edge Middleware route protection |
| **Step 6** | Booking Flow & Transaction Safety | Server Actions, Drizzle DB transactions, Optimistic UI, Idempotency |
| **Step 7** | QR Ticket Pass Generation | SVG QR rendering, cryptographically signed tokens, mobile responsive pass |
| **Step 8** | Passenger Booking History & Ticket Detail | Protected Server Component data fetching, ownership verification |
| **Step 9** | Admin Portal | Role-based mutations, `revalidatePath`, live cache invalidation, audit logging |
| **Step 10** | E2E Testing, Accessibility & Production Build | Playwright, WCAG accessibility, SEO metadata, Vercel readiness |
