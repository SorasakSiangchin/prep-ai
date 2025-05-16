"use client";

import Breadcrumb from "@/components/layout/breadcrumb/Breadcrumb";
import AppSiderbar from "@/components/layout/sidebar/AppSidebar";
import usePageTitle from "@/hooks/usePageTitle";
import { usePathname } from "next/navigation";
import React from "react";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { title, breadcrumb } = usePageTitle();

  const pathname = usePathname();

  const noBreadcrumbPaths = ["/app/interviews/conduct/"];

  // ถ้าค่า noBreadcrumbPaths มันไม่ตรงกับ pathname ให้ return เป็น true
  const showBreadcrumb = !noBreadcrumbPaths.some((route) =>
    pathname?.includes(route)
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-10">
      <div className="col-span-1 md:col-span-4 lg:col-span-3">
        <div className="">
          <AppSiderbar />
        </div>
      </div>
      <div className="col-span-1 md:col-span-8 lg:col-span-9">
        {showBreadcrumb && (
          <Breadcrumb title={title} breadcrumbs={breadcrumb} />
        )}
        {children}
      </div>
    </div>
  );
};

export default AppLayout;
