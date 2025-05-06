import { create } from "domain";
import dbConnect from "../config/dbConnect";
import User, { IUser } from "../models/user.model";
import { catchAsyncErrors } from "../midlewares/catchAsyncErrors";
import { delete_file, upload_file } from "../utils/cloudinary";
import { resetPasswordHTMLTemplete } from "../utils/emailTemplete";
import sendEmail from "../utils/sendEmail";
import crypto from "crypto";

export const register = catchAsyncErrors(
  async (name: string, email: string, password: string) => {
    await dbConnect();

    //await new Promise((resolve) => setTimeout(resolve, 5000)); // Simulate a delay

    const newUser = await User.create({
      name,
      email,
      password,
      authProviders: [
        {
          provider: "credentials",
          providerId: email,
        },
      ],
    });

    return newUser._id
      ? {
          created: true,
        }
      : (() => {
          throw new Error("User not created.");
        })();
  }
);

// update profile
export const updateUserProfile = catchAsyncErrors(
  async ({
    name,
    userEmail,
    avatar,
    oldAvatar,
  }: {
    name: string;
    userEmail: string;
    avatar?: string;
    oldAvatar?: string;
  }) => {
    await dbConnect();

    const data: {
      name: string;
      profilePicture?: {
        id: string;
        url: string;
      };
    } = {
      name,
    };

    // ถ้ามี avatar ให้ส่งไป upload
    if (avatar) {
      data.profilePicture = await upload_file(avatar, "prep-ai/avatars");

      // ถ้ามี avatar อันเก่าให้ลบออกด้วย
      if (oldAvatar) {
        await delete_file(oldAvatar);
      }
    }

    // ค้นหา user จาก email จากนั้นนำข้อมูลที่ส่งมาทำการ update
    await User.findOneAndUpdate({ email: userEmail }, { ...data });

    // ส่งค่าออกไป
    return {
      updated: true,
    };
  }
);

// update password
export const updateUserPassword = catchAsyncErrors(
  async ({
    newPassword,
    confirmPassword,
    userEmail,
  }: {
    newPassword: string;
    confirmPassword: string;
    userEmail: string;
  }) => {
    await dbConnect();

    const user = (await User.findOne({ email: userEmail }).select(
      "+password"
    )) as IUser;

    // ตรวจสอบว่า "password" ตรงกันหรือไม่
    if (newPassword !== confirmPassword) {
      throw new Error("Password do not match.");
    }

    if (!user) {
      throw new Error("User not found.");
    }

    // กรณีที่ user ไม่มีการ login ด้วย credentials
    if (
      !user?.authProviders.some(
        (provider: { provider: string }) => provider.provider === "credentials"
      )
    ) {
      user?.authProviders.push({
        provider: "credentials",
        providerId: userEmail,
      });
    }

    user.password = newPassword;
    await user.save();

    return {
      updated: true,
    };
  }
);

// function สำหรับคนลืมรหัสผ่าน
export const forgotUserPassword = catchAsyncErrors(async (email: string) => {
  await dbConnect();

  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found.");
  }

  const resetToken = user.getResetPasswordToken();
  await user.save();

  const resetUrl = `${process.env.API_URL}/password/reset/${resetToken}`;
  const message = resetPasswordHTMLTemplete(user?.name, resetUrl);

  try {
    await sendEmail({
      email: user?.email,
      subject: "Prep AI Password reset request.",
      message,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    throw new Error("Email could not be sent.");
  }

  return {
    emailSent: true,
  };
});

// วัตถุประสงค์เพื่อรีเซ็ตรหัสผ่านของผู้ใช้ในกรณีที่ผู้ใช้ร้องขอรีเซ็ตรหัสผ่าน
export const resetUserPassword = catchAsyncErrors(
  async (token: string, password: string, confirmPassword: string) => {
    await dbConnect();

    // hash token and set to resetPasswordToken field
    const resetPasswordToken = crypto
      .createHash("sha256") // สร้าง hash object ด้วยอัลกอริทึม SHA256
      .update(token) // ป้อนข้อมูล
      .digest("hex"); //  คำนวณค่า hash ที่ได้และแปลงผลลัพธ์เป็น string ในรูปแบบเลขฐานสิบหก

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }, // ค้นหา resetPasswordExpire ทีมากกว่า "ปัจจุบัน"
    });

    if (!user) {
      throw new Error("Invalid token or token expired.");
    }

    if (password !== confirmPassword) {
      throw new Error("Password do not match.");
    }
    user.password = password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return {
      passwordUpdated: true,
    };
  }
);
