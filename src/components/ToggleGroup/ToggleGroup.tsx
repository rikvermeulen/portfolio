"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { Tab, TabList, Tabs } from "react-aria-components";

import type { ToggleGroupProps } from "./ToggleGroup.types.ts";

import Glass from "@/components/Glass/index.ts";
import Icon from "@/components/Icon/index.ts";
import classnames from "@/utils/classnames/classnames.ts";

export default function ToggleGroup<T extends string = string>({
  options,
  value,
  onChange,
  className,
}: ToggleGroupProps<T>) {
  const pillId = useId();

  return (
    <Tabs
      onSelectionChange={(key) => onChange(key as T)}
      selectedKey={value}
      className={classnames(
        "group relative inline-flex items-center overflow-hidden rounded-full p-1",
        className,
      )}
    >
      <Glass intensity={1} radius={999} tint="adaptive" />
      <TabList
        aria-label="Toggle group"
        className="relative z-10 inline-flex items-center"
      >
        {options.map((opt) => {
          const isActive = opt.value === value;
          return (
            <Tab
              key={opt.value}
              id={opt.value}
              className={classnames(
                "group relative flex min-w-15 cursor-pointer items-center justify-center rounded-full px-2.5 py-1 transition-transform duration-100 outline-none active:scale-95",
                isActive ? "text-blue-600" : "text-black",
              )}
            >
              {isActive && (
                <motion.div
                  layoutId={pillId}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="absolute inset-0 overflow-hidden rounded-full"
                >
                  <Glass
                    intensity={2}
                    radius={999}
                    tint="adaptive"
                    className="bg-black/30 dark:bg-white/30"
                  />
                </motion.div>
              )}
              <span className="relative z-10">
                {opt.icon ? (
                  <span className="flex flex-col items-center dark:text-white">
                    <Icon
                      iconClassName="size-4.5"
                      label={opt.label}
                      name={opt.icon}
                    />
                    <span className="-mt-px text-[8px] font-medium">
                      {opt.label}
                    </span>
                  </span>
                ) : (
                  opt.label
                )}
              </span>
            </Tab>
          );
        })}
      </TabList>
    </Tabs>
  );
}
