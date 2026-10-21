CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_reference" varchar(32) NOT NULL,
	"user_id" uuid,
	"origin_station_id" uuid NOT NULL,
	"destination_station_id" uuid NOT NULL,
	"origin_station_name" varchar(100) NOT NULL,
	"destination_station_name" varchar(100) NOT NULL,
	"total_distance_km" numeric(6, 2) NOT NULL,
	"interchange_required" boolean DEFAULT false NOT NULL,
	"passenger_count" integer DEFAULT 1 NOT NULL,
	"fare_per_passenger" integer NOT NULL,
	"total_fare" integer NOT NULL,
	"status" varchar(20) DEFAULT 'CONFIRMED' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bookings_booking_reference_unique" UNIQUE("booking_reference")
);
--> statement-breakpoint
CREATE TABLE "fare_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"min_distance_km" numeric(5, 2) NOT NULL,
	"max_distance_km" numeric(5, 2),
	"fare_inr" integer NOT NULL,
	"description" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "metro_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(20) NOT NULL,
	"name" varchar(100) NOT NULL,
	"display_name" varchar(100) NOT NULL,
	"color" varchar(20) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "metro_lines_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "station_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from_station_id" uuid NOT NULL,
	"to_station_id" uuid NOT NULL,
	"line_id" uuid NOT NULL,
	"distance_km" numeric(5, 2) NOT NULL,
	"travel_time_minutes" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "station_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"station_id" uuid NOT NULL,
	"line_id" uuid NOT NULL,
	"sequence_order" integer NOT NULL,
	"distance_from_origin_km" numeric(6, 2) DEFAULT '0.00' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(10) NOT NULL,
	"name" varchar(100) NOT NULL,
	"gujarati_name" varchar(150),
	"hindi_name" varchar(150),
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"is_interchange" boolean DEFAULT false NOT NULL,
	"is_operational" boolean DEFAULT true NOT NULL,
	"has_elevator" boolean DEFAULT true NOT NULL,
	"has_parking" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "stations_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"ticket_number" varchar(32) NOT NULL,
	"qr_payload" text NOT NULL,
	"status" varchar(20) DEFAULT 'ACTIVE' NOT NULL,
	"valid_until" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tickets_ticket_number_unique" UNIQUE("ticket_number")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"role" varchar(20) DEFAULT 'passenger' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_origin_station_id_stations_id_fk" FOREIGN KEY ("origin_station_id") REFERENCES "public"."stations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_destination_station_id_stations_id_fk" FOREIGN KEY ("destination_station_id") REFERENCES "public"."stations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "station_connections" ADD CONSTRAINT "station_connections_from_station_id_stations_id_fk" FOREIGN KEY ("from_station_id") REFERENCES "public"."stations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "station_connections" ADD CONSTRAINT "station_connections_to_station_id_stations_id_fk" FOREIGN KEY ("to_station_id") REFERENCES "public"."stations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "station_connections" ADD CONSTRAINT "station_connections_line_id_metro_lines_id_fk" FOREIGN KEY ("line_id") REFERENCES "public"."metro_lines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "station_lines" ADD CONSTRAINT "station_lines_station_id_stations_id_fk" FOREIGN KEY ("station_id") REFERENCES "public"."stations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "station_lines" ADD CONSTRAINT "station_lines_line_id_metro_lines_id_fk" FOREIGN KEY ("line_id") REFERENCES "public"."metro_lines"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_bookings_reference" ON "bookings" USING btree ("booking_reference");--> statement-breakpoint
CREATE INDEX "idx_bookings_user_id" ON "bookings" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_metro_lines_code" ON "metro_lines" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_station_connection_unique" ON "station_connections" USING btree ("from_station_id","to_station_id","line_id");--> statement-breakpoint
CREATE INDEX "idx_conn_from_station" ON "station_connections" USING btree ("from_station_id");--> statement-breakpoint
CREATE INDEX "idx_conn_to_station" ON "station_connections" USING btree ("to_station_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_station_line_unique" ON "station_lines" USING btree ("station_id","line_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_line_sequence_unique" ON "station_lines" USING btree ("line_id","sequence_order");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_stations_code" ON "stations" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_stations_name" ON "stations" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_tickets_number" ON "tickets" USING btree ("ticket_number");--> statement-breakpoint
CREATE INDEX "idx_tickets_booking_id" ON "tickets" USING btree ("booking_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_users_email" ON "users" USING btree ("email");