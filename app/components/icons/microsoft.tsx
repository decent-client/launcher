export function Microsoft({ className, size }: { className?: string; size?: number }) {
  return (
    <svg
      className={className}
      role="img"
      aria-label="microsoft"
      viewBox="0 0 25 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        width: size,
        height: size,
      }}
    >
      <path d="M11.5216 0.5H0V11.9067H11.5216V0.5Z" fill="#f25022" />
      <path d="M24.2418 0.5H12.7202V11.9067H24.2418V0.5Z" fill="#7fba00" />
      <path d="M11.5216 13.0933H0V24.5H11.5216V13.0933Z" fill="#00a4ef" />
      <path d="M24.2418 13.0933H12.7202V24.5H24.2418V13.0933Z" fill="#ffb900" />
    </svg>
  );
}

export { Microsoft as MicrosoftIcon };
