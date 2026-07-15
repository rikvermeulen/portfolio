// SVGs imported with the `?react` query resolve to a React component, both in
// the Next build (`@svgr/webpack` turbopack rule in `next.config.ts`) and in
// Storybook (`vite-plugin-svgr` in `.storybook/main.ts`).
declare module "*.svg?react" {
  import type { FC, SVGProps } from "react";

  const ReactComponent: FC<
    SVGProps<SVGSVGElement> & { readonly title?: string }
  >;

  export default ReactComponent;
}
