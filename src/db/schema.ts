import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  numeric,
  integer,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// -------------------------------------------------------------
// 1. METRO LINES (Corridors: Blue Line, Red Line)
// -------------------------------------------------------------
export const metroLines = pgTable(
  'metro_lines',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    code: varchar('code', { length: 20 }).notNull().unique(), // e.g., 'BLUE_LINE', 'RED_LINE'
    name: varchar('name', { length: 100 }).notNull(), // 'East-West Corridor', 'North-South Corridor'
    displayName: varchar('display_name', { length: 100 }).notNull(), // 'Blue Line', 'Red Line'
    color: varchar('color', { length: 20 }).notNull(), // hex color, e.g., '#2563eb', '#dc2626'
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('idx_metro_lines_code').on(table.code),
  ]
);

// -------------------------------------------------------------
// 2. STATIONS (Unique physical stations in Ahmedabad network)
// -------------------------------------------------------------
export const stations = pgTable(
  'stations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    code: varchar('code', { length: 10 }).notNull().unique(), // e.g., 'OHCT', 'THLT', 'APMC'
    name: varchar('name', { length: 100 }).notNull(),
    gujaratiName: varchar('gujarati_name', { length: 150 }),
    hindiName: varchar('hindi_name', { length: 150 }),
    latitude: numeric('latitude', { precision: 10, scale: 7 }),
    longitude: numeric('longitude', { precision: 10, scale: 7 }),
    isInterchange: boolean('is_interchange').default(false).notNull(),
    isOperational: boolean('is_operational').default(true).notNull(),
    hasElevator: boolean('has_elevator').default(true).notNull(),
    hasParking: boolean('has_parking').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('idx_stations_code').on(table.code),
    index('idx_stations_name').on(table.name),
  ]
);

// -------------------------------------------------------------
// 3. STATION_LINES (Many-to-Many junction: Station <-> Line)
// Interchange stations like 'Old High Court' exist once in `stations`
// but have multiple records here with specific sequence orders.
// -------------------------------------------------------------
export const stationLines = pgTable(
  'station_lines',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    stationId: uuid('station_id')
      .notNull()
      .references(() => stations.id, { onDelete: 'cascade' }),
    lineId: uuid('line_id')
      .notNull()
      .references(() => metroLines.id, { onDelete: 'cascade' }),
    sequenceOrder: integer('sequence_order').notNull(),
    distanceFromOriginKm: numeric('distance_from_origin_km', { precision: 6, scale: 2 })
      .default('0.00')
      .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('idx_station_line_unique').on(table.stationId, table.lineId),
    uniqueIndex('idx_line_sequence_unique').on(table.lineId, table.sequenceOrder),
  ]
);

// -------------------------------------------------------------
// 4. STATION_CONNECTIONS (Graph Edges for Route Algorithm)
// -------------------------------------------------------------
export const stationConnections = pgTable(
  'station_connections',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    fromStationId: uuid('from_station_id')
      .notNull()
      .references(() => stations.id, { onDelete: 'cascade' }),
    toStationId: uuid('to_station_id')
      .notNull()
      .references(() => stations.id, { onDelete: 'cascade' }),
    lineId: uuid('line_id')
      .notNull()
      .references(() => metroLines.id, { onDelete: 'cascade' }),
    distanceKm: numeric('distance_km', { precision: 5, scale: 2 }).notNull(),
    travelTimeMinutes: integer('travel_time_minutes').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('idx_station_connection_unique').on(
      table.fromStationId,
      table.toStationId,
      table.lineId
    ),
    index('idx_conn_from_station').on(table.fromStationId),
    index('idx_conn_to_station').on(table.toStationId),
  ]
);

// -------------------------------------------------------------
// 5. FARE RULES (Distance Slabs per GMRC Official Schedule)
// -------------------------------------------------------------
export const fareRules = pgTable(
  'fare_rules',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    minDistanceKm: numeric('min_distance_km', { precision: 5, scale: 2 }).notNull(),
    maxDistanceKm: numeric('max_distance_km', { precision: 5, scale: 2 }), // null means infinity/above
    fareInr: integer('fare_inr').notNull(),
    description: varchar('description', { length: 100 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  }
);

// -------------------------------------------------------------
// 6. USERS
// -------------------------------------------------------------
export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    role: varchar('role', { length: 20 }).default('passenger').notNull(), // 'passenger' | 'admin'
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('idx_users_email').on(table.email),
  ]
);

