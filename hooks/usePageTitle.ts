"use client";

import { getPageTitle } from "@/helpers/pageTitles";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// function นี้ทำหน้าที่ในการดึง title และ page เมื่อมีการเปลี่ยน page ใน website
const usePageTitle = () => {
  const [title, setTitle] = useState<string>("");
  const [breadcrumb, setBreadcrumb] = useState<
    Array<{ name: string; path: string }>
  >([]);

  const pathname = usePathname();

  useEffect(() => {
    const { title, breadcrumb } = getPageTitle(pathname);
    setTitle(title);
    setBreadcrumb(breadcrumb || [{ name: "Home", path: "/" }]);
  }, [pathname]);

  return { title, breadcrumb };
};

export default usePageTitle;
