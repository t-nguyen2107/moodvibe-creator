'use client'

import { useState, useEffect } from 'react'
import { useApi } from '@/contexts/ApiContext'
import { CogIcon, CheckCircleIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

export function ApiSettings() {
  const { apiStatus, apiBaseUrl, setApiBaseUrl, checkApiStatus } = useApi()
  const [isOpen, setIsOpen] = useState(false)
  const [tempUrl, setTempUrl] = useState(apiBaseUrl)
  const [savedUrls, setSavedUrls] = useState<string[]>([])

  useEffect(() => {
    // Load saved URLs from localStorage on mount
    try {
      const saved = localStorage.getItem('apiUrls')
      if (saved) {
        setSavedUrls(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error)
    }
  }, [])

  const handleSave = () => {
    setApiBaseUrl(tempUrl)
    // Save to localStorage
    if (typeof window !== 'undefined') {
      try {
        const updatedUrls = Array.from(new Set([tempUrl, ...savedUrls]))
        setSavedUrls(updatedUrls)
        localStorage.setItem('apiUrls', JSON.stringify(updatedUrls))
      } catch (error) {
        console.error('Error saving to localStorage:', error)
      }
    }
    checkApiStatus()
  }

  const getStatusColor = () => {
    switch (apiStatus) {
      case 'connected': return 'text-green-500'
      case 'disconnected': return 'text-red-500'
      case 'checking': return 'text-yellow-500'
    }
  }

  const getStatusIcon = () => {
    switch (apiStatus) {
      case 'connected': return <CheckCircleIcon className="h-5 w-5" />
      case 'disconnected': return <XCircleIcon className="h-5 w-5" />
      case 'checking': return <ArrowPathIcon className="h-5 w-5 animate-spin" />
    }
  }

  const getStatusText = () => {
    switch (apiStatus) {
      case 'connected': return 'Connected'
      case 'disconnected': return 'Disconnected'
      case 'checking': return 'Checking...'
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:bg-primary/90 transition-all z-50"
        title="API Settings"
      >
        <CogIcon className="h-6 w-6" />
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" suppressHydrationWarning>
      <div className="bg-card rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 border border-border">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">API Settings</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ✕
          </button>
        </div>

        {/* API Status */}
        <div className="bg-muted/30 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">API Status</p>
              <p className={`font-semibold ${getStatusColor()}`}>
                {getStatusIcon()}
                <span className="ml-2">{getStatusText()}</span>
              </p>
            </div>
            <button
              onClick={checkApiStatus}
              className="px-3 py-1.5 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
            >
              Check
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Current: <code className="bg-muted px-1.5 py-0.5 rounded">{apiBaseUrl}</code>
          </p>
        </div>

        {/* API URL Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">
            API Base URL
          </label>
          <input
            type="text"
            value={tempUrl}
            onChange={(e) => setTempUrl(e.target.value)}
            placeholder="http://localhost:8000"
            className="input w-full"
          />
          <p className="text-xs text-muted-foreground mt-1.5">
            Điền URL backend server (VD: http://localhost:8000)
          </p>
        </div>

        {/* Saved URLs */}
        {savedUrls.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              Saved URLs
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {savedUrls.map((url, index) => (
                <button
                  key={index}
                  onClick={() => setTempUrl(url)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    tempUrl === url
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80 text-foreground'
                  }`}
                >
                  {url}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 btn-primary"
          >
            Save & Check
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
          >
            Close
          </button>
        </div>

        {/* Help */}
        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground">
            <strong>Tip:</strong> Backend cần chạy ở URL này để search nhạc hoạt động.
            Mặc định: <code>http://localhost:8000</code>
          </p>
        </div>
      </div>
    </div>
  )
}
