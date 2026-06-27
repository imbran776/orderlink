import React from 'react'
import { MdPrint, MdDownload } from 'react-icons/md'
import api from '../../services/api'
import Logo from './Logo'

const InvoiceTemplate = ({ invoice, order }) => {
  if (!invoice || !order) return null

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // Memanggil API backend Laravel yang men-generate PDF
    window.open(
      `${api.defaults.baseURL}/invoices/${invoice.id}/download`,
      '_blank'
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="bg-white">
      {/* Action Buttons (Hidden when printing) */}
      <div className="flex justify-end gap-3 mb-6 print:hidden">
        <button
          onClick={handlePrint}
          className="btn-secondary flex items-center gap-2"
        >
          <MdPrint className="w-4 h-4" /> Cetak
        </button>
        <button
          onClick={handleDownload}
          className="btn-primary flex items-center gap-2"
        >
          <MdDownload className="w-4 h-4" /> Download PDF
        </button>
      </div>

      {/* Invoice Document */}
      <div className="border border-gray-200 rounded-xl p-8 max-w-4xl mx-auto print:border-none print:p-0">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 pb-8 border-b border-gray-200">
          <div>
            <Logo className="w-10 h-10 mb-4" textColor="text-gray-900" />
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              INVOICE
            </h1>
            <p className="text-gray-500 font-mono mt-1">
              {invoice.invoice_number}
            </p>
          </div>
          <div className="text-right">
            <div
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4
              ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
            >
              {invoice.status === 'paid' ? 'LUNAS' : 'BELUM DIBAYAR'}
            </div>
            <p className="text-sm text-gray-500">
              Tanggal:{' '}
              <span className="font-medium text-gray-900">
                {formatDate(invoice.created_at)}
              </span>
            </p>
            <p className="text-sm text-gray-500">
              Jatuh Tempo:{' '}
              <span className="font-medium text-gray-900">
                {formatDate(invoice.due_date)}
              </span>
            </p>
          </div>
        </div>

        {/* Addresses */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Ditagihkan Kepada:
            </p>
            <p className="font-bold text-gray-900 text-lg">
              {order.retailer?.company_name || order.retailer?.name}
            </p>
            <p className="text-gray-600">{order.retailer?.name}</p>
            <p className="text-gray-500 text-sm mt-1 max-w-xs">
              {order.delivery_address}
            </p>
            <p className="text-gray-500 text-sm">{order.retailer?.phone}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Dari:
            </p>
            <p className="font-bold text-gray-900 text-lg">
              OrderLink Distribution
            </p>
            <p className="text-gray-500 text-sm mt-1">
              Gedung OrderLink Lt. 4<br />
              Jl. Sudirman No. 123, Jakarta
              <br />
              021-555-0123
            </p>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-8">
          <thead>
            <tr className="border-y border-gray-200 bg-gray-50/50 text-left">
              <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-12">
                No
              </th>
              <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Deskripsi
              </th>
              <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                Harga
              </th>
              <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                Qty
              </th>
              <th className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {order.items?.map((item, index) => (
              <tr key={item.id}>
                <td className="py-4 px-4 text-sm text-gray-500">{index + 1}</td>
                <td className="py-4 px-4">
                  <p className="font-medium text-gray-900">
                    {item.product?.name}
                  </p>
                  <p className="text-xs text-gray-500 font-mono">
                    {item.product?.sku}
                  </p>
                </td>
                <td className="py-4 px-4 text-sm text-gray-700 text-right">
                  Rp {Number(item.price).toLocaleString('id')}
                </td>
                <td className="py-4 px-4 text-sm text-gray-700 text-right">
                  {item.quantity} {item.product?.unit}
                </td>
                <td className="py-4 px-4 text-sm font-medium text-gray-900 text-right">
                  Rp {Number(item.subtotal).toLocaleString('id')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-12">
          <div className="w-64 space-y-3">
            <div className="flex justify-between text-gray-500 text-sm">
              <span>Subtotal</span>
              <span>
                Rp {Number(invoice.total_amount).toLocaleString('id')}
              </span>
            </div>
            <div className="flex justify-between text-gray-500 text-sm">
              <span>Pajak (0%)</span>
              <span>Rp 0</span>
            </div>
            <div className="flex justify-between font-bold text-lg text-gray-900 pt-3 border-t border-gray-200">
              <span>Total Tagihan</span>
              <span className="text-primary-600">
                Rp {Number(invoice.total_amount).toLocaleString('id')}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-8 text-sm text-gray-500">
          <p className="font-bold text-gray-700 mb-1">Informasi Pembayaran:</p>
          <p>BCA: 1234567890 a.n OrderLink Distribution</p>
          <p>Mandiri: 0987654321 a.n OrderLink Distribution</p>
          <p className="mt-4 text-xs text-gray-400">
            Terima kasih atas kepercayaan Anda bermitra dengan OrderLink.
          </p>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .bg-white, .bg-white * { visibility: visible; }
          .bg-white { position: absolute; left: 0; top: 0; width: 100%; }
          @page { margin: 2cm; }
        }
      `}</style>
    </div>
  )
}

export default InvoiceTemplate
