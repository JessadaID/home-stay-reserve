CREATE TABLE IF NOT EXISTS "Admin" (
  "id" SERIAL PRIMARY KEY,
  "username" VARCHAR(50) NOT NULL,
  "password" VARCHAR(255) NOT NULL,
  "email" VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "Customer" (
  "id" SERIAL PRIMARY KEY,
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "password" VARCHAR(255) NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "phone" VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS "System_Config" (
  "id" SERIAL PRIMARY KEY,
  "config_key" VARCHAR(255) UNIQUE NOT NULL,
  "config_value" VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS "Room" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "price" DECIMAL(10, 2) NOT NULL,
  "capacity" INTEGER,
  "size" INTEGER,
  "amenities" TEXT,
  "images" TEXT,
  "payment_option" VARCHAR(20),
  "deposit_percentage" INTEGER
);

CREATE TABLE IF NOT EXISTS "Booking" (
  "id" SERIAL PRIMARY KEY,
  "room_id" INTEGER NOT NULL,
  "customer_id" INTEGER NOT NULL,
  "customer_name" VARCHAR(100) NOT NULL,
  "check_in" DATE NOT NULL,
  "check_out" DATE NOT NULL,
  "total_price" DECIMAL(10, 2),
  "payment_type" VARCHAR(20),
  "payment_status" VARCHAR(20) DEFAULT 'pending',
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "fk_Booking_room_id" FOREIGN KEY ("room_id") REFERENCES "Room" ("id"),
  CONSTRAINT "fk_Booking_customer_id" FOREIGN KEY ("customer_id") REFERENCES "Customer" ("id")
);

CREATE TABLE IF NOT EXISTS "Login" (
  "id" SERIAL PRIMARY KEY,
  "customer_id" INTEGER,
  "admin_id" INTEGER,
  "login_time" TIMESTAMP NOT NULL,
  CONSTRAINT "fk_Login_customer_id" FOREIGN KEY ("customer_id") REFERENCES "Customer" ("id"),
  CONSTRAINT "fk_Login_admin_id" FOREIGN KEY ("admin_id") REFERENCES "Admin" ("id")
);

CREATE TABLE IF NOT EXISTS "Holiday" (
  "id" SERIAL PRIMARY KEY,
  "holiday_date" DATE NOT NULL,
  "description" VARCHAR(255)
);