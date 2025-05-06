import { adminPages, appPages, nestedPages } from "@/constants/pages";
import { match } from "path-to-regexp";

interface PageTitle {
  title: string;
  breadcrumb: Array<{ name: string; path: string }>;
}

export const getPageTitle = (pathname: string): PageTitle => {
  const pagesToCheck = pathname?.includes("/admin")
    ? adminPages
    : [...appPages, ...nestedPages];

  // นำ page ที่เช็คไว้ก่อนหน้านี้มาวนลูป
  for (const page of pagesToCheck) {
    // decodeURIComponent => ฟังก์ชัน decodeURIComponent จะถูกใช้ในการถอดรหัส (decode) ค่าเหล่านั้นให้อยู่ในรูปแบบที่อ่านได้ตามปกติครับ
    const matcher = match(page.path, { decode: decodeURIComponent });

    if (matcher(pathname)) {
      return {
        title: page.title,
        breadcrumb: page.breadcrumb,
      };
    }
  }

  return {
    title: "Not Found",
    breadcrumb: [
      {
        name: "Not Found",
        path: pathname,
      },
    ],
  };
};
