// =====================================================================
//  ImageUploader — campo de imagem com botão "Enviar arquivo" + URL.
//  Usa POST /api/admin/upload e retorna a URL relativa via onChange.
// =====================================================================

import { useRef, useState } from 'react'
import { Image as ImageIcon, Upload, Loader2, X } from 'lucide-react'
import { uploadImage, imageUrl } from '../../lib/api'

export default function ImageUploader({ value, onChange, className = '', size = 'md' }) {
  const fileRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [err, setErr] = useState(null)

  const sizes = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  }
  const previewSize = sizes[size] || sizes.md

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setErr('Selecione uma imagem'); return }
    setErr(null)
    setUploading(true)
    try {
      const { url } = await uploadImage(file)
      onChange(url)
    } catch (e) {
      setErr(e.message)
    } finally {
      setUploading(false)
      e.target.value = ''   // permite upload do mesmo arquivo de novo
    }
  }

  return (
    <div className={`flex gap-3 items-start ${className}`}>
      <div className={`${previewSize} bg-urban-card border border-urban-border rounded-md grid place-items-center overflow-hidden flex-shrink-0 relative`}>
        {value ? (
          <img src={imageUrl(value)} alt="" className="w-full h-full object-cover" />
        ) : (
          <ImageIcon size={20} className="text-urban-muted" />
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/70 grid place-items-center">
            <Loader2 size={16} className="animate-spin" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Cole uma URL ou clique em Enviar"
          className="w-full bg-urban-card border border-urban-border rounded-md px-3.5 h-10 text-sm placeholder:text-urban-muted focus:outline-none focus:border-urban-red/60"
        />
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 px-3 h-8 border border-urban-border rounded-md text-xs font-semibold tracking-widest text-white/80 hover:border-white disabled:opacity-50"
          >
            <Upload size={12} /> {uploading ? 'ENVIANDO…' : 'ENVIAR ARQUIVO'}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="inline-flex items-center gap-1 px-2 h-8 text-xs text-urban-red hover:underline"
            >
              <X size={12} /> Remover
            </button>
          )}
        </div>
        {err && <p className="text-[10px] text-urban-red mt-1">{err}</p>}
      </div>
    </div>
  )
}
