import nodemailer from "nodemailer";

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
}

// เมื่อ import โมดูลนี้ คุณสามารถตั้งชื่อใหม่ให้กับฟังก์ชันตามที่ต้องการได้
// import sendEmail from "@/backend/utils/sendEmail";

export default async (options: EmailOptions) => {
  // กำหนดการตั้งค่า สำหรับการส่งอีเมลออกไป
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for port 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email, // ที่อยู่อีเมลของผู้รับ
    subject: options.subject, // หัวข้อของอีเมล
    html: options.message, // เนื้อความของอีเมล
  };

  await transporter.sendMail(message);
};
