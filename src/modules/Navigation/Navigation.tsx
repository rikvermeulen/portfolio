import Tag from "@/components/Tag/index.ts";

import { sections } from "./Navigation.const.ts";

export default function Navigation() {
  return (
    <nav aria-label="Jump to section" className="content-container">
      <ul className="flex flex-wrap gap-2">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="focus-ring inline-block rounded-2xl"
            >
              <Tag label={section.label} variant="rested" />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
