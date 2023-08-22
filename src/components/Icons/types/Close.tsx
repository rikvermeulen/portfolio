export function Close({ className, ...props }: { className?: string }) {
  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      width="30.9717"
      height="30.9913"
      {...props}
      className={className}
      viewBox="0 0 30.9717 30.9913"
    >
      <g>
        <rect height="30.9913" opacity="0" width="30.9717" x="0" y="0" />
        <path
          d="M0.505398 30.4859C1.18899 31.1499 2.3218 31.1499 2.98587 30.4859L15.4859 17.9859L27.9859 30.4859C28.6499 31.1499 29.8023 31.1695 30.4663 30.4859C31.1304 29.8023 31.1304 28.689 30.4663 28.0249L17.9663 15.5054L30.4663 3.0054C31.1304 2.34134 31.1499 1.20852 30.4663 0.54446C29.7827-0.139134 28.6499-0.139134 27.9859 0.54446L15.4859 13.0445L2.98587 0.54446C2.3218-0.139134 1.16946-0.158665 0.505398 0.54446C-0.158665 1.22805-0.158665 2.34134 0.505398 3.0054L13.0054 15.5054L0.505398 28.0249C-0.158665 28.689-0.178196 29.8218 0.505398 30.4859Z"
          fill-opacity="0.85"
        />
      </g>
    </svg>
  );
}
