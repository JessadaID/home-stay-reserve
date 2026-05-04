FROM node:20.19.0-alpine

# 1. ติดตั้ง dependencies ที่จำเป็นสำหรับ Prisma บน Alpine
RUN apk add --no-cache openssl

WORKDIR /app

# 2. Copy ไฟล์ package
COPY package*.json ./

# 3. ติดตั้ง library (ถ้ามีปัญหาเรื่องเน็ต ลองเพิ่ม --network-timeout)
RUN npm install

# 4. Copy โฟลเดอร์ prisma มาก่อนเพื่อทำ generate
# ตรวจสอบว่าในโฟลเดอร์มีไฟล์ schema.prisma อยู่จริงๆ
COPY prisma ./prisma/ 

# 5. สร้าง Prisma Client
RUN npx prisma generate

# 6. Copy โค้ดที่เหลือ
COPY . .

EXPOSE 3001

# 7. แนะนำให้ใช้ node server.js หรือดูใน package.json ว่ามี script ชื่อ dev ไหม
CMD ["npm", "run", "dev"]