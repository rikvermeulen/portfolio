export default function Mouse({ className, ...props }: { className?: string }) {
  return (
    <svg
      {...props}
      height="14"
      viewBox="0 0 14 14"
      width="14"
      className={className}
    >
      <defs>
        <clipPath id="clip-path">
          <rect
            id="Rectangle_60"
            data-name="Rectangle 60"
            height="14"
            width="14"
          />
        </clipPath>
      </defs>
      <g id="arrow" clipPath="url(#clip-path)">
        <path
          id="Path_8"
          d="M2.53,1.512A1,1,0,0,1,4.138.584L12.7,7.317A1,1,0,0,1,12.105,9.1L8.59,9.2a1,1,0,0,0-.824.476l-1.84,3a1,1,0,0,1-1.843-.382Z"
          data-name="Path 8"
        />
      </g>
    </svg>
  );
}
