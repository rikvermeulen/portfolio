export function Chevron({ className, ...props }: { className?: string }) {
  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      width="19.1016"
      height="33.9258"
      {...props}
      className={className}
      viewBox="0 0 19.1016 33.9258"
    >
      <g>
        <rect height="33.9258" opacity="0" width="19.1016" x="0" y="0" />
        <path
          d="M0 16.9531C0 17.4414 0.175781 17.8711 0.546875 18.2422L16.0352 33.3789C16.3672 33.7305 16.7969 33.9062 17.3047 33.9062C18.3203 33.9062 19.1016 33.1445 19.1016 32.1289C19.1016 31.6211 18.8867 31.1914 18.5742 30.8594L4.35547 16.9531L18.5742 3.04688C18.8867 2.71484 19.1016 2.26562 19.1016 1.77734C19.1016 0.761719 18.3203 0 17.3047 0C16.7969 0 16.3672 0.175781 16.0352 0.507812L0.546875 15.6641C0.175781 16.0156 0 16.4648 0 16.9531Z"
          fill-opacity="0.85"
        />
      </g>
    </svg>
  );
}