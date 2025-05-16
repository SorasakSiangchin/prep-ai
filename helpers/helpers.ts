import { IQuestion } from "@/backend/models/interview.model";
import { pageIcons } from "@/constants/pages";

export function getPageIconAndPage(pathname: string): {
  icon: string;
  color: string;
} {
  return pageIcons[pathname];
}

// รูปแบบเวลา สำหรับทำแบบฝึกหัด interview (Duration Left)
export const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  // padStart(2, "0") => เติมตัวอักษร "0" ที่ด้านหน้าของสตริง
  return `${minutes?.toString().padStart(2, "0")}:${remainingSeconds
    ?.toString()
    .padStart(2, "0")}`;
};
