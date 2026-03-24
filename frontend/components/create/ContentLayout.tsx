'use client'

import React from 'react'
import { PlaylistPreview } from '@/components/PlaylistPreview'

interface ContentLayoutProps {
  children: React.ReactNode
  showPlaylistPreview?: boolean
}

export function ContentLayout({ children, showPlaylistPreview = true }: ContentLayoutProps) {
  return (
    <div className="w-full mt-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Content (8 cols) */}
        <div className="lg:col-span-8">
          {children}
        </div>

        {/* Right Column: Playlist Preview (4 cols) - Desktop only */}
        {showPlaylistPreview && (
          <div className="hidden lg:block lg:col-span-4">
            <div className="sticky top-28 h-[calc(100vh-8rem)]">
              <PlaylistPreview />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
