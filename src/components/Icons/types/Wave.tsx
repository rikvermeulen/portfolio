export default function Wave({ className, ...props }: { className?: string }) {
  return (
    <svg
      id="wave"
      data-name="Layer 1"
      viewBox="0 0 50 38.05"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        id="Line_1"
        d="M0.91,15L0.78,15A1,1,0,0,0,0,16v6a1,1,0,1,0,2,0s0,0,0,0V16a1,1,0,0,0-1-1H0.91Z"
        data-name="Line 1"
        style={{
          animation: `pulse-waves 1s infinite`,
          animationDelay: `0.15s`,
        }}
      />
      <path
        id="Line_2"
        d="M6.91,9L6.78,9A1,1,0,0,0,6,10V28a1,1,0,1,0,2,0s0,0,0,0V10A1,1,0,0,0,7,9H6.91Z"
        data-name="Line 2"
        style={{ animation: `pulse-waves 1s infinite`, animationDelay: `0.3s` }}
      />
      <path
        id="Line_3"
        d="M12.91,0L12.78,0A1,1,0,0,0,12,1V37a1,1,0,1,0,2,0s0,0,0,0V1a1,1,0,0,0-1-1H12.91Z"
        data-name="Line 3"
        style={{
          animation: `pulse-waves 1s infinite`,
          animationDelay: `0.45s`,
        }}
      />
      <path
        id="Line_4"
        d="M18.91,10l-0.12,0A1,1,0,0,0,18,11V27a1,1,0,1,0,2,0s0,0,0,0V11a1,1,0,0,0-1-1H18.91Z"
        data-name="Line 4"
        style={{ animation: `pulse-waves 1s infinite`, animationDelay: `1s` }}
      />
      <path
        id="Line_5"
        d="M24.91,15l-0.12,0A1,1,0,0,0,24,16v6a1,1,0,0,0,2,0s0,0,0,0V16a1,1,0,0,0-1-1H24.91Z"
        data-name="Line 5"
        style={{
          animation: `pulse-waves 1s infinite`,
          animationDelay: `1.15s`,
        }}
      />
      <path
        id="Line_6"
        d="M30.91,10l-0.12,0A1,1,0,0,0,30,11V27a1,1,0,1,0,2,0s0,0,0,0V11a1,1,0,0,0-1-1H30.91Z"
        data-name="Line 6"
        style={{ animation: `pulse-waves 1s infinite`, animationDelay: `1.3s` }}
      />
      <path
        id="Line_7"
        d="M36.91,0L36.78,0A1,1,0,0,0,36,1V37a1,1,0,1,0,2,0s0,0,0,0V1a1,1,0,0,0-1-1H36.91Z"
        data-name="Line 7"
        style={{
          animation: `pulse-waves 1s infinite`,
          animationDelay: `1.45s`,
        }}
      />
      <path
        id="Line_8"
        d="M42.91,9L42.78,9A1,1,0,0,0,42,10V28a1,1,0,1,0,2,0s0,0,0,0V10a1,1,0,0,0-1-1H42.91Z"
        data-name="Line 8"
        style={{ animation: `pulse-waves 1s infinite`, animationDelay: `2s` }}
      />
      <path
        id="Line_9"
        d="M48.91,15l-0.12,0A1,1,0,0,0,48,16v6a1,1,0,1,0,2,0s0,0,0,0V16a1,1,0,0,0-1-1H48.91Z"
        data-name="Line 9"
        style={{
          animation: `pulse-waves 1s infinite`,
          animationDelay: `2.15s`,
        }}
      />
    </svg>
  );
}
