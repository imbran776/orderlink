import React, { useState, useRef } from 'react'
import { MdCloudUpload } from 'react-icons/md'

const ImageUpload = ({
  value = null,
  onChange,
  label = 'Upload Gambar',
  accept = 'image/*',
  maxSize = 5, // MB
}) => {
  const [dragActive, setDragActive] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(value)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  const handleFile = (file) => {
    setError('')

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar')
      return
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`Ukuran file maksimal ${maxSize}MB`)
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result)
    }
    reader.readAsDataURL(file)

    // Send file to parent
    onChange(file)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleRemove = () => {
    setPreviewUrl(null)
    onChange(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div className="w-full">
      {label && <label className="label">{label}</label>}

      {/* Upload area */}
      {!previewUrl ? (
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer
            ${
              dragActive
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
            }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept={accept}
            onChange={handleChange}
          />

          <MdCloudUpload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-sm font-medium text-gray-700 mb-1">
            Klik atau drag & drop gambar di sini
          </p>
          <p className="text-xs text-gray-500">
            PNG, JPG, JPEG hingga {maxSize}MB
          </p>
        </div>
      ) : (
        /* Preview area */
        <div className="relative group">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-48 object-cover rounded-xl border-2 border-gray-200"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="bg-white text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition"
            >
              Ganti
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition"
            >
              Hapus
            </button>
          </div>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept={accept}
            onChange={handleChange}
          />
        </div>
      )}

      {/* Error message */}
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  )
}

export default ImageUpload
