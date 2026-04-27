-- SQL Schema Export
-- Generated: 2026-03-02T06:29:43.988Z

CREATE TABLE `Admin` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE `Customer` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20)
);

CREATE TABLE `System_Config` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `config_key` VARCHAR(255) UNIQUE NOT NULL,
  `config_value` VARCHAR(255) NOT NULL
);

CREATE TABLE `Room` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `price` DECIMAL(10, 2) NOT NULL,
  `capacity` INTEGER,
  `size` INTEGER,
  `amenities` TEXT
);

CREATE TABLE `Image` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `room_id` INTEGER NOT NULL,
  `url` VARCHAR(255) NOT NULL,
  `description` TEXT,
  CONSTRAINT `fk_Image_room_id` FOREIGN KEY (`room_id`) REFERENCES `Room` (`id`)
);

CREATE TABLE `Map` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `image_url` VARCHAR(255) NOT NULL
);



CREATE TABLE `Booking` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `room_id` INTEGER NOT NULL,
  `customer_id` INTEGER NOT NULL,
  `customer_name` VARCHAR(100) NOT NULL,
  `check_in` DATE NOT NULL,
  `check_out` DATE NOT NULL,
  `total_price` DECIMAL(10, 2),
  `payment_type` VARCHAR(20),
  `payment_status` VARCHAR(20) DEFAULT 'pending',
  `created_at` TEXT DEFAULT (datetime('now')),
  CONSTRAINT `fk_Booking_room_id` FOREIGN KEY (`room_id`) REFERENCES `Room` (`id`),
  CONSTRAINT `fk_Booking_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `Customer` (`id`)
);

CREATE TABLE `Login` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `customer_id` INTEGER,
  `admin_id` INTEGER,
  `login_time` TIMESTAMP NOT NULL,
  CONSTRAINT `fk_Login_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `Customer` (`id`),
  CONSTRAINT `fk_Login_admin_id` FOREIGN KEY (`admin_id`) REFERENCES `Admin` (`id`)
);

CREATE TABLE `Marker` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `map_id` INTEGER NOT NULL,
  `room_id` INTEGER NOT NULL UNIQUE,
  `x_coordinate` DECIMAL(5, 2) NOT NULL,
  `y_coordinate` DECIMAL(5, 2) NOT NULL,
  CONSTRAINT `fk_Marker_map_id` FOREIGN KEY (`map_id`) REFERENCES `Map` (`id`),
  CONSTRAINT `fk_Marker_room_id` FOREIGN KEY (`room_id`) REFERENCES `Room` (`id`)
);

CREATE TABLE `Holiday` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `holiday_date` DATE NOT NULL,
  `description` VARCHAR(255)
);