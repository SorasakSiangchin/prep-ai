"use client";

import React from "react";
import { Button, Link } from "@heroui/react";
import { Icon } from "@iconify/react";

export default function HeaderAccouncement() {
  return (
    <div className="flex w-full items-center justify-center gap-x-3 border-b-1 border-divider bg-background/[0.15] px-6 py-2 backdrop-blur-xl sm:px-3.5">
      <p className="text-small text-foreground">
        <Link className="text-inherit text-sm" href="#">
          Prep Smarter, Succeed Faster – Your Interview Journey Starts
          Here!&nbsp;
        </Link>
      </p>
      <Button
        as={Link}
        className="group relative h-8 overflow-hidden bg-transparent text-small font-normal"
        color="default"
        endContent={
          // transition-transform => เพิ่มเอฟเฟกต์ transition เฉพาะกับการเปลี่ยนแปลงคุณสมบัติ transform เช่น scale, rotate, translate ทำให้การเปลี่ยนแปลงดูนุ่มนวลไม่กระตุก
          // group-data-[hover=true]:translate-x-0.5 => เลื่อน element ไปทางขวา 0.5 หน่วย (2px) เมื่อ parent element ที่มี class "group" มี data attribute "hover" ตั้งค่าเป็น "true"
          // [&>path]:stroke-[2] => กำหนดความหนาของเส้น stroke เป็น 2px สำหรับทุก element path ที่เป็นลูกโดยตรงของ element ปัจจุบัน
          <Icon
            className="flex-none outline-none transition-transform group-data-[hover=true]:translate-x-0.5 [&>path]:stroke-[2]"
            icon="solar:arrow-right-linear"
            width={14}
          />
        }
        href="/subscribe"
        style={{
          border: "solid 2px transparent",
          backgroundImage: `linear-gradient(hsl(var(--heroui-background)), hsl(var(--heroui-background))), linear-gradient(to right, #F871A0, #9353D3)`,
          backgroundOrigin: "border-box",
          backgroundClip: "padding-box, border-box",
        }}
        variant="bordered"
      >
        Go
      </Button>
    </div>
  );
}
