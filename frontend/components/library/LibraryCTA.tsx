'use client'

import React from 'react'
import { SparklesIcon } from '@heroicons/react/24/outline'

interface LibraryCTAProps {
  onCreateClick: () => void
  text?: string
}

export function LibraryCTA({ onCreateClick, text = 'Create New Playlist' }: LibraryCTAProps) {
  return (
    <section className="px-4 py-6">
      <div className="container mx-auto max-w-4xl">
        <button
          onClick={onCreateClick}
          className="
            w-full
            px-6 py-4
            bg-gradient-to-r from-blue-400 via-rose-400 to-orange-400
            text-white font-bold text-base
            rounded-xl
            shadow-md hover:shadow-lg
            hover:scale-[1.01]
            active:scale-[0.99]
            transition-all duration-200
            flex items-center justify-center gap-2
          "
        >
          <SparklesIcon className="h-5 w-5" />
          <span>{text}</span>
        </button>
      </div>
    </section>
  )
}
