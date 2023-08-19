export default function Minus({ className, ...props }: { className?: string }) {
  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      width="32.2266"
      height="3.53516"
      {...props}
      className={className}
      viewBox="0 0 32.2266 3.53516"
    >
      <g>
        <rect height="3.53516" opacity="0" width="32.2266" x="0" y="0" />
        <path d="M1.73828 3.53516L30.4883 3.53516C31.4258 3.53516 32.2266 2.73438 32.2266 1.77734C32.2266 0.820312 31.4258 0.0390625 30.4883 0.0390625L1.73828 0.0390625C0.800781 0.0390625 0 0.820312 0 1.77734C0 2.73438 0.800781 3.53516 1.73828 3.53516Z" />
      </g>
    </svg>
  );
}
