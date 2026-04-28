type IconProps = {
  className?: string;
};

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3.5 8H12.5M12.5 8L8.75 4.25M12.5 8L8.75 11.75"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HomeIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M2.5 7.1L8 2.75L13.5 7.1V13.25H9.95V9.75H6.05V13.25H2.5V7.1Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PlayIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="6.75" stroke="currentColor" strokeWidth="1.3" />
      <path d="M6.7 5.6L10.45 8L6.7 10.4V5.6Z" fill="currentColor" />
    </svg>
  );
}

export function CompassIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="6.75" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M10.6 5.4L9.15 9.15L5.4 10.6L6.85 6.85L10.6 5.4Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="8" r="1" fill="currentColor" />
    </svg>
  );
}
