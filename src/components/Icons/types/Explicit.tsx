export default function Explicit({ className, ...props }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 9.925 10.129"
      {...props}
      className={className}
    >
      <path
        id="explicit"
        d="M1.489,0H8.436A1.5,1.5,0,0,1,9.925,1.519v7.09a1.5,1.5,0,0,1-1.489,1.519H1.489A1.5,1.5,0,0,1,0,8.609V1.519A1.5,1.5,0,0,1,1.489,0ZM6.8,7.871H3.127V2.249H6.8v.97H4.287V4.575h2.37v.9H4.287V6.9H6.8Z"
        fill="#fff"
        fillRule="evenodd"
        opacity="0.702"
      />
    </svg>
  );
}
