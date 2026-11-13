"use client";

import { useEffect, useRef } from "react";

import type { GitLabProps } from "./GitLab.types.ts";
import type { ContributionShare } from "@/lib/contributions/index.ts";

import Bento, { bentos } from "@/components/Bento/index.ts";
import Glass from "@/components/Glass/index.ts";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion/index.ts";
import { RADIUS } from "@/lib/radius/index.ts";
import classnames from "@/utils/classnames/index.ts";

import { HOVER_INTENT_MS, KINDS, ROLL_MS } from "./GitLab.const.ts";
import {
  describeShare,
  formatCount,
  readoutFor,
  rollValue,
  segmentGrow,
} from "./GitLab.utils.ts";

const MOTION =
  "transition-[flex-grow,opacity] duration-500 ease-fluid starting:opacity-0";
const DIM_OTHERS =
  "group-data-highlighting/breakdown:opacity-40 group-data-highlighting/breakdown:data-active:opacity-100";

/** GitLab activity of the last three months, split by kind of work. */
const GitLab = ({ sizeKey, breakdown, href }: GitLabProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);
  const readoutRef = useRef<HTMLParagraphElement>(null);
  const shownRef = useRef(breakdown.total);
  const activeRef = useRef<ContributionShare | null>(null);
  const frameRef = useRef(0);
  const intentRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const prefersReducedMotion = usePrefersReducedMotion();

  const shares = breakdown.shares.filter((share) => share.count > 0);

  useEffect(
    () => () => {
      cancelAnimationFrame(frameRef.current);
      clearTimeout(intentRef.current);
    },
    [],
  );

  const shareAt = (target: EventTarget | null) => {
    const kind =
      target instanceof Element
        ? target.closest<HTMLElement>("[data-kind]")?.dataset.kind
        : undefined;
    return shares.find((share) => share.kind === kind) ?? null;
  };

  // Highlighting writes to the DOM directly, so hovering never re-renders.
  const rollTo = (target: number) => {
    cancelAnimationFrame(frameRef.current);
    const from = shownRef.current;
    const start = performance.now();

    const step = (now: number) => {
      const progress = prefersReducedMotion
        ? 1
        : Math.min((now - start) / ROLL_MS, 1);
      shownRef.current = rollValue(from, target, progress);
      if (numberRef.current) {
        numberRef.current.textContent = formatCount(shownRef.current);
      }
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      }
    };
    frameRef.current = requestAnimationFrame(step);
  };

  const highlight = (share: ContributionShare | null) => {
    const root = rootRef.current;
    if (!root || share?.kind === activeRef.current?.kind) {
      return;
    }
    activeRef.current = share;

    root.toggleAttribute("data-highlighting", share !== null);
    for (const element of root.querySelectorAll<HTMLElement>("[data-kind]")) {
      element.toggleAttribute(
        "data-active",
        element.dataset.kind === share?.kind,
      );
    }
    if (readoutRef.current) {
      readoutRef.current.textContent = readoutFor(share?.kind ?? null);
    }
    rollTo(share?.count ?? breakdown.total);
  };

  // Hover intent: a widening segment shifts its neighbours under a resting cursor.
  const highlightSoon = (share: ContributionShare | null) => {
    clearTimeout(intentRef.current);
    intentRef.current = setTimeout(() => highlight(share), HOVER_INTENT_MS);
  };

  const handlePointerOver = (event: React.PointerEvent<HTMLDivElement>) => {
    const share = shareAt(event.target);
    if (share) {
      highlightSoon(share);
    }
  };

  const handlePointerLeave = () => highlightSoon(null);

  const handleLegendSelect = (event: React.SyntheticEvent<HTMLButtonElement>) =>
    highlight(shareAt(event.currentTarget));

  const handleLegendBlur = () => highlight(null);

  return (
    <Bento
      app="gitlab"
      href={href}
      sizes={bentos[sizeKey].sizes}
      className="flex flex-col justify-between border border-ds-border bg-white p-5 dark:border-ds-border-dark dark:bg-black"
    >
      <header className="flex flex-col pr-10">
        <h2 className="bento-display text-black tabular-nums dark:text-white">
          <span className="sr-only">GitLab: </span>
          <span ref={numberRef}>{formatCount(breakdown.total)}</span>
        </h2>
        <p ref={readoutRef} className="bento-body truncate text-ds-gray">
          {readoutFor(null)}
        </p>
      </header>

      <div
        ref={rootRef}
        onPointerLeave={handlePointerLeave}
        onPointerOver={handlePointerOver}
        className="group/breakdown flex flex-col gap-4"
      >
        {/* eslint-disable-next-line jsx-a11y/prefer-tag-over-role -- a DOM-built chart; role="img" names its segments as one graphic */}
        <div
          aria-label={
            shares.map(describeShare).join(", ") || "No contributions"
          }
          role="img"
          className="flex h-9 gap-1"
        >
          {shares.length > 0 ? (
            shares.map((share) => {
              const grow = segmentGrow(share, breakdown.total);
              return (
                <span
                  key={share.kind}
                  data-kind={share.kind}
                  style={
                    {
                      "--grow": grow.rest,
                      "--grow-active": grow.active,
                    } as React.CSSProperties
                  }
                  className={classnames(
                    "relative min-w-2 grow-(--grow) basis-0 overflow-hidden rounded-field data-active:grow-(--grow-active) starting:grow-0",
                    MOTION,
                    DIM_OTHERS,
                    KINDS[share.kind].className,
                  )}
                >
                  <Glass intensity={0.05} radius={RADIUS.field} tint="none" />
                </span>
              );
            })
          ) : (
            <span className="grow rounded-field bg-ds-bubble dark:bg-ds-bubble-dark" />
          )}
        </div>

        <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
          {shares.map((share) => (
            <li key={share.kind}>
              <button
                data-kind={share.kind}
                onBlur={handleLegendBlur}
                onClick={handleLegendSelect}
                onFocus={handleLegendSelect}
                type="button"
                className={classnames(
                  "bento-body focus-ring flex w-full min-w-0 cursor-pointer items-center gap-1.5 rounded-field py-0.5 text-left",
                  MOTION,
                  DIM_OTHERS,
                )}
              >
                <span
                  aria-hidden="true"
                  className={classnames(
                    "size-2 shrink-0 rounded-full",
                    KINDS[share.kind].className,
                  )}
                />
                <span className="truncate text-black dark:text-white">
                  {KINDS[share.kind].label}
                </span>
                <span className="ml-auto text-ds-gray tabular-nums">
                  {formatCount(share.count)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Bento>
  );
};

export default GitLab;
