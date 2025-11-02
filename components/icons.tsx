import React from 'react';

const iconProps = {
  className: "w-6 h-6 text-cyan-400",
  viewBox: "0 0 24 24",
  fill: "currentColor",
  xmlns: "http://www.w3.org/2000/svg",
};

export const PlayIcon: React.FC = () => (
  <svg {...iconProps}>
    <path d="M8 5v14l11-7z" />
  </svg>
);

export const PauseIcon: React.FC = () => (
  <svg {...iconProps}>
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

export const StopIcon: React.FC = () => (
  <svg {...iconProps}>
    <path d="M6 6h12v12H6z" />
  </svg>
);