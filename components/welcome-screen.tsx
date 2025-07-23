"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Volume2, Sparkles, AlertTriangle } from "lucide-react"

interface WelcomeScreenProps {
  onEnterCave: () => void
  onMusicOnly: () => void
  skipAnimation?: boolean
  hasWebGLSupport?: boolean
}

// Browser compatibility detection
function checkWebGLSupport(): boolean {
  try {
    if (typeof document === "undefined") return false
    const canvas = document.createElement("canvas")
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
    return !!gl
  } catch (e) {
    return false
  }
}

function checkBrowserCompatibility(): { isCompatible: boolean; issues: string[] } {
  const issues: string[] = []

  // Check WebGL support
  if (!checkWebGLSupport()) {
    issues.push("WebGL not supported")
  }

  // Check for modern browser features
  if (typeof window !== "undefined" && !window.AudioContext && !(window as any).webkitAudioContext) {
    issues.push("Web Audio API not supported")
  }

  // Check for ES6 support
  try {
    new Function("() => {}")
  } catch (e) {
    issues.push("Modern JavaScript not supported")
  }

  return {
    isCompatible: issues.length === 0,
    issues,
  }
}

export default function WelcomeScreen({
  onEnterCave,
  onMusicOnly,
  skipAnimation = false,
  hasWebGLSupport,
}: WelcomeScreenProps) {
  const [showInstructions, setShowInstructions] = useState(false)
  const [showStory, setShowStory] = useState(false)
  const [animationPhase, setAnimationPhase] = useState(skipAnimation ? 8 : 0)
  const [browserCompatibility, setBrowserCompatibility] = useState<{ isCompatible: boolean; issues: string[] } | null>(
    null,
  )
  const [showCompatibilityWarning, setShowCompatibilityWarning] = useState(false)

  useEffect(() => {
    if (skipAnimation) {
      setAnimationPhase(8)
      return
    }

    const timeouts: NodeJS.Timeout[] = []

    // Faster timing (reduced by 40%)
    // Phase 0: White page (1 second)
    timeouts.push(setTimeout(() => setAnimationPhase(1), 1000))

    // Phase 1: "Lo!" appears and holds (1 second)
    timeouts.push(setTimeout(() => setAnimationPhase(2), 2000))

    // Phase 2: 0.15 second gap (blank)
    timeouts.push(setTimeout(() => setAnimationPhase(3), 2150))

    // Phase 3: "Behold!" appears and holds (1.5 seconds)
    timeouts.push(setTimeout(() => setAnimationPhase(4), 3650))

    // Phase 4: "Ranga" appears (without ?) and holds (1 second)
    timeouts.push(setTimeout(() => setAnimationPhase(5), 4650))

    // Phase 5: "?" appears after "Ranga" (0.3 seconds)
    timeouts.push(setTimeout(() => setAnimationPhase(6), 4950))

    // Phase 6: "So here..." starts fading in (over 1.5 seconds)
    timeouts.push(setTimeout(() => setAnimationPhase(7), 6450))

    // Phase 7: Rest of page appears

    // Phase 8: Buttons appear 2 seconds after "So here..."
    timeouts.push(setTimeout(() => setAnimationPhase(8), 8450))

    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout))
    }
  }, [skipAnimation])

  useEffect(() => {
    // Check browser compatibility on mount
    const compatibility = checkBrowserCompatibility()
    setBrowserCompatibility(compatibility)

    // If not compatible, auto-redirect to music only after animation
    if (!compatibility.isCompatible && animationPhase >= 8) {
      setShowCompatibilityWarning(true)
    }
  }, [animationPhase])

  const handleEnterCave = () => {
    if (browserCompatibility && !browserCompatibility.isCompatible) {
      setShowCompatibilityWarning(true)
    } else {
      onEnterCave()
    }
  }

  const StoryModal = () =>
    showStory && (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <Card className="bg-white border-gray-300 max-w-2xl max-h-[80vh] overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-4xl font-bold text-black luminari">
                Yo<span className="text-orange-500">!</span>
              </h2>
              <Button
                onClick={() => setShowStory(false)}
                variant="ghost"
                size="sm"
                className="text-black hover:bg-gray-100"
              >
                ✕
              </Button>
            </div>
            <div className="overflow-y-auto max-h-[60vh] pr-2 text-sm leading-relaxed space-y-3 text-black font-times">
              <p>
                Thanks for being here in <span className="font-bold luminari text-orange-500">Ranga</span>'s cave.
              </p>
              <p>You might have one of these statues, but do you know the whole story?</p>

              <p>
                Long ago, in the cave inside the earth,{" "}
                <span className="font-bold luminari text-orange-500">Ranga</span> banged and banged and banged.
              </p>
              <p>He loved to drum, and drummed on everything around anyone.</p>
              <p>Before he entered the magical cave, he moved around the kingdom he called Argara,</p>
              <p>
                until <span className="font-bold luminari text-orange-500">Ranga</span> found Shuk, a mountain that rose
                high up towards the central floating core of
              </p>
              <p>the inside of the earth.</p>
              <p>Inside Shuk is this magical cave, the cave known for having the most interesting</p>
              <p>echo. The echoes would become alive and dance in the cave, they would take forms and find</p>
              <p>rocks to bang, the echoes create shadows who grow wings and sparks that create harps,</p>
              <p>gongs, fubarbettes and any instrument the banger can imagine.</p>
              <p>
                <span className="font-bold luminari text-orange-500">Ranga</span> loved this cave, and he spent many
                years alone here banging and banging and
              </p>
              <p>
                banging with his own echoes. As this went on Shuk, the mountain{" "}
                <span className="font-bold luminari text-orange-500">Ranga</span> lived inside,
              </p>
              <p>began to dance. Shuk is one of the biggest mountains of Argara, and the dancing caused so</p>
              <p>much fuss.</p>
              <p>All kinds of muck, dust and smoke covered stone city, and the dust was also laying</p>
              <p>thick on crystal city; so Argara decided to do something about it. Argara sent out an ask</p>
              <p>
                for help, they asked for someone to stop{" "}
                <span className="font-bold luminari text-orange-500">Ranga</span>.
              </p>
              <p>
                So came the witch and sage, <span className="font-bold luminari text-green-500">Nana</span> &{" "}
                <span className="font-bold luminari text-purple-500">Azar</span>. They travelled together, and entered
              </p>
              <p>
                <span className="font-bold luminari text-orange-500">Ranga</span>'s cave.{" "}
                <span className="font-bold luminari text-purple-500">Azar</span> went first, but as soon as he heard the
                music he couldn't help but to
              </p>
              <p>dance and play.</p>
              <p>He drummed as well and piped upon his flute, he grew into a cluster of red balloons</p>
              <p>
                on the roof and flew away each time he came close to{" "}
                <span className="font-bold luminari text-orange-500">Ranga</span>'s way.
              </p>
              <p>
                So <span className="font-bold luminari text-green-500">Nana</span> kept it simple, and in a poof of
                smoke, arrived behind <span className="font-bold luminari text-orange-500">Ranga</span> singing her
              </p>
              <p>
                own song. She clicked her fingers and in an instant,{" "}
                <span className="font-bold luminari text-orange-500">Ranga</span> was turned to stone.
              </p>
              <p>
                "Slippy slop this smock, he can for now live as a rock"{" "}
                <span className="font-bold luminari text-green-500">Nana</span> cackled. to which{" "}
                <span className="font-bold luminari text-purple-500">Azar</span>
              </p>
              <p>added a twist to the spell.</p>
              <p>
                "Well <span className="font-bold luminari text-green-500">Nana</span>, what a fine save. But let us
                remember this cave, for one day we shall
              </p>
              <p>need a beat so brave".</p>

              <div className="mt-4 space-y-1">
                <p>
                  <a
                    href="https://linktr.ee/olranga"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-400 hover:text-sky-300 underline"
                  >
                    linktr.ee/olranga
                  </a>
                </p>
                <p>
                  <a
                    href="https://ko-fi.com/olranga"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-500 hover:text-orange-600 underline"
                  >
                    ko-fi.com/olranga
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )

  const CompatibilityWarningModal = () =>
    showCompatibilityWarning && (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <Card className="bg-white border-gray-300 max-w-md">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
              <h2 className="text-xl font-bold text-black luminari">Browser Compatibility</h2>
            </div>
            <div className="space-y-4 text-black">
              <p className="text-sm">
                Your browser doesn't fully support the 3D experience. We'll take you to the music-only version instead.
              </p>
              <div className="bg-orange-50 border border-orange-200 rounded p-3">
                <p className="text-sm font-semibold mb-2">To see the full 3D Ranga experience, try:</p>
                <ul className="text-xs space-y-1">
                  <li>• Chrome (recommended)</li>
                  <li>• Firefox</li>
                  <li>• Safari</li>
                  <li>• Edge</li>
                </ul>
                <p className="text-xs mt-2 text-gray-600">
                  Make sure hardware acceleration is enabled in your browser settings.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setShowCompatibilityWarning(false)
                    onMusicOnly()
                  }}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Continue to Music
                </Button>
                <Button
                  onClick={() => setShowCompatibilityWarning(false)}
                  variant="outline"
                  className="border-gray-300 text-black hover:bg-gray-50"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )

  // Phase 0: White page
  if (animationPhase === 0) {
    return <div className="w-full min-h-screen bg-white"></div>
  }

  // Phase 2: Gap (blank white page)
  if (animationPhase === 2) {
    return <div className="w-full min-h-screen bg-white"></div>
  }

  return (
    <div className="w-full min-h-screen bg-white relative overflow-y-auto">
      {/* Main content container */}
      <div className="flex flex-col items-center pt-20 pb-8 px-4">
        {/* Title section - fixed height container to prevent movement */}
        <div className="h-80 flex flex-col items-center justify-center text-center mb-8">
          {/* Phase 1: Lo! with fade in - LUMINARI FONT */}
          {animationPhase === 1 && (
            <h1 className="text-6xl md:text-8xl font-bold text-black luminari">
              Lo<span className="text-orange-500">!</span>
            </h1>
          )}

          {/* Phase 3: Behold! with fade in - LUMINARI FONT */}
          {animationPhase === 3 && (
            <h1 className="text-6xl md:text-8xl font-bold text-black luminari">
              Behold<span className="text-orange-500">!</span>
            </h1>
          )}

          {/* Phase 4: Ranga (without ?) with fade in - LUMINARI FONT */}
          {animationPhase === 4 && <h1 className="text-7xl md:text-9xl font-bold text-black luminari">Ranga</h1>}

          {/* Phase 5+: Ranga with ? (appears after Ranga) with fade in - LUMINARI FONT */}
          {animationPhase >= 5 && animationPhase < 6 && (
            <div className="flex flex-col items-center">
              <h1 className="text-7xl md:text-9xl font-bold text-black luminari">
                Ranga<span className="text-orange-500 animate-in fade-in duration-500">?</span>
              </h1>
            </div>
          )}

          {/* Phase 6+: Full title with "So here..." with fade in - LUMINARI FONT */}
          {animationPhase >= 6 && (
            <div className="flex flex-col items-center">
              <h1 className="text-7xl md:text-9xl font-bold text-black luminari mb-4">
                Ranga<span className="text-orange-500">?</span>
              </h1>

              {/* Phase 7+: "So here..." fades in below - LUMINARI FONT */}
              {animationPhase >= 7 && (
                <div
                  className={`text-xl md:text-2xl text-black luminari leading-relaxed text-center ${
                    animationPhase === 7 ? "opacity-0 animate-in fade-in duration-[2200ms] fill-mode-forwards" : ""
                  }`}
                >
                  <p>
                    So here Ranga stays<span className="text-orange-500">,</span> a stone alone
                    <span className="text-orange-500">,</span> Argara saved
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rest of page content - appears below the title section */}
        {animationPhase >= 7 && (
          <div className="w-full max-w-4xl space-y-8">
            {/* Browser compatibility warning */}
            {(animationPhase >= 8 || skipAnimation) && browserCompatibility && !browserCompatibility.isCompatible && (
              <Card className="bg-orange-50 border-2 border-orange-300 max-w-2xl mx-auto">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <p className="text-orange-800 font-semibold">Limited Browser Support Detected</p>
                  </div>
                  <p className="text-sm text-orange-700 mb-3">
                    Your browser may not support the full 3D experience. We recommend trying the music-only version or
                    switching to Chrome/Firefox.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Experience Options - only show in phase 8+ */}
            {(animationPhase >= 8 || skipAnimation) && (
              <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <Card className="bg-gray-50 border-2 border-gray-200 hover:border-orange-300 transition-colors cursor-pointer">
                  <CardContent className="p-6 text-center space-y-4 flex flex-col h-full">
                    <Sparkles className="w-12 h-12 text-orange-500 mx-auto" />
                    <h3 className="text-2xl font-bold text-black luminari">Full Experience</h3>
                    <div className="flex-grow flex flex-col justify-center min-h-[4.5rem]">
                      <p className="text-black font-times">
                        <span className="text-orange-500">3</span>D statue<span className="text-orange-500">,</span>{" "}
                        reactive lights
                      </p>
                      {browserCompatibility && !browserCompatibility.isCompatible && (
                        <p className="text-xs text-orange-600 mt-1 font-times">⚠️ May not work in your browser</p>
                      )}
                    </div>
                    <Button
                      onClick={handleEnterCave}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold luminari"
                    >
                      Enter the Cave
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gray-50 border-2 border-gray-200 hover:border-orange-300 transition-colors cursor-pointer">
                  <CardContent className="p-6 text-center space-y-4 flex flex-col h-full">
                    <Volume2 className="w-12 h-12 text-orange-500 mx-auto" />
                    <h3 className="text-2xl font-bold text-black luminari">Music Only</h3>
                    <div className="flex-grow flex flex-col justify-center min-h-[4.5rem]">
                      <p className="text-black font-times">Just the tracks</p>
                      {browserCompatibility && browserCompatibility.isCompatible && (
                        <p className="text-xs text-green-600 mt-1 font-times">✓ Works in all browsers</p>
                      )}
                    </div>
                    <Button
                      onClick={onMusicOnly}
                      className="w-full bg-black hover:bg-gray-800 text-white font-bold luminari"
                    >
                      Listen Now
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Instructions and Story Buttons - only show in phase 8+ */}
            {(animationPhase >= 8 || skipAnimation) && (
              <div className="flex flex-col items-center gap-4">
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={() => setShowInstructions(!showInstructions)}
                    variant="outline"
                    className="border-2 border-orange-500 text-orange-500 hover:bg-orange-50 luminari"
                  >
                    {showInstructions ? "Hide Instructions" : "Show Instructions"}
                  </Button>

                  <Button
                    onClick={() => setShowStory(true)}
                    variant="outline"
                    className="border-2 border-orange-500 text-orange-500 hover:bg-orange-50 luminari"
                  >
                    ?
                  </Button>
                </div>
              </div>
            )}

            {showInstructions && (
              <Card className="bg-gray-50 border-2 border-gray-200 max-w-3xl mx-auto">
                <CardContent className="p-6 text-left space-y-4">
                  <h4 className="text-xl font-bold text-black luminari">
                    How to Use<span className="text-orange-500">:</span>
                  </h4>

                  <div className="space-y-3 text-black">
                    <p>
                      <span className="text-orange-500 font-bold">术</span> <span className="font-bold">(Shu)</span>
                      <span className="text-orange-500">:</span> Controls light intensity and statue glow
                    </p>
                    <p>
                      <span className="text-orange-500 font-bold">ф</span> <span className="font-bold">(Phi)</span>
                      <span className="text-orange-500">:</span> Adds noise and wave distortions
                    </p>
                    <p>
                      <span className="text-orange-500 font-bold">Θ</span> <span className="font-bold">(Theta)</span>
                      <span className="text-orange-500">:</span> Controls morphing effects
                    </p>
                    <p>
                      <span className="text-orange-500 font-bold">iΘ þн</span>
                      <span className="text-orange-500">:</span> Enable microphone for audio-reactive effects
                    </p>
                    <p>
                      <span className="text-orange-500 font-bold">ʂжu</span>
                      <span className="text-orange-500">:</span> Toggle starfield background
                    </p>
                    <p>
                      <span className="text-orange-500 font-bold">Click anywhere</span>
                      <span className="text-orange-500">:</span> Move lights to that position
                    </p>
                    <p>
                      <span className="text-orange-500 font-bold">Click track name</span>
                      <span className="text-orange-500">:</span> Download the current song
                    </p>
                  </div>

                  <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded">
                    <p className="text-sm text-black">
                      <span className="text-orange-500 font-bold">Browser Compatibility</span>
                      <span className="text-orange-500">:</span> This experience works best on desktop computers using
                      Chrome, Firefox, or Safari. If you experience issues, try refreshing the page, enabling hardware
                      acceleration in your browser settings, or switching to a different browser. The artist suggests
                      using a computer for the optimal experience.
                    </p>
                  </div>

                  <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded">
                    <p className="text-sm text-black">
                      <span className="text-orange-500 font-bold">Note</span>
                      <span className="text-orange-500">:</span> Music plays continuously and randomly
                      <span className="text-orange-500">.</span>
                      For best experience<span className="text-orange-500">,</span> use headphones and allow audio
                      permissions<span className="text-orange-500">.</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Footer */}
            <div className="text-sm text-gray-600 space-y-2 text-center luminari">
              <p>Created by Ol</p>
              <p>
                <a
                  href="https://linktr.ee/olranga"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:text-sky-300 underline"
                >
                  linktr<span className="text-black">.</span>ee<span className="text-black">/</span>olranga
                </a>
              </p>
            </div>
          </div>
        )}
      </div>

      <StoryModal />
      <CompatibilityWarningModal />
    </div>
  )
}
