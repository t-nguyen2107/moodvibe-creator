'use client';

import { PlayIcon, SparklesIcon, MusicalNoteIcon } from '@heroicons/react/24/outline'
import { useTranslations } from 'next-intl';
import { NavLink } from '@/components/NavLink';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { GradientWaves } from '@/components/GradientWaves';

export default function Home() {
  const t = useTranslations('home');
  const tNav = useTranslations('nav');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main id="main-content">
        {/* Hero Section - MoodVibe Style with Gradient Waves */}
        <section className="moodvibe-hero min-h-[75vh] flex items-center relative overflow-hidden">
          {/* MoodVibe Gradient Waves */}
          <GradientWaves intensity="medium" />

          <div className="container-custom text-center relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-br from-orange-500/10 to-rose-500/10 dark:from-orange-950/40 dark:to-rose-950/40 border-2 border-orange-300/30 dark:border-orange-700/50 mb-10 shadow-lg hover:shadow-orange-500/20 hover:scale-105 transition-all duration-300 backdrop-blur-sm">
              <SparklesIcon className="h-4 w-4 text-orange-500 dark:text-orange-400" />
              <span className="text-sm font-bold text-orange-700 dark:text-orange-300">
                {t('badge')}
              </span>
            </div>

            {/* Heading - MoodVibe gradient */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-8 text-slate-900 dark:text-slate-100 leading-tight tracking-tight">
              {t('heroTitle')}
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-rose-400 to-orange-400 bg-clip-text text-transparent">
                {t('heroTitleHighlight')}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-14 max-w-3xl mx-auto leading-relaxed font-medium">
              {t('heroSubtitle')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <NavLink
                href="/create"
                className="
                  px-10 py-5 rounded-2xl
                  bg-gradient-to-r from-blue-500 via-rose-500 to-orange-500
                  bg-[length:200%_200%]
                  text-white font-black text-base
                  shadow-xl shadow-blue-500/30
                  hover:shadow-2xl hover:shadow-orange-500/40
                  hover:scale-105
                  active:scale-95
                  transition-all duration-300
                  inline-flex items-center justify-center gap-3
                  relative overflow-hidden
                "
                aria-label={`${t('getStarted')} - ${tNav('create')}`}
              >
                <PlayIcon className="h-5 w-5" aria-hidden="true" />
                <span>{t('getStarted')}</span>
              </NavLink>
              <NavLink
                href="/library"
                className="
                  px-10 py-5 rounded-2xl
                  bg-white dark:bg-slate-800
                  border-2 border-slate-200 dark:border-slate-700
                  text-slate-700 dark:text-slate-300
                  font-black text-base
                  hover:border-blue-500 dark:hover:border-blue-700
                  hover:shadow-xl hover:shadow-blue-600/10
                  hover:scale-105
                  active:scale-95
                  transition-all duration-300
                  inline-flex items-center justify-center
                "
                aria-label={`${t('viewLibrary')} - ${tNav('library')}`}
              >
                <span>{t('viewLibrary')}</span>
              </NavLink>
            </div>
          </div>
        </section>

        {/* Stats Section - Connected with Hero Background */}
        <section className="py-20 relative overflow-hidden hero-section">
          <div className="container-custom relative z-10">
            <div className="grid grid-cols-3 gap-8">
              <div className="text-center p-8 rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-2 border-blue-200/50 dark:border-blue-800/50 shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 hover:scale-105 transition-all duration-300">
                <div className="text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-400 via-rose-400 to-orange-400 bg-clip-text text-transparent mb-3">3+</div>
                <div className="text-sm font-bold text-slate-700 dark:text-slate-300">Music Sources</div>
              </div>
              <div className="text-center p-8 rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-2 border-orange-200/50 dark:border-orange-800/50 shadow-xl hover:shadow-2xl hover:shadow-orange-500/20 hover:scale-105 transition-all duration-300">
                <div className="text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-400 via-rose-400 to-orange-400 bg-clip-text text-transparent mb-3">100K+</div>
                <div className="text-sm font-bold text-slate-700 dark:text-slate-300">Songs Available</div>
              </div>
              <div className="text-center p-8 rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-2 border-rose-200/50 dark:border-rose-800/50 shadow-xl hover:shadow-2xl hover:shadow-rose-500/20 hover:scale-105 transition-all duration-300">
                <div className="text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-400 via-rose-400 to-orange-400 bg-clip-text text-transparent mb-3">Free</div>
                <div className="text-sm font-bold text-slate-700 dark:text-slate-300">Forever</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Enhanced with Solid Background */}
        <section className="py-28 bg-slate-50/80 dark:bg-slate-900/80 border-y-2 border-slate-200/50 dark:border-slate-700/50">
          <div className="container-custom">
            {/* Section Header - Enhanced */}
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-slate-100 mb-6">
                Everything You Need
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
                Powerful features to help you create, manage, and share your music playlists
              </p>
            </div>

            {/* Features Grid - Enhanced Cards */}
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 - Enhanced */}
              <div className="group">
                <div className="
                  p-8 rounded-3xl
                  bg-white/80 dark:bg-slate-900/80
                  backdrop-blur-2xl
                  border-2 border-slate-200/50 dark:border-slate-700/50
                  shadow-xl
                  hover:shadow-2xl hover:shadow-blue-600/20
                  hover:border-blue-500 dark:hover:border-blue-700
                  hover:-translate-y-2
                  transition-all duration-300
                  relative overflow-hidden
                ">
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-primary-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600/20 to-primary-600/20 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-blue-600/20">
                      <MusicalNoteIcon className="h-8 w-8 text-blue-700 dark:text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 group-hover:text-blue-700 dark:group-hover:text-primary-400 transition-colors">
                      Multi-Source Search
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                      Search across YouTube, SoundCloud, and Pixabay simultaneously. Find exactly what you're looking for.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 2 - Enhanced */}
              <div className="group">
                <div className="
                  p-8 rounded-3xl
                  bg-white/80 dark:bg-slate-900/80
                  backdrop-blur-2xl
                  border-2 border-slate-200/50 dark:border-slate-700/50
                  shadow-xl
                  hover:shadow-2xl hover:shadow-orange-600/20
                  hover:border-orange-500 dark:hover:border-orange-700
                  hover:-translate-y-2
                  transition-all duration-300
                  relative overflow-hidden
                ">
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-orange-600/20">
                      <SparklesIcon className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 group-hover:text-orange-600 dark:group-hover:text-secondary-400 transition-colors">
                      AI-Generated Covers
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                      Automatically generate beautiful, unique playlist covers using Stable Diffusion AI technology.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 3 - Enhanced */}
              <div className="group">
                <div className="
                  p-8 rounded-3xl
                  bg-white/80 dark:bg-slate-900/80
                  backdrop-blur-2xl
                  border-2 border-slate-200/50 dark:border-slate-700/50
                  shadow-xl
                  hover:shadow-2xl hover:shadow-rose-600/20
                  hover:border-rose-500 dark:hover:border-rose-700
                  hover:-translate-y-2
                  transition-all duration-300
                  relative overflow-hidden
                ">
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-500/5 to-accent-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-500/20 to-accent-600/20 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-rose-600/20">
                      <PlayIcon className="h-8 w-8 text-rose-600 dark:text-rose-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4 group-hover:text-rose-600 dark:group-hover:text-accent-400 transition-colors">
                      Easy Sharing
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                      Upload directly to TikTok, YouTube, and other platforms. Share your playlists with one click.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section - Connected Background */}
        <section className="py-28 hero-section">
          <div className="container-custom">
            {/* Section Header - Enhanced */}
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-slate-100 mb-6">
                How It Works
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
                Create your playlist in three simple steps
              </p>
            </div>

            {/* Steps - Enhanced Cards */}
            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connection Lines - Animated Gradient */}
              <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-1 bg-gradient-to-r from-blue-400 via-rose-400 to-orange-400 opacity-30"></div>

              {/* Step 1 - Enhanced */}
              <div className="relative group">
                <div className="
                  p-8 rounded-3xl
                  bg-white/80 dark:bg-slate-900/80
                  backdrop-blur-2xl
                  border-2 border-slate-200/50 dark:border-slate-700/50
                  shadow-xl
                  hover:shadow-2xl hover:shadow-blue-600/20
                  hover:border-blue-500 dark:hover:border-blue-700
                  hover:-translate-y-2
                  transition-all duration-300
                  relative z-10
                ">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-primary-600 flex items-center justify-center mb-6 shadow-xl shadow-blue-600/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <span className="text-3xl font-black text-white">1</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                    Choose Mood & Genre
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                    Select from 20 moods and 30 genres to define your playlist's vibe
                  </p>
                </div>
              </div>

              {/* Step 2 - Enhanced */}
              <div className="relative group">
                <div className="
                  p-8 rounded-3xl
                  bg-white/80 dark:bg-slate-900/80
                  backdrop-blur-2xl
                  border-2 border-slate-200/50 dark:border-slate-700/50
                  shadow-xl
                  hover:shadow-2xl hover:shadow-orange-600/20
                  hover:border-orange-500 dark:hover:border-orange-700
                  hover:-translate-y-2
                  transition-all duration-300
                  relative z-10
                ">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-6 shadow-xl shadow-orange-600/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <span className="text-3xl font-black text-white">2</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                    Search & Select Songs
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                    Browse through thousands of songs and add up to 20 tracks
                  </p>
                </div>
              </div>

              {/* Step 3 - Enhanced */}
              <div className="relative group">
                <div className="
                  p-8 rounded-3xl
                  bg-white/80 dark:bg-slate-900/80
                  backdrop-blur-2xl
                  border-2 border-slate-200/50 dark:border-slate-700/50
                  shadow-xl
                  hover:shadow-2xl hover:shadow-rose-600/20
                  hover:border-rose-500 dark:hover:border-rose-700
                  hover:-translate-y-2
                  transition-all duration-300
                  relative z-10
                ">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center mb-6 shadow-xl shadow-rose-600/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <span className="text-3xl font-black text-white">3</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                    Generate & Share
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                    Customize settings and generate your playlist with AI cover art
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Connected Background */}
        <section className="py-36 hero-section relative overflow-hidden">
          <div className="container-custom text-center relative z-10">
            {/* Single animated gradient orb */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-br from-blue-500/20 via-orange-500/15 to-rose-500/20 rounded-full blur-3xl animate-pulse" />

            <div className="
              p-16 md:p-20 rounded-[2.5rem]
              bg-white/80 dark:bg-slate-900/80
              backdrop-blur-2xl
              border-2 border-slate-200/50 dark:border-slate-700/50
              shadow-2xl shadow-blue-500/10 dark:shadow-orange-500/10
              relative overflow-hidden
            ">
              {/* Single subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-orange-500/5 to-rose-500/5 opacity-50" />

              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-slate-100 mb-6">
                  Ready to Create Your Playlist?
                </h2>
                <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
                  Join thousands of users creating amazing music playlists every day
                </p>
                <NavLink
                  href="/create"
                  className="
                    inline-flex items-center justify-center gap-3
                    px-12 py-5 rounded-2xl
                    bg-gradient-to-r from-blue-400 via-rose-400 to-orange-400
                    bg-[length:200%_200%]
                    text-white font-black text-base
                    shadow-xl shadow-blue-500/30
                    hover:shadow-2xl hover:shadow-orange-500/40
                    hover:scale-105
                    active:scale-95
                    transition-all duration-300
                    relative overflow-hidden
                  "
                >
                  <PlayIcon className="h-5 w-5" aria-hidden="true" />
                  <span>Get Started Now</span>
                </NavLink>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer variant="enhanced" />
    </div>
  )
}
