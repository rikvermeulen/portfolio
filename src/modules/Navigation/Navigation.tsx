import Tag from "@/components/Tag/index.ts";

import { sections } from "./Navigation.const.ts";

export default function Navigation() {
  return (
    <nav
      aria-label="Jump to section"
      className="content-container pb-8 md:pb-10"
    >
      <ul className="flex flex-wrap gap-2">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="inline-block rounded-2xl transition-transform duration-200 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-blue"
            >
              <Tag label={section.label} variant={section.variant} />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
