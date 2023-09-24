export default function DarkMode({ className, ...props }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      id="colorMode"
      {...props}
      shapeRendering="geometricPrecision"
    >
      <defs>
        <mask id="mask" x="0" y="0" width="400" height="400">
          <rect x="0" y="0" width="400" height="400" fill="#fff" />
          <path
            d="M 200 375 A 175 175 0 0 1 200 25"
            fill="#000"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M 200 100 A 100 100 180 0 1 200 300"
            fill="#000"
            vectorEffect="non-scaling-stroke"
          />
        </mask>
      </defs>
      <circle
        r="195"
        cx="200"
        cy="200"
        fill="white"
        mask="url(#mask)"
        vectorEffect="non-scaling-stroke"
      />
      <path d="M 200 300 A 100 100 0 0 1 200 100" fill="#FFF" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
