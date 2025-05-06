import { userRoles } from "@/constants/constants";
import mongoose, { Document } from "mongoose";
import bcrypt from "bcrypt"; // ใช้สำหรับเข้ารหัส password
import crypto from "crypto";

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  roles: string[];
  profilePicture: {
    id: string;
    url: string | null;
  };
  password: string;
  authProviders: {
    provider: string;
    providerId: string;
  }[];
  subscription: {
    id: string;
    customerId: string;
    created: Date;
    status: string;
    startDate: Date;
    currentPeriodEnd: Date; // วันหมดอายุของการสมัครสมาชิก
    nextPaymentAttempt: Date; // วันหมดอายุของการสมัครสมาชิกถัดไป
  };

  resetPasswordToken: String;

  resetPasswordExpire: Date;
}

const authProvidersSchema = new mongoose.Schema({
  provider: {
    type: String,
    required: true,
    enum: ["google", "github", "credentials"], // ค่าที่สามารถเก็บได้ใน provider มีแค่ "google", "github" และ "credentials" เท่านั้นครับ
  },
  providerId: {
    type: String,
    required: true,
  },
});

// user schema คือ โครงสร้างของข้อมูลที่เราจะเก็บในฐานข้อมูล MongoDB ครับ
const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Please enter your name."],
      trim: true, // ข้อความที่มี "ช่องว่าง" เกินจะถูกลบออกก่อนที่จะถูกเก็บในฐานข้อมูลครับ
    },
    email: {
      type: String,
      required: [true, "Please enter your email."],
      unique: [true, "Email already exists."], // ต้องไม่ซ้ำกันในฐานข้อมูลครับ
      trim: true,
      lowercase: true, // แปลงเป็นตัวพิมพ์เล็กทั้งหมดครับ
    },
    roles: {
      type: [String],
      default: ["user"], // ถ้าไม่มีการกำหนดค่าให้กับ roles จะถูกตั้งค่าเป็น ["user"]
      enum: userRoles, // ค่าที่สามารถเก็บได้ใน roles มีแค่ "user" และ "admin" เท่านั้นครับ
    },
    profilePicture: {
      id: String,
      url: {
        type: String,
        default: null, // ค่าเริ่มต้นเป็น null หากไม่มีการระบุค่าอื่นเข้ามา
      },
    },

    password: {
      type: String,
      select: false, // ไม่ให้แสดง password ในผลลัพธ์ของ query
      minLength: [8, "Password must be at least 8 characters."], // ความยาวของ password ต้องไม่น้อยกว่า 8 ตัวอักษร
      default: null,
    },

    authProviders: {
      type: [authProvidersSchema],
      default: [], // ค่าเริ่มต้นเป็น [] หากไม่มีการระบุค่าอื่นเข้ามา
    },

    subscription: {
      id: String,
      customerId: String,
      created: Date,
      status: String,
      startDate: Date,
      currentPeriodEnd: Date,
      nextPaymentAttempt: Date,
    },

    resetPasswordToken: String,

    resetPasswordExpire: Date,
  },
  {
    timestamps: true, // สร้าง createdAt และ updatedAt อัตโนมัติ
  }
);

//#region FIXME: encrypt password before saving to db
// Mongoose middleware ที่ทำงานก่อนคำสั่ง save จะถูกประมวลผล
userSchema.pre("save", async function (next) {
  // field 'password' ใน document ถูกแก้ไขหรือเปล่าในครั้งล่าสุดที่เรียกใช้ save()
  // FIXME: เมื่อเราแก้ไขข้อมูลอื่น ๆ ใน document แล้วเรียก save() ถ้าเราไม่ตรวจสอบว่า password ถูกแก้ไขหรือไม่ ระบบจะทำการเข้ารหัส password ใหม่ทุกครั้ง
  if (!this.isModified("password")) {
    next(); // ถ้า password ไม่ได้ถูกแก้ไข ก็ให้ไปที่ middleware ถัดไปได้เลย
  }

  if (this.password) {
    this.password = await bcrypt.hash(this.password, 10); // เข้ารหัส password ด้วย bcrypt
  }

  next();
});
//#endregion

//#region FIXME: เพิ่ม method ใน user schema สำหรับเปรียบเทียบ password ที่กรอกกับ password ที่เก็บในฐานข้อมูล

// สามารถเปลี่ยนชื่อ method นี้เป็นชื่ออื่นได้
userSchema.methods.comparePassword = async function (enteredPassword: string) {
  console.log("enteredPassword : ", enteredPassword);
  const match = await bcrypt.compare(enteredPassword, this.password);
  return match; // password ตรงกัน
};

//#endregion

//#region FIXME:
userSchema.methods.getResetPasswordToken = function (): string {
  // crypto.randomBytes(20) => สร้างข้อมูลแบบสุ่มที่มีความปลอดภัย
  // .toString("hex") => แปลง Buffer ให้เป็น string ในรูปแบบเลขฐานสิบหก
  const resetToken = crypto.randomBytes(20).toString("hex");

  // hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256") // สร้าง hash object ด้วยอัลกอริทึม SHA256
    .update(resetToken) // ป้อนข้อมูล
    .digest("hex"); //  คำนวณค่า hash ที่ได้และแปลงผลลัพธ์เป็น string ในรูปแบบเลขฐานสิบหก

  // set expire time
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes

  return resetToken;
};
//#endregion

// หากมีโมเดลที่ชื่อ "User" อยู่แล้ว ระบบจะใช้โมเดลนั้นแทนที่จะสร้างใหม่ด้วย
const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);
export default User;
