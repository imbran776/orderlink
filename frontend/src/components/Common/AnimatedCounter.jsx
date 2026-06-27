import React, { useEffect, useState } from 'react'

const AnimatedCounter = ({
  value,
  duration = 1500,
  prefix = '',
  suffix = '',
}) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const animate = () => {
      // Extract numbers from string if necessary (e.g. "Rp 1.000.000")
      const numericValue =
        typeof value === 'string'
          ? parseFloat(value.replace(/[^0-9.-]+/g, ''))
          : value

      if (isNaN(numericValue)) {
        setCount(value)
        return
      }

      let startTimestamp = null
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp
        const progress = Math.min((timestamp - startTimestamp) / duration, 1)

        // Easing function (easeOutExpo)
        const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)

        setCount(Math.floor(easeProgress * numericValue))

        if (progress < 1) {
          window.requestAnimationFrame(step)
        } else {
          setCount(numericValue)
        }
      }
      window.requestAnimationFrame(step)
    }
    animate()
  }, [value, duration])

  // Format back to string if it was a number
  const formattedCount =
    typeof value === 'string' && value.includes('Rp')
      ? Number(count).toLocaleString('id')
      : count

  return (
    <span>
      {prefix}
      {formattedCount}
      {suffix}
    </span>
  )
}

export default AnimatedCounter
