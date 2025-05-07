import withAuth from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";
import { IUser } from "./backend/models/user.model";

//#region ฟังก์ชัน withAuth ทำหน้าที่:
// ตรวจสอบการล็อกอิน -> ดักจับการร้องขอ (request) ก่อนจะไปถึงหน้าเพจและตรวจสอบว่าผู้ใช้ล็อกอินแล้วหรือไม่
// ควบคุมการเข้าถึง -> หากผู้ใช้ยังไม่ล็อกอิน จะนำทางไปยังหน้าล็อกอินโดยอัตโนมัติ
// จัดการสิทธิ์ -> สามารถกำหนดให้เข้าถึงได้เฉพาะผู้ใช้ที่มีบทบาท (role) หรือสิทธิ์ (permission) ที่กำหนด
//#endregion

export default withAuth(function middleware(req: any) {
  //   const url = req?.nextUrl?.pathname;
  //   const user = req?.nextauth?.token?.user as IUser;
  //   return NextResponse.next({
  //     request: req,
  //   });
});

export const config = {
  matcher: ["/app/:path*", "/app/interviews/:path*"],
};
