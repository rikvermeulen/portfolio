import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type { ClassValue } from "clsx";

export default function cc(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
