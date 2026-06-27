import React from 'react'

/**
 * FloatingBlobs - Animated gradient orbs untuk background decorative
 * Signature visual element untuk OrderLink brand
 *
 * Props:
 * - variant: 'teal' | 'coral' | 'mixed' (default: 'mixed')
 * - density: 'low' | 'medium' | 'high' (default: 'medium')
 * - className: additional wrapper classes
 */
const FloatingBlobs = ({
  variant = 'mixed',
  density = 'medium',
  className = '',
}) => {
  const densityConfig = {
    low: 2,
    medium: 3,
    high: 5,
  }

  const blobCount = densityConfig[density] || 3

  const getBlobClasses = (index) => {
    const animations = [
      'animate-float',
      'animate-float-delayed',
      'animate-blob',
      'animate-float-slow',
    ]
    const animation = animations[index % animations.length]

    // Define blob configs based on variant and index
    const configs = {
      mixed: [
        'bg-teal-500/20 blur-3xl',
        'bg-coral-500/20 blur-3xl',
        'bg-teal-400/15 blur-2xl',
        'bg-coral-400/15 blur-2xl',
        'bg-teal-600/10 blur-3xl',
      ],
      teal: [
        'bg-teal-500/25 blur-3xl',
        'bg-teal-400/20 blur-2xl',
        'bg-teal-600/15 blur-3xl',
        'bg-teal-300/20 blur-2xl',
        'bg-teal-500/15 blur-3xl',
      ],
      coral: [
        'bg-coral-500/25 blur-3xl',
        'bg-coral-400/20 blur-2xl',
        'bg-coral-600/15 blur-3xl',
        'bg-coral-300/20 blur-2xl',
        'bg-coral-500/15 blur-3xl',
      ],
    }

    const positions = [
      'top-[-10%] right-[-10%] w-[500px] h-[500px]',
      'bottom-[-10%] left-[-10%] w-[400px] h-[400px]',
      'top-[40%] left-[20%] w-[300px] h-[300px]',
      'top-[60%] right-[15%] w-[350px] h-[350px]',
      'bottom-[30%] right-[40%] w-[280px] h-[280px]',
    ]

    const colorClass = configs[variant][index % configs[variant].length]
    const position = positions[index % positions.length]

    return `absolute ${position} ${colorClass} ${animation} rounded-full pointer-events-none`
  }

  return (
    <div
      className={`absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {[...Array(blobCount)].map((_, index) => (
        <div key={index} className={getBlobClasses(index)} />
      ))}
    </div>
  )
}

export default FloatingBlobs
