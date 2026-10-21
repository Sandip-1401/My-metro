# Ahmedabad Metro Portal — Architecture Documentation

## 1. System Overview
The Ahmedabad Metro Web Application is a production-grade, standalone transit platform built with Next.js App Router, TypeScript, Tailwind CSS, PostgreSQL, and Drizzle ORM.

## 2. High-Level Architecture

```
[ Client Browser ]
        │
        │ HTTP / Server Actions
        ▼
[ Next.js App Router (Node.js runtime) ]
  ├── Server Components (RSC) -> Direct DB queries via Drizzle
  ├── Client Components ('use client') -> Interactive form state & UI
  ├── Server Actions -> Validated mutations (Booking, Auth, Admin)
  └── Edge / Node Middleware -> Session verification & RBAC
        │
        │ Type-safe Queries (pg pool singleton)
        ▼
[ PostgreSQL (localhost:5432 / ahmedabad_metro) ]
```

## 3. Directory Layout
- `src/app/`: Next.js App Router pages, layouts, loading skeletons, and error boundaries.
- `src/components/`: Reusable, accessible UI components.
- `src/db/`: Database layer:
  - `schema.ts`: Drizzle ORM table definitions, constraints, indexes, and relations.
  - `index.ts`: PostgreSQL connection pool singleton for Next.js hot-reload safety.
  - `seed.ts`: Reproducible, verified Ahmedabad Metro seed script.
- `src/lib/`: Core domain logic (BFS/Dijkstra routing algorithms, fare calculators, formatting utilities).
- `docs/`: Comprehensive project documentation and learning logs.