// -------------------------------------------------------------
// 7. BOOKINGS
// -------------------------------------------------------------
export const bookings = pgTable(
  'bookings',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    bookingReference: varchar('booking_reference', { length: 32 }).notNull().unique(), // e.g. AM-20261022-XXXX
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    originStationId: uuid('origin_station_id')
      .notNull()
      .references(() => stations.id),
    destinationStationId: uuid('destination_station_id')
      .notNull()
      .references(() => stations.id),
    originStationName: varchar('origin_station_name', { length: 100 }).notNull(), // immutable snapshot
    destinationStationName: varchar('destination_station_name', { length: 100 }).notNull(), // immutable snapshot
    totalDistanceKm: numeric('total_distance_km', { precision: 6, scale: 2 }).notNull(),
    interchangeRequired: boolean('interchange_required').default(false).notNull(),
    passengerCount: integer('passenger_count').default(1).notNull(),
    farePerPassenger: integer('fare_per_passenger').notNull(),
    totalFare: integer('total_fare').notNull(),
    status: varchar('status', { length: 20 }).default('CONFIRMED').notNull(), // 'CONFIRMED' | 'CANCELLED'
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('idx_bookings_reference').on(table.bookingReference),
    index('idx_bookings_user_id').on(table.userId),
  ]
);

// -------------------------------------------------------------
// 8. TICKETS (Demonstration Passes with QR verification token)
// -------------------------------------------------------------
export const tickets = pgTable(
  'tickets',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    bookingId: uuid('booking_id')
      .notNull()
      .references(() => bookings.id, { onDelete: 'cascade' }),
    ticketNumber: varchar('ticket_number', { length: 32 }).notNull().unique(), // e.g. TKT-2026-XXXX
    qrPayload: text('qr_payload').notNull(), // Cryptographic token or verification string
    status: varchar('status', { length: 20 }).default('ACTIVE').notNull(), // 'ACTIVE' | 'USED' | 'EXPIRED'
    validUntil: timestamp('valid_until').notNull(),
    usedAt: timestamp('used_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('idx_tickets_number').on(table.ticketNumber),
    index('idx_tickets_booking_id').on(table.bookingId),
  ]
);

// -------------------------------------------------------------
// RELATIONS DEFINITIONS (Drizzle Query API support)
// -------------------------------------------------------------
export const metroLinesRelations = relations(metroLines, ({ many }) => ({
  stationLines: many(stationLines),
  stationConnections: many(stationConnections),
}));

export const stationsRelations = relations(stations, ({ many }) => ({
  stationLines: many(stationLines),
  outgoingConnections: many(stationConnections, { relationName: 'fromStation' }),
  incomingConnections: many(stationConnections, { relationName: 'toStation' }),
  originBookings: many(bookings, { relationName: 'originStation' }),
  destinationBookings: many(bookings, { relationName: 'destinationStation' }),
}));

export const stationLinesRelations = relations(stationLines, ({ one }) => ({
  station: one(stations, {
    fields: [stationLines.stationId],
    references: [stations.id],
  }),
  line: one(metroLines, {
    fields: [stationLines.lineId],
    references: [metroLines.id],
  }),
}));

export const stationConnectionsRelations = relations(stationConnections, ({ one }) => ({
  fromStation: one(stations, {
    fields: [stationConnections.fromStationId],
    references: [stations.id],
    relationName: 'fromStation',
  }),
  toStation: one(stations, {
    fields: [stationConnections.toStationId],
    references: [stations.id],
    relationName: 'toStation',
  }),
  line: one(metroLines, {
    fields: [stationConnections.lineId],
    references: [metroLines.id],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  originStation: one(stations, {
    fields: [bookings.originStationId],
    references: [stations.id],
    relationName: 'originStation',
  }),
  destinationStation: one(stations, {
    fields: [bookings.destinationStationId],
    references: [stations.id],
    relationName: 'destinationStation',
  }),
  tickets: many(tickets),
}));

export const ticketsRelations = relations(tickets, ({ one }) => ({
  booking: one(bookings, {
    fields: [tickets.bookingId],
    references: [bookings.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
}));
