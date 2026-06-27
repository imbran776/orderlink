import React from 'react'

/**
 * BrandPattern - Subtle decorative pattern sebagai brand signature
 * Dot grid atau link chain pattern untuk background enhancement
 *
 * Props:
 * - pattern: 'dots' | 'grid' | 'linkChain' (default: 'dots')
 * - color: 'teal' | 'coral' | 'neutral' (default: 'teal')
 * - opacity: 'subtle' | 'medium' | 'visible' (default: 'subtle')
 * - className: additional classes
 */
const BrandPattern = ({
  pattern = 'dots',
  color = 'teal',
  opacity = 'subtle',
  className = '',
}) => {
  const colorClasses = {
    teal: {
      subtle: 'text-teal-500/5',
      medium: 'text-teal-500/10',
      visible: 'text-teal-500/20',
    },
    coral: {
      subtle: 'text-coral-500/5',
      medium: 'text-coral-500/10',
      visible: 'text-coral-500/20',
    },
    neutral: {
      subtle: 'text-neutral-300/30',
      medium: 'text-neutral-300/50',
      visible: 'text-neutral-300/70',
    },
  }

  const colorClass = colorClasses[color][opacity]

  if (pattern === 'dots') {
    return (
      <div
        className={`absolute inset-0 ${className}`}
        style={{
          backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      >
        <div className={colorClass} style={{ width: '100%', height: '100%' }} />
      </div>
    )
  }

  if (pattern === 'grid') {
    return (
      <div
        className={`absolute inset-0 ${colorClass} ${className}`}
        style={{
          backgroundImage: `
            linear-gradient(currentColor 1px, transparent 1px),
            linear-gradient(to right, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
        aria-hidden="true"
      />
    )
  }

  if (pattern === 'linkChain') {
    // SVG pattern untuk link chain - brand signature OrderLink
    return (
      <div className={`absolute inset-0 ${className}`} aria-hidden="true">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="linkChainPattern"
              x="0"
              y="0"
              width="80"
              height="80"
              patternUnits="userSpaceOnUse"
            >
              {/* Link chain elements */}
              <circle
                cx="20"
                cy="20"
                r="3"
                fill="currentColor"
                className={colorClass}
              />
              <circle
                cx="60"
                cy="20"
                r="3"
                fill="currentColor"
                className={colorClass}
              />
              <circle
                cx="20"
                cy="60"
                r="3"
                fill="currentColor"
                className={colorClass}
              />
              <circle
                cx="60"
                cy="60"
                r="3"
                fill="currentColor"
                className={colorClass}
              />
              <line
                x1="23"
                y1="20"
                x2="57"
                y2="20"
                stroke="currentColor"
                strokeWidth="1"
                className={colorClass}
              />
              <line
                x1="20"
                y1="23"
                x2="20"
                y2="57"
                stroke="currentColor"
                strokeWidth="1"
                className={colorClass}
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#linkChainPattern)" />
        </svg>
      </div>
    )
  }

  return null
}

export default BrandPattern
