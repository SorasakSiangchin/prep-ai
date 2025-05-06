import mongoose from "mongoose"; // mongoose คือไลบรารี ODM (Object-Document Mapper) สำหรับ MongoDB

// set mongo db url
// ! => คือ ตัวแปรนั้นจะไม่เป็น null หรือ undefined แน่นอน
const MONGODB_URL =
  process.env.NODE_ENV === "development"
    ? process.env.MONGODB_URL_DEV!
    : process.env.MONGODB_URL_PRD!;

// ถ้าไม่มี MONGODB_URL ให้ throw error
if (!MONGODB_URL) {
  throw new Error("No MONGODB_URL provided.");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// เป็นการประกาศตัวแปร mongoose บน global เพื่อให้ TypeScript รู้จักตัวแปรนี้
declare global {
  var mongoose: MongooseCache;
}

let cached = global.mongoose;

if (!cached) {
  //  cached และ global.mongoose จะชี้ไปที่ออบเจ็คเดียวกันคือ { conn: null, promise: null }
  cached = global.mongoose = { conn: null, promise: null };
}

// function connect to mongo db
const dbConnect = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URL).then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

export default dbConnect;
