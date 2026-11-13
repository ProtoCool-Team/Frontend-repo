// Iconițe SVG simple (stil linie), ca în prototip.
const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

export function Icon({name, size = 18}) {
  const p = {...base, width: size, height: size, viewBox: '0 0 24 24'};
  switch (name) {
    case 'ROBOT':
      return (
        <svg {...p}>
          <rect x="5" y="8" width="14" height="10" rx="3" />
          <circle cx="9.5" cy="13" r="1.3" />
          <circle cx="14.5" cy="13" r="1.3" />
          <path d="M12 8V5M12 4.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1M9 21h6" />
        </svg>
      );
    case 'MEASUREMENT':
      return (
        <svg {...p}>
          <rect x="9" y="3" width="5" height="10" rx="2" />
          <path d="M6 21h12M8 17a6 6 0 0 0 10-4" />
        </svg>
      );
    case 'COMPUTE':
      return (
        <svg {...p}>
          <rect x="4" y="3" width="16" height="5" rx="1.5" />
          <rect x="4" y="10" width="16" height="5" rx="1.5" />
          <rect x="4" y="17" width="16" height="4" rx="1.5" />
          <path d="M7.5 5.5h.01M7.5 12.5h.01" />
        </svg>
      );
    case 'ROOM':
      return (
        <svg {...p}>
          <rect x="5" y="3" width="14" height="18" rx="1.5" />
          <path d="M9 7h1M14 7h1M9 11h1M14 11h1M10 21v-4h4v4" />
        </svg>
      );
    case 'search':
      return (
        <svg {...p}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      );
    case 'pin':
      return (
        <svg {...p}>
          <path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10Z" />
          <circle cx="12" cy="11" r="2" />
        </svg>
      );
    case 'clock':
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case 'lock':
      return (
        <svg {...p}>
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      );
    case 'bell':
      return (
        <svg {...p}>
          <path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4l2-2ZM10 21h4" />
        </svg>
      );
    case 'chevron':
      return (
        <svg {...p}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      );
    case 'left':
      return (
        <svg {...p}>
          <path d="m15 18-6-6 6-6" />
        </svg>
      );
    case 'right':
      return (
        <svg {...p}>
          <path d="m9 18 6-6-6-6" />
        </svg>
      );
    case 'calendar':
      return (
        <svg {...p}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
      );
    case 'plus':
      return (
        <svg {...p}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case 'close':
      return (
        <svg {...p}>
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      );
    case 'logo':
      return (
        <svg {...p}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 3l18 18M21 3 3 21" />
        </svg>
      );
    default:
      return null;
  }
}
