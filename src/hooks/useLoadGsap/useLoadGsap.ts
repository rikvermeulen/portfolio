/* istanbul ignore file */
"use client";

import { useEffect, useState } from "react";

export type Plugin =
  | "ScrollTrigger"
  | "Draggable"
  | "MotionPathPlugin"
  | "ScrollSmoother"
  | "Flip"
  | "Observer"
  | "SplitText"
  | "EaselPlugin"
  | "GSDevTools"
  | "InertiaPlugin";

const pluginMap = {
  ScrollTrigger: () => import("gsap/ScrollTrigger"),
  Draggable: () => import("gsap/Draggable"),
  MotionPathPlugin: () => import("gsap/MotionPathPlugin"),
  ScrollSmoother: () => import("gsap/ScrollSmoother"),
  Flip: () => import("gsap/Flip"),
  Observer: () => import("gsap/Observer"),
  SplitText: () => import("gsap/SplitText"),
  EaselPlugin: () => import("gsap/EaselPlugin"),
  GSDevTools: () => import("gsap/GSDevTools"),
  InertiaPlugin: () => import("gsap/InertiaPlugin"),
};

export const useLoadGsap = (enabled: boolean, plugins: Plugin[] = []) => {
  const [gsap, setGsap] = useState<GSAP | null>(null);
  const pluginsKey = plugins.join(",");

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const loadGsap = async () => {
      const { default: gsapModule } = await import("gsap");
      const pluginList = pluginsKey ? (pluginsKey.split(",") as Plugin[]) : [];

      const loadedPlugins = await Promise.all(
        pluginList.map((plugin) => pluginMap[plugin]?.()),
      );

      loadedPlugins.forEach(({ default: plugin }) => {
        gsapModule.registerPlugin(plugin);
      });

      setGsap(gsapModule);
    };

    loadGsap();
  }, [enabled, pluginsKey]);

  return gsap;
};
