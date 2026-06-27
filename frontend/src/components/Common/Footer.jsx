import React from 'react'
import { FaInstagram } from 'react-icons/fa'

const Footer = () => {
  return (
    <footer className="mt-auto py-4 px-6 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
        <p className="text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} OrderLink. All rights reserved.
        </p>

        <a
          href="https://instagram.com/ranzxyz77"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
        >
          <span className="font-medium">Developed by Imbran Darwis</span>
          <FaInstagram className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
        </a>
      </div>
    </footer>
  )
}

export default Footer
