# Database Architecture & Entity Relationships

## 1. Design Principles
1. **Physical Identity Integrity:** An interchange station (like **Old High Court**) exists only once in the `stations` table, avoiding data duplication.
2. **Explicit Line Membership:** Many-to-many relationship managed via `station_lines`, preserving order and distance per corridor.
3. **Graph Topology for Route Traversal:** `station_connections` explicitly stores directed edges with distance and transit time.
4. **Historical Immutability:** `bookings` snapshots station names and fares at transaction time so future network alterations do not corrupt past audit records.

## 2. Entity Relationship Diagram (ERD)

```
metro_lines (1) ────────< station_lines (M) >──────── (1) stations
                                                             │
                                                             ├────────< station_connections (M)
                                                             │
users (1) ────< bookings (M) ────< tickets (M)
```

## 3. Schema Definitions
- `metro_lines`: `id`, `code`, `name`, `display_name`, `color`, `is_active`
- `stations`: `id`, `code`, `name`, `gujarati_name`, `hindi_name`, `latitude`, `longitude`, `is_interchange`, `is_operational`, `has_elevator`, `has_parking`
- `station_lines`: `id`, `station_id`, `line_id`, `sequence_order`, `distance_from_origin_km`
- `station_connections`: `id`, `from_station_id`, `to_station_id`, `line_id`, `distance_km`, `travel_time_minutes`
- `fare_rules`: `id`, `min_distance_km`, `max_distance_km`, `fare_inr`, `description`
- `users`: `id`, `name`, `email`, `password_hash`, `role`
- `bookings`: `id`, `booking_reference`, `user_id`, `origin_station_id`, `destination_station_id`, `origin_station_name`, `destination_station_name`, `total_distance_km`, `interchange_required`, `passenger_count`, `fare_per_passenger`, `total_fare`, `status`
- `tickets`: `id`, `booking_id`, `ticket_number`, `qr_payload`, `status`, `valid_until`, `used_at`
