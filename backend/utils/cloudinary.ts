import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CIOULDINARY_CLOUD_NAME,
  api_key: process.env.CIOULDINARY_API_KEY,
  api_secret: process.env.CIOULDINARY_API_SECRET,
});

const upload_file = (
  file: string,
  folder: string
): Promise<{ id: string; url: string }> => {
  // คือการสร้าง Promise ใหม่ใน JavaScript ซึ่งใช้สำหรับจัดการงานที่ทำแบบ asynchronous โดยใน callback function ที่ส่งเข้ามาจะมีสองพารามิเตอร์:
  // * resolve: ฟังก์ชันที่ใช้ส่งค่ากลับเมื่อ asynchronous operation สำเร็จ
  // * reject: ฟังก์ชันที่ใช้ส่ง error หรือแจ้งว่า asynchronous operation ล้มเหลว
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.upload(
      file,
      {
        // การตรวจสอบและระบุชนิดของไฟล์โดยอัตโนมัติ ไม่ว่าจะเป็นไฟล์ภาพ, วิดีโอ, หรือไฟล์ชนิดอื่น ๆ
        resource_type: "auto",
        folder,
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error("Upload failed"));
        }

        const { public_id, secure_url } = result;

        return resolve({
          id: public_id,
          url: secure_url,
        });
      }
    );
  });
};

const delete_file = async (publicId: string): Promise<boolean> => {
  const res = await cloudinary.v2.uploader.destroy(publicId);

  if (res?.result === "ok") {
    return true;
  }
  return false;
};

export { upload_file, delete_file };
