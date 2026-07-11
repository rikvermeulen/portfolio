import { Fragment } from "react";

// Below ~0.5px the chromatic split is invisible, so the three-channel
// aberration collapses to a single displacement pass (~3× less filter work).
const MIN_CHROMA_SPLIT_PX = 0.5;

/** `feColorMatrix` values that keep only one RGB channel of a displaced pass. */
const CHANNEL_MATRIX = {
  red: "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0",
  green: "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0",
  blue: "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0",
} as const;

interface GlassFilterProps {
  readonly id: string;
  readonly feImageRef: React.RefObject<SVGFEImageElement | null>;
  /** Base pixel reach of the refraction. */
  readonly displacementScale: number;
  /** How far the red/blue channels split from green (chromatic aberration). */
  readonly chroma: number;
  readonly blur: number;
}

/**
 * The SVG filter behind the refraction. A per-instance displacement map —
 * written imperatively onto `<feImage>` by `useDisplacementFilter`, so resizes
 * cost no React re-render — drives three chromatic channels (each displaced by
 * a slightly different scale, splitting the colors at the edges), blended back
 * together with optional blur on top.
 */
export function GlassFilter({
  id,
  feImageRef,
  displacementScale,
  chroma,
  blur,
}: GlassFilterProps) {
  const splitChroma = chroma >= MIN_CHROMA_SPLIT_PX;
  const channels = [
    { channel: "red", scale: displacementScale + chroma },
    { channel: "green", scale: displacementScale },
    { channel: "blue", scale: displacementScale - chroma },
  ] as const;

  return (
    <svg aria-hidden="true" className="absolute h-0 w-0">
      <filter
        id={id}
        colorInterpolationFilters="sRGB"
        filterUnits="objectBoundingBox"
        height="100%"
        width="100%"
        x="0"
        y="0"
      >
        <feImage
          ref={feImageRef}
          preserveAspectRatio="none"
          result="map"
          x="0"
          y="0"
        />
        {splitChroma ? (
          <>
            {channels.map(({ channel, scale }) => (
              <Fragment key={channel}>
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="map"
                  result={channel}
                  scale={scale}
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
                <feColorMatrix
                  in={channel}
                  result={channel}
                  type="matrix"
                  values={CHANNEL_MATRIX[channel]}
                />
              </Fragment>
            ))}
            <feBlend in="red" in2="green" mode="screen" result="rg" />
            <feBlend in="rg" in2="blue" mode="screen" result="rgb" />
          </>
        ) : (
          <feDisplacementMap
            in="SourceGraphic"
            in2="map"
            result="rgb"
            scale={displacementScale}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        )}
        {/* stdDeviation=0 is a no-op, so the primitive is dropped for blur=0. */}
        {blur > 0 && <feGaussianBlur in="rgb" stdDeviation={blur} />}
      </filter>
    </svg>
  );
}
