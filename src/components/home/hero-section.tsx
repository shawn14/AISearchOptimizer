'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

const platforms = [
  {
    name: 'ChatGPT',
    gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
    icon: (
      <svg className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" className="fill-emerald-600"/>
        <path d="M9 12h6M12 9v6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    message: 'Capture millions of clicks from customers discovering new products and brands through',
  },
  {
    name: 'Google',
    gradient: 'from-blue-600 via-indigo-600 to-violet-600',
    icon: (
      <svg className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20" viewBox="0 0 24 24" fill="none">
        <path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.774-1.645-4.138-2.654-6.735-2.654-5.523 0-10 4.477-10 10s4.477 10 10 10c5.8 0 9.695-4.074 9.695-9.806 0-0.65-0.073-1.298-0.174-1.907h-9.521z" fill="#4285F4"/>
      </svg>
    ),
    message: 'Dominate AI Overview results where your next customer is searching on',
  },
  {
    name: 'Perplexity',
    gradient: 'from-cyan-600 via-blue-600 to-indigo-600',
    icon: (
      <svg className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" className="fill-cyan-600"/>
        <path d="M8 12l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    message: 'Win every recommendation when decision-makers research solutions on',
  },
]

export function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % platforms.length)
        setIsTransitioning(false)
      }, 300)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  const currentPlatform = platforms[currentIndex]

  return (
    <section className="pt-20 pb-12 px-6">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center space-y-8">
          {/* Rotating Message and Logo */}
          <div className="min-h-[280px] md:min-h-[320px] flex flex-col items-center justify-center">
            <div
              className={`transition-opacity duration-300 ${
                isTransitioning ? 'opacity-0' : 'opacity-100'
              }`}
            >
              {/* Logo */}
              <div className="mb-6 flex justify-center">
                {currentPlatform.icon}
              </div>

              {/* Message */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.3] mb-4">
                <span className="text-gray-900">{currentPlatform.message} </span>
                <span className={`bg-gradient-to-r ${currentPlatform.gradient} bg-clip-text text-transparent`}>
                  {currentPlatform.name}
                </span>
              </h1>
            </div>
          </div>

          {/* Static Subheading */}
          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            When customers ask AI <span className="font-semibold text-gray-900">"what's the best..."</span> your brand should be the answer. Track your rankings, optimize your content, and win every recommendation.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-8 h-12 text-base font-medium" asChild>
              <Link href="/signup">
                Start ranking today
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full border-gray-300 px-8 h-12 text-base font-medium hover:bg-gray-50" asChild>
              <Link href="#interactive-demo">Try it free</Link>
            </Button>
          </div>

          {/* Platform Indicators */}
          <div className="flex justify-center gap-2 pt-4">
            {platforms.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsTransitioning(true)
                  setTimeout(() => {
                    setCurrentIndex(index)
                    setIsTransitioning(false)
                  }, 300)
                }}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'w-8 bg-gray-900'
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Switch to ${platforms[index].name}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
