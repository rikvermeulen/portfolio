"use client";

import { useState } from "react";

import Glass from "@/components/Glass/index.ts";
import Icon from "@/components/Icon/index.ts";
import { notify } from "@/components/Toast/index.ts";

import { NUDGE_ENDPOINT, NUDGE_TOAST } from "./Plants.const.ts";

/**
 * Bottom-right nudge button — lets a visitor ping Rik that his plants need
 * care. Optimistically toasts on click, then fires a best-effort POST: a
 * notification hiccup must never make the button feel broken, so failures are
 * logged and the toast stays.
 */
const PlantsNudgeButton = () => {
  const [pending, setPending] = useState(false);

  async function nudgeRik(): Promise<void> {
    setPending(true);
    notify({ app: "plants", ...NUDGE_TOAST });

    try {
      const response = await fetch(NUDGE_ENDPOINT, { method: "POST" });
      if (!response.ok) {
        console.error("Plant nudge failed:", response.status);
      }
    } catch (error) {
      console.error("Plant nudge request failed:", error);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      aria-label="Let Rik know his plants need attention"
      disabled={pending}
      onClick={() => void nudgeRik()}
      type="button"
      className="absolute right-5 bottom-5 z-20 flex size-9 cursor-pointer items-center justify-center overflow-hidden rounded-full text-white"
    >
      <Glass intensity={2} radius={18} tint="none" className="bg-white/15" />
      <Icon iconClassName="relative z-10 size-4" name="bell" />
    </button>
  );
};

export default PlantsNudgeButton;
