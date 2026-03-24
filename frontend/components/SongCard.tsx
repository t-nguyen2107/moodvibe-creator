'use client'

import { Song } from '@/lib/store'
import { PlayIcon, CheckCircleIcon, MusicalNoteIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import { Badge } from './ui/badge'

interface SongCardProps {
  song: Song
  isSelected: boolean
  onSelect: () => void
  onPreview?: () => void
}

export function SongCard({ song, isSelected, onSelect, onPreview }: SongCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePreview = () => {
    if (onPreview) {
      setIsPlaying(!isPlaying)
      onPreview()
    }
  }

  return (
    <div className={`
      p-4 rounded-lg border-2 transition-all
      ${isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}
    `}>
      <div className="flex items-center gap-4">
        {/* Thumbnail */}
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
          {song.thumbnail_url ? (
            <img src={song.thumbnail_url} alt={song.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <MusicalNoteIcon className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Song Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate">{song.title}</h4>
          <p className="text-sm text-gray-600 truncate">{song.artist || 'Unknown Artist'}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={song.is_royalty_free ? 'success' : 'default'}>
              {song.is_royalty_free ? 'Miễn phí bản quyền' : 'Có bản quyền'}
            </Badge>
            <span className="text-xs text-gray-500">
              {song.source} • {song.duration ? `${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}` : '--:--'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {onPreview && (
            <button
              onClick={handlePreview}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Nghe thử"
            >
              {isPlaying ? (
                <PlayIcon className="h-5 w-5 text-purple-600" />
              ) : (
                <PlayIcon className="h-5 w-5 text-gray-600" />
              )}
            </button>
          )}

          <button
            onClick={onSelect}
            className={`
              px-4 py-2 rounded-lg font-medium transition-all
              ${isSelected
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {isSelected ? (
              <span className="flex items-center gap-1">
                <CheckCircleIcon className="h-4 w-4" />
                Đã chọn
              </span>
            ) : (
              'Chọn'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
