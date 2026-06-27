import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import { SkeletonTable, Skeleton } from '../../components/Common/Skeleton'
import {
  MdLocalShipping,
  MdPerson,
  MdAccessTime,
  MdLocationOn,
} from 'react-icons/md'

const statusLabel = {
  assigned: 'Ditugaskan',
  picked_up: 'Barang Diambil',
  on_the_way: 'Dalam Perjalanan',
  delivered: 'Berhasil Terkirim',
  failed: 'Gagal Kirim',
}
const statusColor = {
  assigned: 'bg-blue-100 text-blue-800 border border-blue-200',
  picked_up: 'bg-purple-100 text-purple-800 border border-purple-200',
  on_the_way: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
  delivered: 'bg-green-100 text-green-800 border border-green-200',
  failed: 'bg-red-100 text-red-800 border border-red-200',
}

const Deliveries = () => {
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/deliveries')
      .then((r) => setDeliveries(r.data.data || []))
      .finally(() => setLoading(false))
  }, [])

  if (loading)
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <SkeletonTable rows={5} cols={5} />
      </div>
    )

  return (
    <div className="space-y-8 pb-8">
      {/* Header section with gradient line */}
      <div className="relative pb-4 border-b border-primary-100">
        <h1 className="text-3xl font-extrabold text-primary-900 tracking-tight">
          Monitor Pengiriman
        </h1>
        <p className="text-gray-500 text-sm font-medium mt-1.5">
          Lacak status armada dan estimasi kedatangan pesanan.
        </p>
        <div className="absolute bottom-[-1px] left-0 w-24 h-[2px] bg-accent-500 rounded-full"></div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-primary-100 shadow-sm">
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-100">
                <th className="py-3 px-4 text-left font-bold text-gray-500 uppercase tracking-wider text-[11px]">
                  Info Pesanan
                </th>
                <th className="py-3 px-4 text-left font-bold text-gray-500 uppercase tracking-wider text-[11px]">
                  Tujuan (Retailer)
                </th>
                <th className="py-3 px-4 text-left font-bold text-gray-500 uppercase tracking-wider text-[11px]">
                  Armada / Driver
                </th>
                <th className="py-3 px-4 text-left font-bold text-gray-500 uppercase tracking-wider text-[11px]">
                  Status Tracking
                </th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((d) => (
                <tr
                  key={d.id}
                  className="border-b border-gray-100 hover:bg-primary-50 transition-colors group"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                        <MdLocalShipping className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-mono font-bold text-primary-900 group-hover:text-accent-600 transition-colors">
                          {d.order?.order_number}
                        </p>
                        <p className="text-xs font-semibold text-gray-400 mt-0.5">
                          ID Kirim: {d.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-bold text-gray-900">
                      {d.order?.retailer?.name}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-gray-500 text-xs">
                      <MdLocationOn className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[200px]">
                        {d.order?.delivery_address || 'Alamat tidak tersedia'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {d.driver ? (
                      <div>
                        <p className="font-bold text-gray-900 flex items-center gap-1.5">
                          <MdPerson className="text-gray-400" /> {d.driver.name}
                        </p>
                        <p className="text-xs font-mono font-medium text-gray-500 mt-0.5 ml-5">
                          {d.driver.phone}
                        </p>
                      </div>
                    ) : (
                      <span className="inline-flex px-2.5 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-wider rounded-md">
                        Belum Di-assign
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col items-start gap-1.5">
                      <span
                        className={`inline-flex px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md ${statusColor[d.status]}`}
                      >
                        {statusLabel[d.status]}
                      </span>
                      {d.estimated_arrival && (
                        <p className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
                          <MdAccessTime className="w-3.5 h-3.5" /> Est:{' '}
                          {d.estimated_arrival
                            .substring(0, 16)
                            .replace('T', ' ')}
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!deliveries.length && (
            <div className="text-center py-16">
              <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <MdLocalShipping className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-primary-900 font-bold mb-1">
                Belum ada pengiriman
              </p>
              <p className="text-gray-500 text-sm font-medium">
                Tidak ada data pengiriman aktif saat ini.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
export default Deliveries
