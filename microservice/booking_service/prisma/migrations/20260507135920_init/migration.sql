-- CreateTable
CREATE TABLE "booking" (
    "id" SERIAL NOT NULL,
    "room_id" INTEGER NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "customer_name" VARCHAR(100) NOT NULL,
    "check_in" DATE NOT NULL,
    "check_out" DATE NOT NULL,
    "total_price" DECIMAL(10,2),
    "payment_type" VARCHAR(20),
    "payment_status" VARCHAR(20) DEFAULT 'pending',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_pkey" PRIMARY KEY ("id")
);
