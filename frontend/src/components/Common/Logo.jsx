import React from 'react'

const Logo = ({ className = 'w-8 h-8', textColor = 'text-white' }) => {
  return (
    <div className="flex items-center gap-3">
      <svg
        className={className}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="100" height="100" rx="20" fill="url(#gradient)" />
        <path d="M30 35h40v8H30z" fill="white" opacity="0.9" />
        <path d="M35 50h30v8H35z" fill="white" opacity="0.75" />
        <path d="M40 65h20v8H40z" fill="white" opacity="0.6" />
        <circle cx="25" cy="39" r="4" fill="white" />
        <circle cx="25" cy="54" r="4" fill="white" />
        <circle cx="25" cy="69" r="4" fill="white" />
        <path d="M70 35l8 4-8 4z" fill="white" opacity="0.9" />
        <path d="M68 50l8 4-8 4z" fill="white" opacity="0.75" />
        <path d="M66 65l8 4-8 4z" fill="white" opacity="0.6" />
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>
      </svg>
      <span className={`text-xl font-bold ${textColor}`}>OrderLink</span>
    </div>
  )
}

export default Logo
