import type { JsonLdProps } from "./JsonLd.types.ts";

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      // eslint-disable-next-line @eslint-react/dom-no-dangerously-set-innerhtml -- JSON-LD must be inline; "<" is escaped so a value can't close the tag
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replaceAll("<", "\\u003c"),
      }}
      type="application/ld+json"
    />
  );
}
