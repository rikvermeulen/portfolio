import type { ButtonSize, ButtonTone, ButtonVariant } from "./Button.types.ts";

/** Capsule geometry per size — text form. */
export const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-9 gap-1.5 px-4 text-sm",
  md: "h-12 gap-2 px-5 text-base",
  lg: "h-14 gap-2 px-7 text-lg",
};

/** Circular geometry per size — icon-only form. */
export const ICON_SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "size-9 text-base",
  md: "size-12 text-lg",
  lg: "size-14 text-xl",
};

/** Solid tint painted behind the glass for the `prominent` (filled) variant. */
export const FILL_CLASSES: Record<ButtonTone, string> = {
  neutral: "bg-ds-gray",
  accent: "bg-ds-blue dark:bg-ds-blue-dark",
  destructive: "bg-ds-red dark:bg-ds-red-dark",
};

/** Label colour per variant × tone. */
export const LABEL_CLASSES: Record<
  ButtonVariant,
  Record<ButtonTone, string>
> = {
  prominent: {
    neutral: "text-white",
    accent: "text-white",
    destructive: "text-white",
  },
  glass: {
    neutral: "text-black dark:text-white",
    accent: "text-ds-blue dark:text-ds-blue-dark",
    destructive: "text-ds-red dark:text-ds-red-dark",
  },
};
