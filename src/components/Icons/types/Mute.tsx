export default function Mute({ className, ...props }: { className?: string }) {
  return (
    <svg
      {...props}
      className={className}
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      width="11.6309"
      height="17.2363"
      viewBox="0 0 11.6309 17.2363"
    >
      <g>
        <rect height="17.2363" opacity="0" width="11.6309" x="0" y="0" />
        <path d="M10.5273 17.2363C11.1719 17.2363 11.6309 16.7773 11.6309 16.1426L11.6309 1.16211C11.6309 0.527344 11.1719 0.00976562 10.5078 0.00976562C10.0586 0.00976562 9.74609 0.205078 9.24805 0.683594L5.08789 4.58984C5.01953 4.64844 4.94141 4.67773 4.84375 4.67773L2.04102 4.67773C0.722656 4.67773 0 5.41016 0 6.81641L0 10.4492C0 11.8652 0.722656 12.5879 2.04102 12.5879L4.84375 12.5879C4.94141 12.5879 5.01953 12.6172 5.08789 12.6758L9.24805 16.6211C9.69727 17.0508 10.0781 17.2363 10.5273 17.2363Z" />
      </g>
    </svg>
  );
}
