import React, { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  MdArrowBack,
  MdLocationOn,
  MdPhone,
  MdCheckCircle,
  MdLocalShipping,
  MdInventory,
  MdDirectionsCar,
} from 'react-icons/md'
import api from '../../services/api'
import { SkeletonTracking } from '../../components/Common/Skeleton'
import DeliveryMap from '../../components/Common/DeliveryMap'
import {
  connectSocket,
  subscribeToDelivery,
  unsubscribeFromDelivery,
} from '../../services/socket'
import { useAuth } from '../../context/AuthContext'

const steps = [
  { key: 'pending', label: 'Pesanan Dibuat', icon: MdInventory },
  { key: 'confirmed', label: 'Dikonfirmasi', icon: MdCheckCircle },
  { key: 'processing', label: 'Diproses', icon: MdInventory },
  { key: 'shipped', label: 'Dalam Pengiriman', icon: MdLocalShipping },
  { key: 'delivered', label: 'Terkirim', icon: MdCheckCircle },
]

const statusIndex = {
  pending: 0,
  confirmed: 1,
  processing: 2,
  shipped: 3,
  delivered: 4,
}

const Tracking = () => {
  const { orderId } = useParams()
  const { user } = useAuth()
  const [tracking, setTracking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [liveLocation, setLiveLocation] = useState(null)

  const fetchTracking = useCallback(async () => {
    try {
      const r = await api.get(`/tracking/${orderId}`)
      setTracking(r.data)
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    fetchTracking()
    connectSocket(user?.id)
    subscribeToDelivery(orderId, (data) => {
      setLiveLocation(data.location)
      if (data.status) fetchTracking()
    })
    const interval = setInterval(fetchTracking, 30000)
    return () => {
      unsubscribeFromDelivery(orderId)
      clearInterval(interval)
    }
  }, [orderId, user?.id, fetchTracking])

  if (loading) return <SkeletonTracking />
  if (!tracking)
    return (
      <p className="text-gray-500 text-center py-10">
        Pesanan tidak ditemukan.
      </p>
    )

  const { order, delivery } = tracking
  const currentStep = statusIndex[order.status] ?? 0

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Link
          to="/retailer/orders"
          className="text-gray-400 hover:text-gray-600"
        >
          <MdArrowBack className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Lacak Pesanan</h1>
      </div>

      {/* Order Info */}
      <div className="card">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-mono font-bold text-primary-600 text-lg">
              {order.order_number}
            </p>
            <p className="text-sm text-gray-500">Status saat ini</p>
          </div>
          <span className={`badge-${order.status} text-sm`}>
            {order.status}
          </span>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-700 mb-6">
          Progress Pengiriman
        </h2>
        <div className="relative">
          {/* Progress line */}
          <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200" />
          <div
            className="absolute left-4 top-4 w-0.5 bg-primary-500 transition-all duration-700"
            style={{ height: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />

          <div className="space-y-6">
            {steps.map((step, i) => {
              const done = i <= currentStep
              const current = i === currentStep
              return (
                <div
                  key={step.key}
                  className="flex items-center gap-4 relative"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center z-10 flex-shrink-0 transition-colors
                    ${done ? 'bg-primary-600' : 'bg-gray-200'} ${current ? 'ring-4 ring-primary-100' : ''}`}
                  >
                    <step.icon
                      className={`w-4 h-4 ${done ? 'text-white' : 'text-gray-400'}`}
                    />
                  </div>
                  <div>
                    <p
                      className={`font-medium text-sm ${done ? 'text-gray-900' : 'text-gray-400'}`}
                    >
                      {step.label}
                    </p>
                    {current && (
                      <p className="text-xs text-primary-600 font-medium">
                        Status saat ini
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Driver Info & Live Map */}
      {delivery && (
        <>
          {/* Live Map */}
          {order.status === 'shipped' && (
            <div className="card">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">
                Lokasi Real-time
              </h2>
              <DeliveryMap
                driverLocation={
                  liveLocation ||
                  (delivery.lat && delivery.lng
                    ? { lat: delivery.lat, lng: delivery.lng }
                    : null)
                }
                driverName={delivery.driver?.name || 'Driver'}
                height="350px"
              />
              {(liveLocation || (delivery.lat && delivery.lng)) && (
                <div className="mt-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-green-600 font-medium">
                      Lokasi aktif (real-time)
                    </span>
                  </div>
                  <a
                    href={`https://maps.google.com/?q=${liveLocation?.lat ?? delivery.lat},${liveLocation?.lng ?? delivery.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-primary-600 hover:underline"
                  >
                    <MdLocationOn className="w-3 h-3" /> Google Maps
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Driver Info Card */}
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
              Informasi Pengirim
            </h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <MdDirectionsCar className="text-emerald-600 w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {delivery.driver?.name || 'Driver belum assign'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {delivery.driver?.phone}
                  </p>
                </div>
              </div>
              {delivery.driver?.phone && (
                <a
                  href={`tel:${delivery.driver.phone}`}
                  className="flex items-center gap-1 text-sm text-primary-600 hover:underline"
                >
                  <MdPhone className="w-4 h-4" /> Hubungi
                </a>
              )}
            </div>

            {delivery.status && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-gray-500">
                  Status pengiriman:{' '}
                  <span className="font-medium text-gray-700">
                    {delivery.status_label}
                  </span>
                </p>
                {delivery.estimated_arrival && (
                  <p className="text-xs text-gray-500">
                    Estimasi tiba:{' '}
                    <span className="font-medium">
                      {delivery.estimated_arrival?.substring(0, 16)}
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* POD */}
      {delivery?.proof && (
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Bukti Pengiriman
          </h2>
          <div className="space-y-2">
            {delivery.proof.photo && (
              <img
                src={delivery.proof.photo}
                alt="Bukti pengiriman"
                className="w-full max-h-48 object-cover rounded-lg"
              />
            )}
            <p className="text-sm text-gray-700">
              Diterima oleh:{' '}
              <span className="font-medium">
                {delivery.proof.recipient_name}
              </span>
            </p>
            {delivery.proof.notes && (
              <p className="text-xs text-gray-500">{delivery.proof.notes}</p>
            )}
          </div>
        </div>
      )}

      {/* Auto-refresh note */}
      {order.status === 'shipped' && (
        <p className="text-center text-xs text-gray-400">
          🔄 Halaman ini diperbarui otomatis setiap 30 detik
        </p>
      )}
    </div>
  )
}
export default Tracking
