import type { BentoSizedProps } from "@/components/Bento/index.ts";
import type { ContributionBreakdown } from "@/lib/contributions/index.ts";

export interface GitLabProps extends BentoSizedProps {
  readonly breakdown: ContributionBreakdown;
  /** The GitLab profile the app icon links to. */
  readonly href: string;
}

export interface KindStyle {
  readonly label: string;
  /** Fill for the bar segment and the legend dot. */
  readonly className: string;
}
