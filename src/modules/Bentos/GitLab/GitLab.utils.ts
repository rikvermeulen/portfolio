import type {
  ContributionKind,
  ContributionShare,
} from "@/lib/contributions/index.ts";

import { ACTIVE_BOOST, KINDS, WINDOW_LABEL } from "./GitLab.const.ts";

const numberFormat = new Intl.NumberFormat("en");

/** @example formatCount(2449) // "2,449" */
export const formatCount = (count: number): string =>
  numberFormat.format(count);

/** @example describeShare({ kind: "pushes", count: 1393 }) // "1,393 pushes" */
export const describeShare = ({ kind, count }: ContributionShare): string =>
  `${formatCount(count)} ${KINDS[kind].label.toLowerCase()}`;

/** @example readoutFor("reviews") // "reviews in 3 months" */
export const readoutFor = (kind: ContributionKind | null): string =>
  `${kind ? KINDS[kind].label.toLowerCase() : "contributions"} ${WINDOW_LABEL}`;

/** Flex-grow weights: the count at rest, plus a slice of the bar while active. */
export const segmentGrow = (share: ContributionShare, total: number) => ({
  rest: share.count,
  active: share.count + total * ACTIVE_BOOST,
});

/** The rolling number at `progress` (0–1), easing out. */
export const rollValue = (from: number, to: number, progress: number): number =>
  Math.round(from + (to - from) * (1 - (1 - progress) ** 3));
