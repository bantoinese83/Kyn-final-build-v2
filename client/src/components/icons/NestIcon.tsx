interface NestIconProps {
  className?: string;
  size?: number;
}

export function NestIcon({ className = "w-4 h-4", size }: NestIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2C12 2 5.5 4.5 3.5 8.5C3.5 8.5 2 12 5 15.5C5 15.5 8 20 12 22C12 22 16 20 19 15.5C19 15.5 22 12 20.5 8.5C20.5 8.5 18.5 4.5 12 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M12 6C12 6 9 7.5 7.5 10C7.5 10 6.5 12.5 8.5 15C8.5 15 10.5 17.5 12 18C12 18 13.5 17.5 15.5 15C15.5 15 17.5 12.5 16.5 10C16.5 10 15 7.5 12 6Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M12 9.5C12 9.5 10.5 10.2 9.8 11.5C9.8 11.5 9.3 13 10.5 14.2C10.5 14.2 11.5 15.2 12 15.5C12 15.5 12.5 15.2 13.5 14.2C13.5 14.2 14.7 13 14.2 11.5C14.2 11.5 13.5 10.2 12 9.5Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Center knot/nest detail */}
      <circle
        cx="12"
        cy="12.5"
        r="1.5"
        stroke="currentColor"
        strokeWidth="0.8"
        fill="currentColor"
        opacity="0.6"
      />
    </svg>
  );
}
