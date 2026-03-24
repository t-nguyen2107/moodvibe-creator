'use client'

import React from 'react'
import { SparklesIcon } from '@heroicons/react/24/outline'
import { useTranslations } from 'next-intl'
import { GradientWaves } from '../GradientWaves'

interface HeroSectionProps {
  showResults: boolean
}

export function HeroSection({ showResults }: HeroSectionProps) {
  const t = useTranslations('create')

  // Don't show hero if there are results (it will take up less space)
  if (showResults) {
    return (
      <div className="px-4 pt-6 pb-4 relative">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-400 via-rose-400 to-orange-400 bg-clip-text text-transparent leading-tight mb-3">
            {t('heroTitle')}
          </h1>
          <p className="text-sm md:text-base font-semibold text-slate-600 dark:text-slate-400">
            {t('heroSubtitle')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-rose-400 font-bold">
              {t('heroSubtitleHighlight')}
            </span>{' '}
            {t('heroSubtitleEnd')}{' '}
            <span className="text-orange-500 dark:text-orange-400 italic">{t('heroExample')}</span>
          </p>
        </div>
      </div>
    )
  }

  return (
    <section className="moodvibe-hero min-h-screen px-4 pt-10 pb-6 flex items-center justify-center relative">
      {/* MoodVibe Gradient Waves */}
      <GradientWaves intensity="medium" />

      <div className="w-full max-w-3xl mx-auto text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-br from-orange-500/10 to-rose-500/10 dark:from-orange-950/40 dark:to-rose-950/40 border-2 border-orange-300/30 dark:border-orange-700/50 mb-8 shadow-lg hover:shadow-orange-500/20 hover:scale-105 transition-all duration-300 backdrop-blur-sm">
          <SparklesIcon className="h-4 w-4 text-orange-500 dark:text-orange-400" />
          <span className="text-sm font-bold text-orange-700 dark:text-orange-300">
            AI-Powered Music Search
          </span>
        </div>

        {/* Title - MoodVibe gradient */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-blue-400 via-rose-400 to-orange-400 bg-clip-text text-transparent leading-tight mb-4">
          {t('heroTitle')}
        </h1>

        {/* Subtitle */}
        <p className="text-base md:text-lg font-semibold text-slate-700 dark:text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
          {t('heroSubtitle')}{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-rose-400 font-bold">
            {t('heroSubtitleHighlight')}
          </span>{' '}
          {t('heroSubtitleEnd')}{' '}
          <span className="text-orange-500 dark:text-orange-400 italic">{t('heroExample')}</span>
        </p>
      </div>
    </section>
  )
}
