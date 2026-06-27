import React from 'react'
import { MdChevronLeft, MdChevronRight } from 'react-icons/md'

const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.total <= pagination.per_page) {
    return null
  }

  const { current_page, last_page, from, to, total } = pagination

  const handlePageClick = (page) => {
    if (page >= 1 && page <= last_page) {
      onPageChange(page)
    }
  }

  const pageNumbers = []
  const maxPagesToShow = 5
  let startPage, endPage

  if (last_page <= maxPagesToShow) {
    startPage = 1
    endPage = last_page
  } else {
    const maxPagesBeforeCurrent = Math.floor(maxPagesToShow / 2)
    const maxPagesAfterCurrent = Math.ceil(maxPagesToShow / 2) - 1
    if (current_page <= maxPagesBeforeCurrent) {
      startPage = 1
      endPage = maxPagesToShow
    } else if (current_page + maxPagesAfterCurrent >= last_page) {
      startPage = last_page - maxPagesToShow + 1
      endPage = last_page
    } else {
      startPage = current_page - maxPagesBeforeCurrent
      endPage = current_page + maxPagesAfterCurrent
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i)
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t border-gray-100">
      <p className="text-sm text-gray-500 font-medium mb-4 sm:mb-0">
        Menampilkan <span className="font-bold text-gray-800">{from}</span>-
        <span className="font-bold text-gray-800">{to}</span> dari{' '}
        <span className="font-bold text-gray-800">{total}</span> hasil
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => handlePageClick(current_page - 1)}
          disabled={current_page === 1}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <MdChevronLeft className="w-5 h-5" />
        </button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageClick(1)}
              className="px-4 py-2 text-sm font-bold rounded-lg hover:bg-gray-100 transition-colors"
            >
              1
            </button>
            {startPage > 2 && <span className="px-2 text-gray-400">...</span>}
          </>
        )}

        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => handlePageClick(number)}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
              current_page === number
                ? 'bg-primary-900 text-white shadow-sm'
                : 'hover:bg-gray-100'
            }`}
          >
            {number}
          </button>
        ))}

        {endPage < last_page && (
          <>
            {endPage < last_page - 1 && (
              <span className="px-2 text-gray-400">...</span>
            )}
            <button
              onClick={() => handlePageClick(last_page)}
              className="px-4 py-2 text-sm font-bold rounded-lg hover:bg-gray-100 transition-colors"
            >
              {last_page}
            </button>
          </>
        )}

        <button
          onClick={() => handlePageClick(current_page + 1)}
          disabled={current_page === last_page}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <MdChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

export default Pagination
