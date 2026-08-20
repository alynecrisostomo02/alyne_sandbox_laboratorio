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
    leaf: (
      <>
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
      </>
    ),
    sprout: (
      <>
        <path d="M7 20h10" />
        <path d="M10 20c0-4.5 2-8 7-9" />
        <path d="M17 11c0-3.87-3.13-7-7-7-2 0-3 1-3 1s0 2 1 3c1 1 3 2 6 2" />
        <path d="M10 20c0-3-1-5-3-6-2.5-1.2-5 0-5 3 0 2 2 4 4 4" />
      </>
    ),
    copy: (
      <>
        <rect x="8" y="8" width="11" height="11" rx="2" />
        <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
      </>
    ),
    download: (
      <>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </>
    ),
    pdf: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M9 15h1.5a1.5 1.5 0 0 0 0-3H9v6" />
        <path d="M12 18v-6h1.5a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5H12" />
      </>
    ),
    fileText: (
      <>
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
      </>
    ),
    drive: (
      <>
        <path d="M12 2 4.5 15h15L12 2z" />
        <path d="M2.5 19h19" />
        <path d="M6 19 2 12" />
        <path d="M18 19l4-7" />
      </>
    ),
    forms: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <line x1="7" y1="8" x2="7.01" y2="8" />
        <line x1="11" y1="8" x2="17" y2="8" />
        <line x1="7" y1="12" x2="7.01" y2="12" />
        <line x1="11" y1="12" x2="17" y2="12" />
        <line x1="7" y1="16" x2="7.01" y2="16" />
        <line x1="11" y1="16" x2="17" y2="16" />
      </>
    ),
    refresh: (
      <>
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
        <path d="M16 21h5v-5" />
      </>
    ),
    upload: (
      <>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </>
    ),
    link: (
      <>
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </>
    ),
    paste: (
      <>
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <path d="M12 11h4" />
        <path d="M12 16h4" />
        <path d="M8 11h.01" />
        <path d="M8 16h.01" />
      </>
    ),
    image: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </>
    ),
    camera: (
      <>
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </>
    ),
    map: (
      <>
        <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
        <line x1="9" y1="3" x2="9" y2="18" />
        <line x1="15" y1="6" x2="15" y2="21" />
      </>
    ),
    navigation: (
      <>
        <polygon points="3 11 22 2 13 21 11 13 3 11" />
      </>
    ),
    school: (
      <>
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
      </>
    ),
    cart: (
      <>
        <circle cx="8" cy="21" r="1" />
        <circle cx="19" cy="21" r="1" />
        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
      </>
    ),
    tree: (
      <>
        <path d="M12 22v-6" />
        <path d="M17 14a5 5 0 0 0-10 0c0 2.76 2.24 4 5 4s5-1.24 5-4Z" />
        <path d="M12 8a3 3 0 0 0-3-3c-1.66 0-3 1.34-3 3 0 2 1 3 3 4" />
        <path d="M12 8a3 3 0 0 1 3-3c1.66 0 3 1.34 3 3 0 2-1 3-3 4" />
      </>
    ),
    hospital: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M12 8v8M8 12h8" />
      </>
    ),
    utensils: (
      <>
        <path d="M18 2v6a3 3 0 0 1-3 3h-1v11h-2V11h-1a3 3 0 0 1-3-3V2" />
        <path d="M18 2h-8" />
        <path d="M5 2v20" />
      </>
    ),
    compass: (
      <>
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
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
