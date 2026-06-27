import React from 'react'

const EmptyState = ({
  icon: Icon,
  title = 'Data Tidak Ditemukan',
  description = 'Belum ada data yang tersedia saat ini.',
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Illustration */}
      <div className="relative mb-6">
        {Icon ? (
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
            <Icon className="w-12 h-12 text-gray-400" />
          </div>
        ) : (
          <svg
            className="w-32 h-32"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Folder illustration */}
            <rect
              x="30"
              y="60"
              width="140"
              height="100"
              rx="8"
              fill="#f3f4f6"
              stroke="#d1d5db"
              strokeWidth="2"
            />
            <path
              d="M30 68a8 8 0 018-8h40l12 16h70a8 8 0 018 8v76a8 8 0 01-8 8H38a8 8 0 01-8-8V68z"
              fill="#e5e7eb"
              stroke="#d1d5db"
              strokeWidth="2"
            />
            <circle cx="100" cy="110" r="20" fill="#d1d5db" />
            <path
              d="M95 110l4 4 8-8"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>

      {/* Description */}
      <p className="text-sm text-gray-500 text-center max-w-sm mb-6">
        {description}
      </p>

      {/* Action button */}
      {action && (
        <button onClick={action.onClick} className="btn-primary px-6 py-2.5">
          {action.label}
        </button>
      )}
    </div>
  )
}

// Pre-built empty states for common use cases
const EmptyOrders = ({ onCreateOrder }) => (
  <EmptyState
    icon={({ className }) => (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
    )}
    title="Belum Ada Order"
    description="Anda belum memiliki order apapun. Mulai belanja produk dan buat order pertama Anda!"
    action={
      onCreateOrder
        ? {
            label: 'Buat Order Baru',
            onClick: onCreateOrder,
          }
        : null
    }
  />
)

const EmptyProducts = ({ onAddProduct }) => (
  <EmptyState
    icon={({ className }) => (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    )}
    title="Belum Ada Produk"
    description="Tambahkan produk pertama Anda untuk mulai berjualan."
    action={
      onAddProduct
        ? {
            label: 'Tambah Produk',
            onClick: onAddProduct,
          }
        : null
    }
  />
)

const EmptyDeliveries = () => (
  <EmptyState
    icon={({ className }) => (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
        />
      </svg>
    )}
    title="Belum Ada Pengiriman"
    description="Belum ada pengiriman yang terjadwal saat ini."
  />
)

export { EmptyState, EmptyOrders, EmptyProducts, EmptyDeliveries }
