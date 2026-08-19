export function Icon({ name, size = 20, className = "" }) {
  const paths = {
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    arrow: <path d="m9 18 6-6-6-6" />,
    heart: (
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.7-7.5 1.1-1.1a5.5 5.5 0 0 0 0-7.8Z" />
    ),
    bed: (
      <>
        <path d="M3 7v10M21 17H3M21 17v-5a2 2 0 0 0-2-2H3" />
        <path d="M7 10V7h5a2 2 0 0 1 2 2v1" />
      </>
    ),
    bath: (
      <>
        <path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3Z" />
        <path d="M6 12V6a3 3 0 0 1 5.5-1.6M7 19v2M17 19v2" />
      </>
    ),
    car: (
      <>
        <path d="m5 17-1-1v-5l2-5h12l2 5v5l-1 1H5Z" />
        <circle cx="7.5" cy="14.5" r="1" />
        <circle cx="16.5" cy="14.5" r="1" />
        <path d="M5 11h14" />
      </>
    ),
    area: (
      <>
        <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" />
        <path d="m4 4 6 6M20 4l-6 6M20 20l-6-6M4 20l6-6" />
      </>
    ),
    pin: (
      <>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    whatsapp: (
      <>
        <path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.4-4.7a8.5 8.5 0 1 1 16.1-4.1Z" />
        <path d="M8.2 7.7c.2-.4.4-.4.7-.4h.5c.2 0 .4 0 .5.4l.7 1.7c.1.3.1.5-.1.7l-.5.7c-.2.2-.2.4 0 .7.5.9 1.2 1.6 2.1 2.1.3.2.5.2.7 0l.8-1c.2-.2.4-.3.7-.2l1.8.8c.3.1.5.3.5.5 0 .3-.1 1.3-.6 1.8-.5.6-1.3.8-2.1.7-1.1-.1-2.5-.6-4.2-2.1-2.3-2-3.1-4.3-3.2-5.2 0-.5.1-.9.3-1.2Z" />
      </>
    ),
    share: (
      <>
        <circle cx="18" cy="5" r="2" />
        <circle cx="6" cy="12" r="2" />
        <circle cx="18" cy="19" r="2" />
        <path d="m8 11 8-5M8 13l8 5" />
      </>
    ),
    filter: (
      <>
        <path d="M4 6h16M7 12h10M10 18h4" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m6 9 6 6 6-6" />,
    spark: (
      <path d="M12 3 13.7 8.3 19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3ZM19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" />
    ),
    copy: (
      <>
        <rect x="8" y="8" width="11" height="11" rx="2" />
        <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}
