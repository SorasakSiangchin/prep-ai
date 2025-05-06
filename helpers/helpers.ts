import { pageIcons } from "@/constants/pages";

export function getPageIconAndPage(pathname: string): {
  icon: string;
  color: string;
} {
  return pageIcons[pathname];
}
