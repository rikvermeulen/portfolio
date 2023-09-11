export default function Tooltip({ className, ...props }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="76.772"
      height="29.1"
      viewBox="0 0 76.772 29.1"
      className={className}
      {...props}
    >
      <path
        d="M20.857,6.132a5,5,0,0,1,8.286,0l15.231,19.9c4.068,4.693,10.356,5.78,18.51,7h0c-15.885-.084-38.847,0-38.847,0s-20.848-.141-37.925,0h0c12.152-1.9,14.219-2.36,19.468-7Z"
        transform="translate(13.888 -3.931)"
      />
    </svg>
  );
}
