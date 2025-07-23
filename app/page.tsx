"use client"

import { useState, useEffect } from "react"
import WelcomeScreen from "@/components/welcome-screen"
import MusicOnlyMode from "@/components/music-only-mode"

// Simple dynamic import with better error handling
const CaveExperience = (() => {
  let CaveComponent: any = null

  if (typeof window !== "undefined") {
    try {
      const dynamic = require("next/dynamic")
      CaveComponent = dynamic(() => import("@/components/cave-experience"), {
        ssr: false,
        loading: () => (
          <div className="w-full h-screen bg-black text-white flex items-center justify-center luminari text-2xl">
            Loading Cave...
          </div>
        ),
      })
    } catch (error) {
      console.warn("Failed to load 3D experience:", error)
    }
  }

  return CaveComponent
})()

export default function Page() {
  const [currentMode, setCurrentMode] = useState<"welcome" | "cave" | "music-only">("welcome")
  const [hasReturnedFromMode, setHasReturnedFromMode] = useState(false)
  const [canLoad3D, setCanLoad3D] = useState(false)

  useEffect(() => {
    // Simple check for 3D capability
    if (typeof window !== "undefined") {
      try {
        const canvas = document.createElement("canvas")
        const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
        setCanLoad3D(!!gl)
      } catch {
        setCanLoad3D(false)
      }
    }
  }, [])

  const handleEnterCave = () => {
    if (!canLoad3D || !CaveExperience) {
      setCurrentMode("music-only")
    } else {
      setCurrentMode("cave")
    }
  }

  const handleEnterMusicOnly = () => {
    setCurrentMode("music-only")
  }

  const handleBackToWelcome = () => {
    setCurrentMode("welcome")
    setHasReturnedFromMode(true)
  }

  if (currentMode === "welcome") {
    return (
      <WelcomeScreen
        onEnterCave={handleEnterCave}
        onMusicOnly={handleEnterMusicOnly}
        skipAnimation={hasReturnedFromMode}
        hasWebGLSupport={canLoad3D}
      />
    )
  }

  if (currentMode === "music-only") {
    return <MusicOnlyMode onBack={handleBackToWelcome} />
  }

  if (currentMode === "cave" && CaveExperience) {
    return <CaveExperience onBack={handleBackToWelcome} />
  }

  // Fallback if 3D fails
  return <MusicOnlyMode onBack={handleBackToWelcome} />
}
