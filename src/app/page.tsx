'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export default function Home() {
  const [totalSeconds, setTotalSeconds] = useState(5 * 60) // Default 5 minutes
  const [warningSeconds, setWarningSeconds] = useState(1 * 60) // Default 1 minute warning
  const [remainingSeconds, setRemainingSeconds] = useState(5 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [pulseEnabled, setPulseEnabled] = useState(true)
  const [isFlashing, setIsFlashing] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const flashTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Calculate progress (0 to 1, where 1 is full and 0 is empty)
  const progress = totalSeconds > 0 ? remainingSeconds / totalSeconds : 0

  // Check if in warning zone
  const isWarning = isRunning && remainingSeconds > 0 && remainingSeconds <= warningSeconds

  // Theme colors based on state:
  // Blue - not running (ready/paused) or complete
  // Green - running, not in warning
  // Red - running, in warning
  const getThemeColor = () => {
    if (!isRunning || remainingSeconds === 0) {
      // Blue - idle/complete state
      return { 
        primary: '#00d9ff', 
        secondary: '#0099cc', 
        glow: 'rgba(0, 217, 255, 0.6)',
        outline: '#1a2a3a',
        outlineInner: '#112233'
      }
    }
    if (isWarning) {
      // Red - warning state
      return { 
        primary: '#ff5555', 
        secondary: '#cc2222', 
        glow: 'rgba(255, 50, 50, 0.7)',
        outline: '#3a1a1a',
        outlineInner: '#331111'
      }
    }
    // Green - running state
    return { 
      primary: '#4ade80', 
      secondary: '#22c55e', 
      glow: 'rgba(74, 222, 128, 0.6)',
      outline: '#1a3a2a',
      outlineInner: '#112211'
    }
  }
  const themeColor = getThemeColor()

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Timer logic
  useEffect(() => {
    if (isRunning && remainingSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            setIsRunning(false)
            setIsFlashing(true) // Start flashing when complete
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, remainingSeconds])

  // Auto-stop flashing after 10 seconds
  useEffect(() => {
    if (isFlashing) {
      flashTimeoutRef.current = setTimeout(() => {
        setIsFlashing(false)
      }, 10000) // 10 seconds
    }

    return () => {
      if (flashTimeoutRef.current) {
        clearTimeout(flashTimeoutRef.current)
      }
    }
  }, [isFlashing])

  // Stop flashing on click
  const handleScreenClick = useCallback(() => {
    if (isFlashing) {
      setIsFlashing(false)
      if (flashTimeoutRef.current) {
        clearTimeout(flashTimeoutRef.current)
      }
    }
  }, [isFlashing])

  const handleStart = useCallback(() => {
    if (remainingSeconds > 0) {
      setIsRunning(true)
      setIsFlashing(false)
    }
  }, [remainingSeconds])

  const handlePause = useCallback(() => {
    setIsRunning(false)
  }, [])

  const handleReset = useCallback(() => {
    setIsRunning(false)
    setIsFlashing(false)
    setRemainingSeconds(totalSeconds)
  }, [totalSeconds])

  const adjustMinutes = useCallback((delta: number) => {
    const newTotal = Math.max(60, Math.min(180 * 60, totalSeconds + delta * 60))
    setTotalSeconds(newTotal)
    if (!isRunning) {
      setRemainingSeconds(newTotal)
    }
    // Ensure warning is always less than total
    if (warningSeconds >= newTotal) {
      setWarningSeconds(Math.max(0, newTotal - 60))
    }
  }, [totalSeconds, isRunning, warningSeconds])

  const adjustWarningMinutes = useCallback((delta: number) => {
    const newWarning = Math.max(0, Math.min(totalSeconds - 60, warningSeconds + delta * 60))
    setWarningSeconds(newWarning)
  }, [totalSeconds, warningSeconds])

  // SVG arc calculation for the timer sector
  // Draws counter-clockwise from top, so the sector decreases clockwise as time runs out
  const createArcPath = (progress: number, radius: number, centerX: number, centerY: number) => {
    if (progress <= 0) return ''
    if (progress >= 1) {
      return `M ${centerX} ${centerY - radius} A ${radius} ${radius} 0 1 0 ${centerX + 0.001} ${centerY - radius} Z`
    }

    const angle = progress * 360
    const startAngle = -90 // Start from top (12 o'clock)
    const endAngle = startAngle - angle // Go counter-clockwise

    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180

    const x1 = centerX + radius * Math.cos(startRad)
    const y1 = centerY + radius * Math.sin(startRad)
    const x2 = centerX + radius * Math.cos(endRad)
    const y2 = centerY + radius * Math.sin(endRad)

    const largeArcFlag = angle > 180 ? 1 : 0

    // sweep-flag = 0 for counter-clockwise direction
    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${x2} ${y2} Z`
  }

  // SVG dimensions - will scale to 90% of viewport height
  const svgSize = 1000
  const center = svgSize / 2
  const outerRadius = 460
  const innerRadius = 360

  return (
    <main 
      className="h-screen w-screen flex items-center relative overflow-hidden"
      onClick={handleScreenClick}
    >
      {/* Ambient background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: '28.5%',
            transform: 'translateX(-50%) translateY(-50%)',
            width: '90vh',
            height: '90vh',
            background: `radial-gradient(circle, ${themeColor.glow} 0%, transparent 70%)`,
            transition: 'background 0.5s ease',
            opacity: isRunning && pulseEnabled ? undefined : 0.4,
            animation: isRunning && pulseEnabled ? 'pulse-opacity 3s ease-in-out infinite' : 'none'
          }}
        />
      </div>

      {/* Left Side - Clock Face (57% width, centered vertically) */}
      <div style={{ width: '57%' }} className="h-full flex items-center justify-center">
        <svg
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          className="transition-all duration-300"
          style={{
            height: '90vh',
            width: '90vh',
            maxWidth: '100%',
            filter: `drop-shadow(0 0 ${isRunning ? '40px' : '20px'} ${themeColor.glow})`
          }}
        >
          {/* Definitions */}
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="12" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <linearGradient id="sectorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={themeColor.primary}/>
              <stop offset="100%" stopColor={themeColor.secondary}/>
            </linearGradient>
            <radialGradient id="faceGradient" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#1a1a28"/>
              <stop offset="100%" stopColor="#0f0f15"/>
            </radialGradient>
          </defs>

          {/* Clock face background */}
          <circle
            cx={center}
            cy={center}
            r={outerRadius}
            fill="url(#faceGradient)"
            stroke={themeColor.outline}
            strokeWidth="6"
          />

          {/* Timer sector (the decreasing pie) */}
          <path
            d={createArcPath(progress, innerRadius, center, center)}
            fill="url(#sectorGradient)"
            filter={isRunning ? "url(#glow)" : ""}
            className="transition-all duration-200"
            style={{
              opacity: progress > 0 ? 1 : 0
            }}
          />

          {/* Inner circle (creates the ring effect) */}
          <circle
            cx={center}
            cy={center}
            r={innerRadius - 260}
            fill="#0a0a0f"
            stroke={themeColor.outlineInner}
            strokeWidth="4"
          />

          {/* Center dot */}
          <circle
            cx={center}
            cy={center}
            r="20"
            fill={themeColor.primary}
            className="transition-colors duration-300"
          />

          {/* Tick marks around the edge */}
          {Array.from({ length: 60 }).map((_, i) => {
            const angle = (i * 6 - 90) * (Math.PI / 180)
            const isMajor = i % 5 === 0
            const innerR = outerRadius - (isMajor ? 50 : 30)
            const outerR = outerRadius - 10
            const x1 = center + innerR * Math.cos(angle)
            const y1 = center + innerR * Math.sin(angle)
            const x2 = center + outerR * Math.cos(angle)
            const y2 = center + outerR * Math.sin(angle)
            
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isMajor ? "#4a4a5e" : "#2a2a38"}
                strokeWidth={isMajor ? 5 : 3}
                strokeLinecap="round"
              />
            )
          })}
        </svg>
      </div>

      {/* Right Side - Time Display (43% width) */}
      <div style={{ width: '43%' }} className="h-full flex flex-col items-center justify-center pr-8">
        <div 
          className="font-display tracking-wider text-center animate-fade-in"
          style={{ fontSize: 'clamp(100px, 20vw, 240px)', lineHeight: 1 }}
        >
          <span 
            className="transition-colors duration-300"
            style={{ color: themeColor.primary }}
          >
            {formatTime(remainingSeconds)}
          </span>
        </div>

        {/* Status indicator */}
        <div 
          className="mt-6 text-lg uppercase tracking-widest transition-colors duration-300"
          style={{ color: themeColor.primary }}
        >
          {remainingSeconds === 0 ? 'Complete' : isWarning ? 'Warning' : isRunning ? 'Running' : 'Ready'}
        </div>
      </div>

      {/* Controls - Bottom Left (Only Start/Pause & Reset) */}
      <div className="fixed bottom-6 left-6 flex gap-2 animate-fade-in" onClick={e => e.stopPropagation()}>
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="btn"
            disabled={remainingSeconds === 0}
            style={{ 
              borderColor: themeColor.secondary,
              color: themeColor.primary
            }}
          >
            Start
          </button>
        ) : (
          <button 
            onClick={handlePause} 
            className="btn"
            style={{ 
              borderColor: themeColor.secondary,
              color: themeColor.primary
            }}
          >
            Pause
          </button>
        )}
        <button 
          onClick={handleReset} 
          className="btn"
          style={{ 
            borderColor: themeColor.secondary,
            color: themeColor.primary
          }}
        >
          Reset
        </button>
      </div>

      {/* Settings Tab - Bottom Right */}
      <div className="fixed bottom-6 right-6 animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="relative">
          {/* Settings Panel */}
          <div 
            className={`absolute bottom-full right-0 mb-2 p-4 rounded-lg bg-timer-face/95 border border-timer-ring backdrop-blur-sm transition-all duration-200 min-w-[200px] ${
              settingsOpen 
                ? 'opacity-100 translate-y-0 pointer-events-auto' 
                : 'opacity-0 translate-y-2 pointer-events-none'
            }`}
          >
            {/* Main Time Setting */}
            <div className="mb-4">
              <div className="text-xs text-timer-muted uppercase tracking-wider mb-2">
                Timer (min)
              </div>
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => adjustMinutes(-1)}
                  className="btn btn-icon flex-shrink-0"
                  disabled={isRunning}
                >
                  −
                </button>
                <span className="font-mono text-xl text-timer-text text-center flex-1">
                  {Math.floor(totalSeconds / 60)}
                </span>
                <button
                  onClick={() => adjustMinutes(1)}
                  className="btn btn-icon flex-shrink-0"
                  disabled={isRunning}
                >
                  +
                </button>
              </div>
            </div>

            {/* Warning Time Setting */}
            <div className="mb-4">
              <div className="text-xs text-red-400 uppercase tracking-wider mb-2">
                Warning (min)
              </div>
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => adjustWarningMinutes(-1)}
                  className="btn btn-icon flex-shrink-0"
                  disabled={isRunning || warningSeconds <= 0}
                >
                  −
                </button>
                <span className="font-mono text-xl text-red-400 text-center flex-1">
                  {Math.floor(warningSeconds / 60)}
                </span>
                <button
                  onClick={() => adjustWarningMinutes(1)}
                  className="btn btn-icon flex-shrink-0"
                  disabled={isRunning || warningSeconds >= totalSeconds - 60}
                >
                  +
                </button>
              </div>
            </div>

            {/* Pulse Toggle */}
            <button
              onClick={() => setPulseEnabled(!pulseEnabled)}
              className="btn w-full text-xs"
              style={pulseEnabled ? { 
                borderColor: themeColor.secondary,
                color: themeColor.primary
              } : {}}
            >
              Pulse {pulseEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Toggle Button */}
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="btn text-xs"
            style={settingsOpen ? { 
              borderColor: themeColor.secondary,
              color: themeColor.primary
            } : {}}
          >
            ⚙ Settings
          </button>
        </div>
      </div>

      {/* Completion Flash Effect - Full Screen */}
      {isFlashing && (
        <div 
          className="fixed inset-0 z-50 animate-flash cursor-pointer"
          onClick={handleScreenClick}
        >
          <div className="absolute inset-0 bg-white animate-flash-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl font-display text-black animate-bounce">
              TIME&apos;S UP!
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
