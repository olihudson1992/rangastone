"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Play, Pause, SkipForward, Download, ArrowLeft, Volume2 } from "lucide-react"
import { useAudioPlayer } from "@/hooks/use-audio-player"

interface MusicOnlyModeProps {
  onBack: () => void
}

export default function MusicOnlyMode({ onBack }: MusicOnlyModeProps) {
  const [showStory, setShowStory] = useState(false)
  const { isPlaying, togglePlayPause, skipToNext, getCurrentTrackName, downloadCurrentTrack, volume, setVolume } =
    useAudioPlayer()
  const [backgroundColor, setBackgroundColor] = useState("#FF6B35")

  const colors = [
    "#FF6B35", // Orange
    "#FFD700", // Gold
    "#FF4500", // Red-Orange
    "#FF8C00", // Dark Orange
    "#FFA500", // Orange
    "#FFFF00", // Yellow
    "#FF6347", // Tomato
    "#FF7F50", // Coral
  ]

  useEffect(() => {
    const colorIndex = Math.floor(Math.random() * colors.length)
    setBackgroundColor(colors[colorIndex])
  }, [getCurrentTrackName()])

  return (
    <div
      className="w-full h-screen flex items-center justify-center transition-colors duration-1000"
      style={{ backgroundColor }}
    >
      <div className="max-w-2xl mx-auto text-center p-8 relative">
        <div className="space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white luminari">Bangas</h1>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm w-full">
            <CardContent className="p-6">
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white luminari">Now Playing:</h2>
                <button
                  onClick={downloadCurrentTrack}
                  className="text-lg text-white hover:text-white/80 transition-colors cursor-pointer underline decoration-white/50 hover:decoration-white/80 luminari"
                  title="Click to download"
                >
                  {getCurrentTrackName()}
                </button>
                <div className="flex items-center justify-center gap-2 text-sm text-white/70">
                  <Download className="w-4 h-4" />
                  <span className="luminari">Click track name to download</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm w-full">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={togglePlayPause}
                    size="lg"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30 luminari"
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    <span className="ml-2 text-white/90">{isPlaying ? "Pause" : "Play"}</span>
                  </Button>
                  <Button
                    onClick={skipToNext}
                    size="lg"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30 luminari"
                  >
                    <SkipForward className="w-6 h-6" />
                    <span className="ml-2 text-white/90">Next</span>
                  </Button>
                </div>

                {/* Volume Control */}
                <div className="flex items-center justify-center gap-3 mt-4">
                  <Volume2 className="w-5 h-5 text-white/70" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => setVolume(Number.parseFloat(e.target.value))}
                    className="w-32 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #ffffff ${volume * 100}%, rgba(255,255,255,0.2) ${
                        volume * 100
                      }%)`,
                    }}
                  />
                  <span className="text-white/70 text-sm luminari min-w-[3ch]">{Math.round(volume * 100)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center gap-4">
            <Button
              onClick={onBack}
              variant="outline"
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 luminari"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Button
              onClick={() => setShowStory(!showStory)}
              variant="outline"
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 luminari"
            >
              ?
            </Button>
          </div>

          {/* Story dropdown instead of modal */}
          {showStory && (
            <Card className="bg-white border-gray-300 max-h-[60vh] overflow-hidden">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-black luminari">Yo!</h2>
                </div>
                <div className="overflow-y-auto max-h-[50vh] pr-2 text-sm leading-relaxed space-y-3 text-black font-times">
                  <p>Thanks for being here in Ranga's cave.</p>
                  <p>You might have one of these statues, but do you know the whole story?</p>
                  <p>Long ago, in the cave inside the earth, Ranga banged and banged and banged.</p>
                  <p>He loved to drum, and drummed on everything around anyone.</p>
                  <p>Before he entered the magical cave, he moved around the kingdom he called Argara,</p>
                  <p>until Ranga found Shuk, a mountain that rose high up towards the central floating core of</p>
                  <p>the inside of the earth.</p>
                  <p>Inside Shuk is this magical cave, the cave known for having the most interesting</p>
                  <p>echo. The echoes would become alive and dance in the cave, they would take forms and find</p>
                  <p>rocks to bang, the echoes create shadows who grow wings and sparks that create harps,</p>{" "}
                  <p>gongs, fubarbettes and any instrument the banger can imagine.</p>
                  <p>Ranga loved this cave, and he spent many years alone here banging and banging and</p>
                  <p>banging with his own echoes. As this went on Shuk, the mountain Ranga lived inside,</p>
                  <p>began to dance. Shuk is one of the biggest mountains of Argara, and the dancing caused so</p>
                  <p>much fuss.</p>
                  <p>All kinds of muck, dust and smoke covered stone city, and the dust was also laying</p>
                  <p>thick on crystal city; so Argara decided to do something about it. Argara sent out an ask</p>
                  <p>for help, they asked for someone to stop Ranga.</p>
                  <p>So came the witch and sage, Nana & Azar. They travelled together, and entered</p>
                  <p>Ranga's cave. Azar went first, but as soon as he heard the music he couldn't help but to</p>
                  <p>dance and play.</p>
                  <p>He drummed as well and piped upon his flute, he grew into a cluster of red balloons</p>
                  <p>on the roof and flew away each time he came close to Ranga's way.</p>
                  <p>So Nana kept it simple, and in a poof of smoke, arrived behind Ranga singing her</p>
                  <p>own song. She clicked her fingers and in an instant, Ranga was turned to stone.</p>
                  <p>"Slippy slop this smock, he can for now live as a rock" Nana cackled. to which Azar</p>
                  <p>added a twist to the spell.</p>
                  <p>"Well Nana, what a fine save. But let us remember this cave, for one day we shall</p>
                  <p>need a beat so brave".</p>
                  <div className="mt-4 space-y-1">
                    <p>
                      <a
                        href="https://linktr.ee/olranga"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-500 hover:text-orange-600 underline"
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
          )}

          <div className="text-white/70 text-sm space-y-2 luminari">
            <p>24 hours of unrepeated, uninterrupted original music made by Ranga between 2011 and 2017</p>
            <p>
              <a
                href="https://linktr.ee/olranga"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/90 hover:text-white underline"
              >
                linktr.ee/olranga
              </a>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  )
}
