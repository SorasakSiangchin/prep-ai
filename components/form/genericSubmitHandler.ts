import { useState } from "react";

// Record => utility type ใน TypeScript ที่ใช้สำหรับกำหนดรูปแบบของ object โดยระบุชนิดของ key และ value
type submitCallback = (data: Record<string, string>) => Promise<any>;

export const useGenericSubmitHandler = (callback: submitCallback) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // คือการป้องกันไม่ให้เกิดพฤติกรรมเริ่มต้นของ event นั้น ๆ
    // พฤติกรรมเริ่มต้นคือ "การรีเฟรชและส่งข้อมูลของฟอร์มไปยังเซิร์ฟเวอร์" โดยอัตโนมัติ
    e.preventDefault();

    // currentTarget => จะอ้างถึง <form> element ที่เรากำหนดให้เรียกใช้งาน submitHandler อยู่ครับ
    const formData = new FormData(e.currentTarget);
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value as string;
    });

    setLoading(true);

    try {
      await callback(data);
    } catch (error) {
      console.error("Error submitting form:", error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return { handleSubmit, loading };
};
