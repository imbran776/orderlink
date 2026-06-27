import React from 'react'
import { MdDarkMode, MdLightMode } from 'react-icons/md'
import { useTheme } from '../../context/ThemeContext'

const ThemeToggle = () => {
  const { dark, toggle } = useTheme()

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
      aria-label="Toggle Dark Mode"
    >
      {dark ? (
        <MdLightMode className="w-5 h-5" />
      ) : (
        <MdDarkMode className="w-5 h-5" />
      )}
    </button>
  )
}

export default ThemeToggle
