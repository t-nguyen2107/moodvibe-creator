'use client'

import React from 'react'

interface GradientWavesProps {
  className?: string
  intensity?: 'subtle' | 'medium' | 'strong'
}

export function GradientWaves({ className = '', intensity = 'medium' }: GradientWavesProps) {
  const intensityConfig = {
    subtle: '0.3',
    medium: '0.5',
    strong: '0.7',
  }

  const opacity = intensityConfig[intensity]

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Left wave - Blue (cool, tranquil) */}
      <div
        className="absolute top-1/4 left-0 w-[60%] h-[80%] rounded-full blur-[120px] animate-wave-left"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.6) 0%, transparent 70%)',
          opacity,
        }}
      />

      {/* Right wave - Orange/Pink (warm, energetic) */}
      <div
        className="absolute bottom-1/4 right-0 w-[60%] h-[80%] rounded-full blur-[120px] animate-wave-right"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(249, 115, 22, 0.5) 0%, rgba(244, 63, 94, 0.4) 50%, transparent 70%)',
          opacity: String(parseFloat(opacity) * 0.8),
        }}
      />

      {/* Middle transition wave - Pink */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[60%] rounded-full blur-[100px] animate-wave-middle"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(244, 63, 94, 0.4) 0%, transparent 70%)',
          opacity: String(parseFloat(opacity) * 0.6),
        }}
      />

      {/* Bottom accent - extends the waves */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[40%] rounded-full blur-[80px]"
        style={{
          background: 'radial-gradient(ellipse at bottom, rgba(59, 130, 246, 0.3) 0%, transparent 60%)',
          opacity: String(parseFloat(opacity) * 0.3),
        }}
      />
    </div>
  )
}
