import dbConnect from "@/backend/config/dbConnect";
import User from "@/backend/models/user.model";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

//#region TODO: ขั้นตอนการทำงานของ next auth
// 1. ผู้ใช้ล็อกอิน
// 2. callback jwt ทำงานก่อน และปรับแต่ง token
// 3. token ที่ได้จาก callback jwt จะถูกเข้ารหัสและเก็บเป็น JWT
// 4. เมื่อมีการขอข้อมูล session, JWT จะถูกถอดรหัสกลับมาเป็น token object
// 5. token object นี้จะถูกส่งเข้า callback session พร้อมกับ session object มาตรฐาน
// 6. callback session ปรับแต่ง session โดยใช้ข้อมูลจาก token
//#endregion

const options = {
  providers: [
    // ผู้ให้บริการการยืนยันตัวตนที่ช่วยให้คุณสามารถล็อกอินผู้ใช้ด้วยชื่อผู้ใช้และรหัสผ่าน (หรือข้อมูลประจำตัวอื่นๆ) ที่คุณกำหนดเอง
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          type: "email",
        },
        password: {
          type: "password",
        },
      },

      authorize: async (credentials) => {
        console.log("credentials : ", credentials);
        await dbConnect();

        const user = await User.findOne({
          email: credentials?.email,
        }).select("+password"); // select password field

        if (!user) {
          throw new Error("Invalid email.");
        }

        console.log("user : ", user);

        const isPasswordMatched = await user.comparePassword(
          credentials?.password
        );

        if (!isPasswordMatched) {
          throw new Error("Invalid password.");
        }

        return user;
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    // ทำงานตอนที่กระบวนการล็อกอินกำลังดำเนินการแต่ยังไม่เสร็จสมบูรณ์
    //#region <หน้าที่หลักของ signIn callback>
    // * ตรวจสอบและควบคุมกระบวนการล็อกอิน -> ทำงานหลังจากการยืนยันตัวตนสำเร็จแต่ก่อนที่จะสร้าง session
    // * อนุญาตหรือปฏิเสธการล็อกอิน -> คุณสามารถตรวจสอบเงื่อนไขเพิ่มเติมและอนุญาตหรือปฏิเสธการล็อกอินได้
    // * ปรับแต่งการล็อกอิน -> เช่น บันทึกข้อมูลการล็อกอิน, ตรวจสอบสิทธิ์, หรือเปลี่ยนเส้นทางการไปหลังล็อกอิน
    //#endregion
    signIn: async ({ user, account, profile }: any) => {
      await dbConnect();

      if (account?.provider === "credentials") {
        user.id = user?._id;
      } else {
        console.log("user : ", user);
        console.log("account : ", account);
        console.log("profile : ", profile);

        // handle social login
        const existingUser = await User.findOne({ email: user?.email });

        // ถ้าไม่เจอ user
        if (!existingUser) {
          const newUser = new User({
            email: user?.email,
            name: user?.name,
            profilePicture: {
              url: profile?.image || user?.image,
            },
            authProviders: [
              {
                provider: account?.provider,
                providerId: profile?.id || profile?.sub,
              },
            ],
          });

          await newUser.save(); // บันทึกผู้ใช้ใหม่ลงในฐานข้อมูล
          user.id = newUser._id;
        } else {
          // กรณีที่มีผู้ใช้ที่มีอยู่แล้ว

          // ตรวจสอบว่าผู้ใช้มี provider นี้อยู่แล้วหรือไม่
          const existingProvider = existingUser.authProviders.find(
            (provider: { provider: string }) => {
              return provider?.provider === account?.provider;
            }
          );

          // ถ้าไม่มี provider นี้ ให้เพิ่มเข้าไปใน authProviders
          if (!existingProvider) {
            existingUser.authProviders.push({
              provider: account?.provider,
              providerId: profile?.id || profile?.sub,
            });

            if (!existingUser.profilePicture.url) {
              existingUser.profilePicture = {
                url: profile?.image || user?.image,
              };
            }

            await existingUser.save(); // อัปเดตผู้ใช้ที่มีอยู่แล้ว
          }
          user.id = existingUser._id;
        }
      }

      return true; // อนุญาตให้ล็อกอิน
    },

    // ทำงานเมื่อมีการสร้างหรืออัปเดต JWT token
    // token => (token ปัจจุบัน)
    // user => (ข้อมูลผู้ใช้จากการล็อกอิน)
    jwt: async ({ token, user, trigger }: any) => {
      console.log("user jwt callbacks : ", user);

      if (user) {
        token.user = user;
      } else {
        await dbConnect();
        const dbUser = await User.findById(token.user.id);
        if (dbUser) {
          token.user = dbUser;
        }
      }

      if (trigger === "update") {
        let updatedUser = await User.findById(token.user._id);

        token.user = updatedUser;
      }

      return token;
    },

    // ทำงานทุกครั้งที่มีการเรียกข้อมูล session
    session: async ({ session, token }: any) => {
      console.log("token session callbacks : ", token);

      session.user = token.user;

      delete session.user.password; // ลบ password ออกจาก session เพื่อความปลอดภัย

      return session;
    },
  },

  //#region คำอธิบาย session
  // - กำหนดให้ใช้ JWT (JSON Web Tokens) เป็นกลไกในการจัดการเซสชัน
  // - เก็บข้อมูลผู้ใช้ไว้ในโทเค็นแทนที่จะเก็บใน database
  // - ช่วยให้เซสชันทำงานได้ดีกับ serverless functions และมีประสิทธิภาพมากขึ้น
  //#endregion
  session: {
    strategy: "jwt" as const,
  },
  //#region คำอธิบาย pages
  // - กำหนดเส้นทาง URL สำหรับหน้าล็อกอินแบบกำหนดเอง
  // - แทนที่จะใช้หน้าล็อกอินมาตรฐานของ NextAuth ระบบจะเปลี่ยนเส้นทางไปที่ "/login"
  // - ช่วยให้คุณสามารถออกแบบและควบคุมหน้าล็อกอินได้เอง
  //#endregion
  pages: {
    signIn: "/login",
  },
  //#region คำอธิบาย secret
  // - กำหนดคีย์ลับที่ใช้ในการเข้ารหัสโทเค็นและคุกกี้
  // - จำเป็นสำหรับการลงนามใน JWT และการเข้ารหัสข้อมูลเซสชัน
  // - ควรเก็บไว้ในตัวแปรสภาพแวดล้อมเพื่อความปลอดภัย
  //#endregion
  secret: process.env.NEXTAUTH_SECRET,
};

export const GET = NextAuth(options);
export const POST = NextAuth(options);
