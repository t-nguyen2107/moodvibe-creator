'use client'

import React, { useEffect, useState } from 'react'
import { MusicalNoteIcon, SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

interface ProgressEvent {
  step: string
  message: string
  progress: number
  source?: string
  total?: number
  songs?: any[]
}

interface SearchProgressProps {
  query: string
  sources: string[]
  limit: number
  onComplete?: (songs: any[]) => void
}

export function SearchProgress({ query, sources, limit, onComplete }: SearchProgressProps) {
  const [events, setEvents] = useState<ProgressEvent[]>([])
  const [currentStep, setCurrentStep] = useState<ProgressEvent | null>(null)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    // Use full backend URL since it's on a different port
    const eventSource = new EventSource(
      `http://localhost:8899/api/music/ai-search/stream?query=${encodeURIComponent(query)}&sources=${sources.join(',')}&limit=${limit}`
    )

    eventSource.onmessage = (event) => {
      try {
        const data: ProgressEvent = JSON.parse(event.data)
        console.log('Progress update:', data) // Debug log
        setCurrentStep(data)
        setEvents((prev) => [...prev, data])

        if (data.step === 'complete') {
          setIsComplete(true)
          eventSource.close()
          if (onComplete && data.songs) {
            onComplete(data.songs)
          }
        }

        if (data.step === 'error') {
          setIsComplete(true)
          eventSource.close()
        }
      } catch (error) {
        console.error('Failed to parse SSE data:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('SSE error:', error)
      eventSource.close()
      setIsComplete(true)
    }

    return () => {
      eventSource.close()
    }
  }, [query, sources, limit, onComplete])

  if (!currentStep) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'analyzing':
        return <SparklesIcon className="h-5 w-5 text-purple-500" />
      case 'generating':
        return <MusicalNoteIcon className="h-5 w-5 text-blue-500" />
      case 'searching':
        return <MusicalNoteIcon className="h-5 w-5 text-green-500" />
      case 'ranking':
        return <SparklesIcon className="h-5 w-5 text-yellow-500" />
      case 'complete':
        return <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
      case 'error':
        return <div className="h-5 w-5 text-red-500">⚠️</div>
      default:
        return <MusicalNoteIcon className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="space-y-4">
      {/* Current Step */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 border border-blue-200 dark:border-slate-700">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            {getStepIcon(currentStep.step)}
          </div>
          <div className="flex-1">
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {currentStep.message}
            </p>
            {currentStep.source && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Source: {currentStep.source}
              </p>
            )}
          </div>
          <div className="flex-shrink-0">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {currentStep.progress}%
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${currentStep.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Step History */}
      {events.length > 1 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Tiến trình
          </p>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {events.slice(0, -1).map((event, index) => (
              <div
                key={index}
                className="flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="flex-shrink-0">
                  {getStepIcon(event.step)}
                </div>
                <div className="flex-1">
                  <p className="text-slate-700 dark:text-slate-300">
                    {event.message}
                  </p>
                  {event.source && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {event.source}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0 text-xs text-slate-500 dark:text-slate-400">
                  {event.progress}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Complete Message */}
      {isComplete && currentStep.step === 'complete' && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 text-center">
          <CheckCircleIcon className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
          <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100 mb-2">
            Hoàn thành! Tìm thấy {currentStep.total || 0} bài hát
          </p>
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            Kết quả đã sẵn sàng để bạn chọn lựa
          </p>
        </div>
      )}

      {/* Error Message */}
      {isComplete && currentStep.step === 'error' && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-lg font-bold text-red-900 dark:text-red-100 mb-2">
            Có lỗi xảy ra
          </p>
          <p className="text-sm text-red-700 dark:text-red-300">
            {currentStep.message}
          </p>
        </div>
      )}
    </div>
  )
}
