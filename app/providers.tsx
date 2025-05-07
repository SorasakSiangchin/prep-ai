"use client";

import {
  ThemeProvider as NextThemeProvider,
  ThemeProviderProps,
} from "next-themes";
import React from "react";
import { HeroUIProvider } from "@heroui/react";
import { SessionProvider } from "next-auth/react";
import { useRouter } from "next/navigation";

type ProvidersProps = {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
};

const Providers = ({ children, themeProps }: ProvidersProps) => {
  const route = useRouter();
  return (
    // TODO: การส่ง navigate={route.push} เข้ามาช่วยให้คอมโพเนนต์ที่ใช้งาน HeroUIProvider มีความสามารถในการนำทาง (routing) โดยใช้ Next.js router ครับ
    <HeroUIProvider navigate={route.push}>
      <NextThemeProvider {...themeProps}>
        <SessionProvider>{children}</SessionProvider>
      </NextThemeProvider>
    </HeroUIProvider>
  );
};

export default Providers;
