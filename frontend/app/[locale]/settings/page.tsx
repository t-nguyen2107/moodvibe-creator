'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { KeyIcon, TrashIcon, SparklesIcon, CheckIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import type { Locale } from '@/i18n'

/**
 * Settings Page - Enhanced with Glassmorphism 2.0
 *
 * Features:
 * - Modern glassmorphism design matching the homepage
 * - Enhanced form inputs with focus states
 * - Beautiful API key cards
 * - Toggle switches with animations
 * - Consistent button styles and gradients
 */

export default function SettingsPage() {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('settings')
  const tCommon = useTranslations('common')
  const tNav = useTranslations('nav')

  const [apiKeys, setApiKeys] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)

  const localizedHref = (href: string) => `/${locale}${href}`

  // New API key form
  const [service, setService] = useState('')
  const [apiKey, setApiKey] = useState('')

  useEffect(() => {
    loadApiKeys()
  }, [])

  const loadApiKeys = async () => {
    try {
      const data = await api.getApiKeys()
      setApiKeys(data.keys || [])
    } catch (error) {
      console.error('Error loading API keys:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStoreApiKey = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!service || !apiKey) return

    try {
      await api.storeApiKey(service, apiKey)
      setService('')
      setApiKey('')
      loadApiKeys()
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error('Error storing API key:', error)
      alert(t('error'))
    }
  }

  const handleDeleteApiKey = async (serviceToDelete: string) => {
    if (confirm(t('deleteConfirm'))) {
      try {
        await api.deleteApiKey(serviceToDelete)
        loadApiKeys()
      } catch (error) {
        console.error('Error deleting API key:', error)
      }
    }
  }

  const services = [
    { value: 'youtube', label: t('instructions.youtube.title'), icon: '🎥', color: 'red' },
    { value: 'tiktok', label: t('instructions.tiktok.title'), icon: '🎵', color: 'pink' },
    { value: 'stable_diffusion', label: t('instructions.stableDiffusion.title'), icon: '🎨', color: 'purple' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Hero Section - Enhanced */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-br from-blue-50 to-primary-100 dark:from-blue-950/50 dark:to-blue-900/50 border-2 border-blue-200 dark:border-blue-800 shadow-lg shadow-blue-600/10 hover:shadow-xl hover:shadow-blue-600/20 hover:scale-105 transition-all duration-300">
              <SparklesIcon className="h-4 w-4 text-primary-500" />
              <span className="text-sm font-bold text-primary-700 dark:text-primary-300">
                Configuration Hub
              </span>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-slate-100 leading-tight">
              {t('title')}
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
              {t('subtitle')}
            </p>
          </div>
        </section>

        {/* Success Alert - Enhanced */}
        {showSuccess && (
          <div className="mb-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="
              p-6 rounded-3xl
              bg-gradient-to-br from-secondary-50 to-secondary-100/50
              dark:from-secondary-950/20 dark:to-secondary-900/20
              border-2 border-secondary-200 dark:border-secondary-800
              shadow-xl shadow-secondary-500/10
              flex items-center gap-4
            ">
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-secondary-500 to-secondary-600 flex items-center justify-center shadow-lg shadow-secondary-500/30">
                <CheckIcon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-secondary-900 dark:text-secondary-400">Success!</h3>
                <p className="text-base text-secondary-700 dark:text-secondary-300">API key has been stored securely.</p>
              </div>
            </div>
          </div>
        )}

        {/* Store New API Key - Enhanced */}
        <section className="mb-12 max-w-3xl mx-auto">
          <div className="
            p-8 rounded-3xl
            bg-white/80 dark:bg-slate-900/80
            backdrop-blur-2xl
            border-2 border-slate-200/50 dark:border-slate-700/50
            shadow-xl
            hover:shadow-2xl hover:shadow-blue-600/10
            transition-all duration-300
          ">
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600/20 to-primary-600/20 flex items-center justify-center shadow-lg shadow-blue-600/20">
                <KeyIcon className="h-7 w-7 text-blue-700 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {t('addNewKey.title')}
                </h2>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-1">
                  Add a new API key to enable additional features
                </p>
              </div>
            </div>

            <form onSubmit={handleStoreApiKey} className="space-y-6">
              {/* Service Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  {t('addNewKey.service')}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {services.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setService(s.value)}
                      className={`
                        relative p-5 rounded-2xl border-2 transition-all duration-300
                        hover:scale-105
                        ${
                          service === s.value
                            ? `border-${s.color}-500 bg-${s.color}-50 dark:bg-${s.color}-950/20 shadow-lg shadow-${s.color}-500/20`
                            : 'border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600'
                        }
                      `}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <span className="text-3xl">{s.icon}</span>
                        <span className={`text-sm font-bold ${service === s.value ? `text-${s.color}-700 dark:text-${s.color}-400` : 'text-slate-700 dark:text-slate-300'}`}>
                          {s.label}
                        </span>
                      </div>
                      {service === s.value && (
                        <div className={`absolute top-3 right-3 w-6 h-6 rounded-full bg-${s.color}-500 flex items-center justify-center`}>
                          <CheckIcon className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* API Key Input */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  {t('addNewKey.apiKey')}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder={t('addNewKey.apiKeyPlaceholder')}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="
                      w-full px-6 py-4
                      bg-white/90 dark:bg-slate-800/90
                      backdrop-blur-xl
                      border-2 border-slate-200/50 dark:border-slate-700/50
                      rounded-2xl
                      text-slate-900 dark:text-slate-100
                      placeholder:text-slate-400
                      font-medium
                      focus:outline-none
                      focus:border-primary-400 dark:focus:border-primary-600
                      focus:ring-2 focus:ring-primary-500/20
                      hover:border-primary-300 dark:hover:border-primary-700
                      transition-all duration-200
                      shadow-lg
                    "
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
                    <KeyIcon className="h-5 w-5 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!service || !apiKey}
                className="
                  w-full px-8 py-4
                  bg-gradient-to-r from-blue-400 via-rose-400 to-orange-400
                  bg-[length:200%_200%]
                  text-white font-black text-base rounded-2xl
                  shadow-xl shadow-blue-600/30
                  hover:shadow-2xl hover:shadow-blue-600/40
                  hover:scale-105
                  active:scale-95
                  transition-all duration-300
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                  flex items-center justify-center gap-3
                  animate-gradient
                "
              >
                <KeyIcon className="h-5 w-5" />
                <span>{t('addNewKey.saveButton')}</span>
              </button>
            </form>
          </div>
        </section>

        {/* Stored API Keys - Enhanced */}
        <section className="mb-12 max-w-4xl mx-auto">
          <div className="
            p-8 rounded-3xl
            bg-white/80 dark:bg-slate-900/80
            backdrop-blur-2xl
            border-2 border-slate-200/50 dark:border-slate-700/50
            shadow-xl
          ">
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary-500/20 to-secondary-600/20 flex items-center justify-center shadow-lg shadow-secondary-500/20">
                <KeyIcon className="h-7 w-7 text-secondary-600 dark:text-secondary-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {t('storedKeys.title')}
                </h2>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-1">
                  Manage your connected API keys
                </p>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-secondary-500/20 via-secondary-600/20 to-rose-500/20 rounded-full blur-2xl animate-pulse" />
                    <div className="relative w-16 h-16 border-4 border-slate-200 border-t-secondary-500 rounded-full animate-spin"></div>
                  </div>
                  <p className="text-lg font-semibold text-slate-600 dark:text-slate-400">
                    Loading API keys...
                  </p>
                </div>
              </div>
            ) : apiKeys.length === 0 ? (
              <div className="text-center py-16 space-y-6">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950 rounded-3xl flex items-center justify-center shadow-2xl shadow-slate-500/10">
                  <KeyIcon className="h-12 w-12 text-slate-400 dark:text-slate-500" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                    No API Keys Yet
                  </h3>
                  <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
                    {t('storedKeys.emptyState')}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {apiKeys.map((key) => {
                  const serviceInfo = services.find((s) => s.value === key.service)
                  return (
                    <div
                      key={key.id}
                      className="
                        group
                        p-6 rounded-2xl
                        bg-white/90 dark:bg-slate-800/90
                        backdrop-blur-xl
                        border-2 border-slate-200/50 dark:border-slate-700/50
                        shadow-lg
                        hover:shadow-xl hover:shadow-blue-600/10
                        hover:scale-[1.01]
                        transition-all duration-300
                        flex items-center justify-between
                      "
                    >
                      <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-${serviceInfo?.color}-500/20 to-${serviceInfo?.color}-600/20 flex items-center justify-center shadow-lg`}>
                          <span className="text-2xl">{serviceInfo?.icon}</span>
                        </div>
                        <div>
                          <p className="font-bold text-lg text-slate-900 dark:text-slate-100">
                            {serviceInfo?.label || key.service}
                          </p>
                          <p className="text-sm font-mono text-slate-600 dark:text-slate-400 mt-1">
                            {key.masked_key}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteApiKey(key.service)}
                        className="
                          px-5 py-3
                          bg-white dark:bg-slate-800
                          border-2 border-slate-200 dark:border-slate-700
                          text-red-600 rounded-xl
                          hover:bg-red-50 dark:hover:bg-red-950/20
                          hover:border-red-300 dark:hover:border-red-800
                          hover:scale-105
                          active:scale-95
                          transition-all duration-200
                          shadow-md
                          flex items-center gap-2
                          font-semibold
                        "
                      >
                        <TrashIcon className="h-4 w-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        {/* Setup Instructions - Enhanced */}
        <section className="max-w-4xl mx-auto">
          <div className="
            p-8 rounded-3xl
            bg-white/80 dark:bg-slate-900/80
            backdrop-blur-2xl
            border-2 border-slate-200/50 dark:border-slate-700/50
            shadow-xl
          ">
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-500/20 to-accent-600/20 flex items-center justify-center shadow-lg shadow-accent-500/20">
                <InformationCircleIcon className="h-7 w-7 text-accent-600 dark:text-accent-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {t('instructions.title')}
                </h2>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-1">
                  Follow these guides to get your API keys
                </p>
              </div>
            </div>

            <div className="space-y-8">
              {services.map((serviceInfo, idx) => (
                <div
                  key={serviceInfo.value}
                  className="
                    p-6 rounded-2xl
                    bg-gradient-to-br from-slate-50/50 to-slate-100/50
                    dark:from-slate-900/50 dark:to-slate-950/50
                    border-2 border-slate-200/50 dark:border-slate-700/50
                    shadow-lg
                    hover:shadow-xl hover:shadow-blue-600/5
                    transition-all duration-300
                  "
                >
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-3">
                    <span className="text-2xl">{serviceInfo.icon}</span>
                    {serviceInfo.label}
                  </h3>
                  <ol className="space-y-3">
                    {t.raw(`instructions.${serviceInfo.value}.steps`).map((step: string, i: number) => (
                      <li key={i} className="flex items-start gap-4">
                        <div className={`
                          flex-shrink-0 w-8 h-8 rounded-xl
                          bg-gradient-to-br from-${serviceInfo.color}-500 to-${serviceInfo.color}-600
                          flex items-center justify-center
                          shadow-lg shadow-${serviceInfo.color}-500/20
                          font-bold text-white text-sm
                        `}>
                          {i + 1}
                        </div>
                        <p className="text-base font-medium text-slate-700 dark:text-slate-300 leading-relaxed pt-1">
                          {step}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
