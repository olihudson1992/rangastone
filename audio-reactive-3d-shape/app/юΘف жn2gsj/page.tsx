"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Stars, OrbitControls } from "@react-three/drei"
import { useRef, useEffect, useState, useCallback } from "react"
import * as THREE from "three"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Volume2, Play, Pause, SkipForward } from "lucide-react"
import WelcomeScreen from "@/components/welcome-screen"
import MusicOnlyMode from "@/components/music-only-mode"

// Browser compatibility detection
function checkWebGLSupport(): boolean {
  try {
    const canvas = document.createElement("canvas")
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
    return !!gl
  } catch (e) {
    return false
  }
}

function checkBrowserCompatibility(): {
  isCompatible: boolean
  shouldFallback: boolean
} {
  // Check WebGL support
  const hasWebGL = checkWebGLSupport()

  // Check for modern browser features
  const hasAudioContext = !!(window.AudioContext || (window as any).webkitAudioContext)

  // Check for ES6 support
  let hasES6 = true
  try {
    new Function("() => {}")
  } catch (e) {
    hasES6 = false
  }

  const isCompatible = hasWebGL && hasAudioContext && hasES6
  const shouldFallback = !isCompatible

  return { isCompatible, shouldFallback }
}

// Mobile detection hook
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        window.innerWidth < 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      )
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return isMobile
}

// All your tracks from the CDN
const TRACK_LIST = [
  "-%20-%20.mp3",
  "0_ranga.mp3",
  "01%20Chibz%20%26%20Ranga%20-%20Box%20Of%20Love.mp3",
  "1.%20Beast%20-%20Da%20Ranga.mp3",
  "1n2%20ranga.mp3",
  "02%20-Chibz%20%26%20Ranga%20-%20You%27re%20Enough%20%28Ft%20Martin%20Smith%29.mp3",
  "03%20-%20Chibz%20%26%20Ranga%20-%20Children%20of%20the%20Ghetto.mp3",
  "04%20-%20Chibz%20%26%20Ranga%20-%20Tidal%20Wave.mp3",
  "05%20-%20Chibz%20%26%20Ranga%20-%20Love%20and%20Kindness.mp3",
  "06%20-%20Chibz%20%26%20Ranga%20-%20Whose%20World%20Is%20This.mp3",
  "07%20-%20Chibz%20%26%20Ranga%20-%20Gratitude.mp3",
  "08%20-%20Chibz%20%26%20Ranga%20-%20Lizard.mp3",
  "09%20-%20Chibz%20%26%20Ranga%20-%20Liquid%20Love.mp3",
  "10%20-%20Chibz%20%26%20Ranga%20-%20Love%20and%20Kindness%20%282018%20version%29.mp3",
  "22%28earlysaxmix%29_oli.mp3",
  "22_oli.mp3",
  "38M8.mp3",
  "91%20hop%28inst%2991_ranga%20live.mp3",
  "93%20coast_ranga.mp3",
  "106_ranga%26harambe%28inst%29.mp3",
  "106_ranga%26harambe.mp3",
  "108.9_ranga.mp3",
  "109%20ram_ranga.mp3",
  "111%20dub%20tek.mp3",
  "116%20bananq.mp3",
  "120%20ee.mp3",
  "120¶_ranga.mp3",
  "124%20shake_ranga_bangas.mp3",
  "125vocal.mp3",
  "130healing%20dub.mp3",
  "180%20gram_ranga_bangas.mp3",
  "190gram.mp3",
  "Adushs.mp3",
  "aku%20aku_ranga.mp3",
  "alice_oli.mp3",
  "Alien_Lea%20%26%20Ol'.mp3",
  "angel_oli%20.mp3",
  "Ark.mp3",
  "awh_demo_oli.mp3",
  "B7P8_ranga.mp3",
  "Bambooda_Ranga.mp3",
  "Bananas_ranga.mp3",
  "banderlirro%202.mp3",
  "Beat%201.mp3",
  "Beat%202.mp3",
  "Beat%207.mp3",
  "Beat%209.mp3",
  "beat1.mp3",
  "bermudea_ranga.mp3",
  "birdsong.mp3",
  "birdy%20dub_ranga%20dada%20shanti.mp3",
  "black%20voices%20%28edit%29_ranga.mp3",
  "blackenstine.mp3",
  "blackout.mp3",
  "BLACULA%20_.mp3",
  "blessing_ol.mp3",
  "can't%20do%20it%20wout%20you.mp3",
  "cape%20max.mp3",
  "Champ_Ol.mp3",
  "cheddar%20melt%20%28sex2%29_ranga.mp3",
  "chickery%20pot_ol'.mp3",
  "CHOICE.mp3",
  "conga%20fill%20.mp3",
  "conga_ranga.mp3",
  "deadlymood_ranga%202018.mp3",
  "Dinosaws_Ranga.mp3",
  "Dirty%20Looks.mp3",
  "djjelly_oli.mp3",
  "dogs%20tung_ranga_bangas.mp3",
  "Dreams%20On%20Contentment%20.mp3",
  "dreams%20on%20contentment_ranga.mp3",
  "dreamy%20trip_oli.mp3",
  "Drifty.mp3",
  "Dub%20tonight_Ranga.mp3",
  "earth_ft.jenome_ranga.mp3",
  "earth_ranga&jenome.mp3",
  "East%20End%20Mango.mp3",
  "Empty%20Hands%20Ft%20life's%20Good_Ranga.mp3",
  "Endless%20Good%20Weather_Ranga.mp3",
  "exploration.mp3",
  "faces.mp3",
  "fix_oli.mp3",
  "flat%2034%20pt2_ranga.mp3",
  "flipped%20egg_ranga.mp3",
  "FOESIL%20ROAD%202_oli%20%20.mp3",
  "FOESIL%20ROAD%203_oli%20%20.mp3",
  "forest_ranga.mp3",
  "forest_rangaM.mp3",
  "four%20walls_ranga.mp3",
  "funky%20fingerprints_ranga.mp3",
  "ghost160RNB.mp3",
  "Ginger%20Beer_Ranga.mp3",
  "Glass%20Tiger.mp3",
  "god2_Ol'.mp3",
  "goes%20round%20latin%20edit%20ranga.mp3",
  "gotta%20_ol'.mp3",
  "Great%20Ape%20%28Made%20In%20The%20Church%20Of%20The%20Sitnking%20Bishop%29.mp3",
  "green%20painting.mp3",
  "guess_ol.mp3",
  "Hard.mp3",
  "HARRY%20SIMM%20N%20RANGA%202.mp3",
  "hiptamine_ranga.mp3",
  "hitatattat_ol'.mp3",
  "Holla%20Back_Ranga.mp3",
  "home_ranga.mp3",
  "hoppyfun_.mp3",
  "How%20to%20play%20chess_Ranga.mp3",
  "i%20feel%20like%20u_ranga.mp3",
  "i%20see%20a%20way_ol'.mp3",
  "In%20Da%20City%20%28ft%20David%20Butler%29.mp3",
  "Interlude%202.mp3",
  "intro.mp3",
  "ip%20op_ranga.mp3",
  "ishvara_oli.mp3",
  "Jungle%20Law.mp3",
  "Kaa%20Moof_Ranga_Klangas%20.mp3",
  "Kilt_Ranga.mp3",
  "kreap_ranga.mp3",
  "LA%20SAGE.mp3",
  "last%20beat.mp3",
  "last%20nite%20beat%201.mp3",
  "last%20nite%20beat%202.mp3",
  "lgno_ranga.mp3",
  "lifes%20gone%20down%20low_ranga_edit.mp3",
  "Magic%20Woman.mp3",
  "married_ol'.mp3",
  "matias_ranga.mp3",
  "memorx_ranga%20%5Bunmastered%5D%20%281%29.mp3",
  "memorx_ranga%20%5Bunmastered%5D.mp3",
  "Mexico%2086'.mp3",
  "mezma_ol.mp3",
  "Monkey%20Feelinds%20UNMIXED.mp3",
  "moozy_oli.mp3",
  "night_oli.mp3",
  "nuclear%20war_ranga_bangas.mp3",
  "ol_ol.mp3",
  "ooo_Ol'%20%28beat%29.mp3",
  "orange%20jam%202.mp3",
  "other%20side%20of%20blue%20painting_ranga.mp3",
  "P8D_Ranga.mp3",
  "pancakes.mp3",
  "pank2_ranga%20%281%29.mp3",
  "pank2_ranga.mp3",
  "parrot_ol'.mp3",
  "peef%28draft%29_ranga.mp3",
  "percussion_ranga_bangas1.mp3",
  "Phoo.mp3",
  "Pryamid%203000%20%28Instrumental%20MPC%20version%29.mp3",
  "pure%20gold_chibz&ranga.mp3",
  "raise%20it_ol'.mp3",
  "Ranga%20-%20A%20Waltz%20On%20Venus%20%28M%29.mp3",
  "Ranga%20-%20Anger%20%26%20Happiness%20%20Dampening.mp3",
  "Ranga%20-%20Anger%20%26%20Happiness%20%20In%20My%20Face.mp3",
  "Ranga%20-%20Beats%20-%20Beat%203.mp3",
  "Ranga%20-%20Beats%20-%20Beat%204.mp3",
  "Ranga%20-%20Beats%20-%20Beat%205%266.mp3",
  "Ranga%20-%20Beats%20-%20Foundation%20ft%20Dada%20Shanti.mp3",
  "Ranga%20-%20Beats%20-%20Glass%20Tiger.mp3",
  "Ranga%20-%20Boss%20Man%20%28M%29.mp3",
  "Ranga%20-%20Capoweara%20%26%20Sleep%20-%20Capowera%202.mp3",
  "Ranga%20-%20Capoweara%20%26%20Sleep%20-%20Capowera.mp3",
  "Ranga%20-%20Capoweara%20%26%20Sleep%20-%20Sleep%203.mp3",
  "Ranga%20-%20Capoweara%20%26%20Sleep%20-%20Sleep.mp3",
  "Ranga%20-%20Dommm%20%28M%29.mp3",
  "Ranga%20-%20East%20End%20Mango%20%28M%29.mp3",
  "Ranga%20-%20Forget%20About%20It%20%28M%29.mp3",
  "RANGA%20-%20KIDS%20-%20BANGA%201.mp3",
  "Ranga%20-%20Nutz%20%28M%29.mp3",
  "Ranga%20-%20Pryamid%203000%20%28M%29.mp3",
  "Ranga%20-%20Reality%20Is%20%28M%29.mp3",
  "RANGA%20-%20TRANCE%20-%20BANGA%201.mp3",
  "Ranga%20-%20Zombies%20%28M%29.mp3",
  "Ranga%20Pizza%20-%20Pizza%20Slice%202.mp3",
  "Ranga%20Pizza%20-%20Pizza%20Slice%203.mp3",
  "Ranga.mp3",
  "Record%20Jam_Ranga.mp3",
  "records_ranga.mp3",
  "romance.mp3",
  "Rum_Ranga.mp3",
  "Runaway_Ranga.mp3",
  "Runaway2_Ranga.mp3",
  "Sassy_Ranga.mp3",
  "sensation.mp3",
  "settle_oli.mp3",
  "sex_ranga%20%5Bpremaster%5D.mp3",
  "sex_ranga.mp3",
  "shamanic%20hip%20hop.mp3",
  "shanty%20hop%28inst%2985_ranga%20live%20.mp3",
  "shi_ol'%20%281%29.mp3",
  "shi_ol'.mp3",
  "Shorts_.mp3",
  "Silver%20Bells%20%26%20Cockle%20Shells.mp3",
  "simplz.mp3",
  "Sky.mp3",
  "skye_ranga_bangas.mp3",
  "Small%20People.mp3",
  "soft%20and%20nice%202017%20ranga%20YOYOYO.mp3",
  "solar%20peeps_ol'.mp3",
  "Space%20Hopper_Ranga.mp3",
  "Star%20Kaff_Ranga.mp3",
  "Stomper.mp3",
  "Street_Ranga.mp3",
  "sun%20ra%20india%20cover_oli.mp3",
  "Swing.mp3",
  "take%20it%20sleazy.mp3",
  "tavener's%20caddy.mp3",
  "TCRL17_oli.mp3",
  "terry%20oldfeild_ranga.mp3",
  "The%20Mask_Ol.mp3",
  "the%20roof%20we%20live%20under.mp3",
  "the%20sweat%20%28remix%29.mp3",
  "the%20worst%20yet_ranga%20%5Bunmastered%5D%20.mp3",
  "the%20worst%20yet_ranga.mp3",
  "thmp_ranga.mp3",
  "tinky%20forest_ranga.mp3",
  "tompo%20house.mp3",
  "Tom's%20Funk%20-%20Ranga%202016%20.mp3",
  "turing_ol'%20%281%29.mp3",
  "turing_ol'.mp3",
  "u%20aint%20no%20jazz%20bruv_ranga%28mstr1%29.mp3",
  "U%20Broke%20My%20Yo_Ranga.mp3",
  "uaintnojazzbruv2018.mp3",
  "Untitled1_Ranga.mp3",
  "Untitled2_Ranga.mp3",
  "uplifting%20shit.mp3",
  "Wake%202.mp3",
  "what%20am%20i%20doing%20with%20my%20time%20PART%201.mp3",
  "what%20am%20i%20doing%20with%20my%20time%20PART%202.mp3",
  "what%20am%20i%20doing%20with%20my%20time%20PART%203.mp3",
  "whenever%20you%20feel%20alone.mp3",
  "White%20Peony_Ranga.mp3",
  "Whomper.mp3",
  "wiff%20waff%20master%202.mp3",
  "wittington%20you%20dick.mp3",
  "wittington%20you%20dick2.mp3",
  "Workout%201_Ranga.mp3",
  "Wyrt.mp3",
  "Yalways%20take%20my%20blues%20away%20_Ranga.mp3",
  "yam%20yam.mp3",
  "Zinabu_Ranga.mp3",
]

// Fixed audio player hook - buttons should work immediately
function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([])
  const [volume, setVolume] = useState(0.7)
  const isPlayingRef = useRef(false)

  useEffect(() => {
    isPlayingRef.current = isPlaying
  }, [isPlaying])

  useEffect(() => {
    const indices = Array.from({ length: TRACK_LIST.length }, (_, i) => i)
    setShuffledIndices([...indices].sort(() => Math.random() - 0.5))
  }, [])

  const loadTrack = useCallback(
    (trackIndex: number, shouldPlay: boolean) => {
      if (!audioRef.current || shuffledIndices.length === 0) return
      const actualIndex = shuffledIndices[trackIndex]
      const url = `https://rangatracks.b-cdn.net/${TRACK_LIST[actualIndex]}`
      audioRef.current.src = url
      audioRef.current.load()

      if (shouldPlay) {
        audioRef.current.play().catch((e) => {
          console.error("Error playing new track:", e)
          setIsPlaying(false)
        })
      }
    },
    [shuffledIndices],
  )

  useEffect(() => {
    const audio = new Audio()
    audio.crossOrigin = "anonymous"
    audio.volume = volume
    audioRef.current = audio

    const onEnded = () => {
      const nextIndex = (currentTrackIndex + 1) % shuffledIndices.length
      setCurrentTrackIndex(nextIndex)
      loadTrack(nextIndex, isPlayingRef.current)
    }

    audio.addEventListener("ended", onEnded)

    if (shuffledIndices.length > 0) {
      loadTrack(0, false)
    }

    return () => {
      audio.removeEventListener("ended", onEnded)
      audio.pause()
      audio.src = ""
      audioRef.current = null
    }
  }, [shuffledIndices, loadTrack, volume])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  const togglePlayPause = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true)
        })
        .catch((e) => {
          console.error("Error in togglePlayPause:", e)
          setIsPlaying(false)
        })
    }
  }

  const skipToNext = () => {
    const nextIndex = (currentTrackIndex + 1) % shuffledIndices.length
    setCurrentTrackIndex(nextIndex)
    loadTrack(nextIndex, isPlaying)
  }

  const getCurrentTrackName = () => {
    if (shuffledIndices.length === 0) return "Loading..."
    const actualIndex = shuffledIndices[currentTrackIndex]
    return (
      TRACK_LIST[actualIndex]
        ?.replace(/%20/g, " ")
        .replace(/%27/g, "'")
        .replace(/%28/g, "(")
        .replace(/%29/g, ")")
        .replace(/%26/g, "&")
        .replace(/\.mp3$/, "") || "Unknown Track"
    )
  }

  const downloadCurrentTrack = () => {
    if (shuffledIndices.length === 0) return
    const actualIndex = shuffledIndices[currentTrackIndex]
    const trackName = TRACK_LIST[actualIndex]
    const url = `https://rangatracks.b-cdn.net/${trackName}`

    const link = document.createElement("a")
    link.href = url
    link.download = getCurrentTrackName()
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return {
    isPlaying,
    togglePlayPause,
    skipToNext,
    getCurrentTrackName,
    downloadCurrentTrack,
    audioElement: audioRef.current,
    volume,
    setVolume,
  }
}

// Audio analysis hook - with smoothing
function useAudioAnalysis(audioElement: HTMLAudioElement | null) {
  const [isListening, setIsListening] = useState(true)
  const [audioData, setAudioData] = useState({ volume: 0, bassLevel: 0, midLevel: 0, trebleLevel: 0 })
  const smoothedDataRef = useRef({ volume: 0, bassLevel: 0, midLevel: 0, trebleLevel: 0 })
  const isMobile = useIsMobile()
  const [isLowPerformanceMode, setIsLowPerformanceMode] = useState(isMobile)

  const startListening = async () => {
    setIsListening(true)
  }

  const stopListening = () => {
    setIsListening(false)
  }

  useEffect(() => {
    if (!isListening) {
      // When not listening, smoothly ramp down to 0
      const rampDown = () => {
        smoothedDataRef.current.volume = THREE.MathUtils.lerp(smoothedDataRef.current.volume, 0, 0.1)
        smoothedDataRef.current.bassLevel = THREE.MathUtils.lerp(smoothedDataRef.current.bassLevel, 0, 0.1)
        smoothedDataRef.current.midLevel = THREE.MathUtils.lerp(smoothedDataRef.current.midLevel, 0, 0.1)
        smoothedDataRef.current.trebleLevel = THREE.MathUtils.lerp(smoothedDataRef.current.trebleLevel, 0, 0.1)
        setAudioData({ ...smoothedDataRef.current })
        if (smoothedDataRef.current.volume > 0.001) {
          requestAnimationFrame(rampDown)
        }
      }
      rampDown()
      return
    }

    const interval = setInterval(() => {
      const fakeVolume = Math.random() * 0.5 + 0.2
      const rawData = {
        volume: fakeVolume,
        bassLevel: fakeVolume * 0.8,
        midLevel: fakeVolume * 0.6,
        trebleLevel: fakeVolume * 0.4,
      }

      // Apply smoothing (lerp)
      smoothedDataRef.current.volume = THREE.MathUtils.lerp(smoothedDataRef.current.volume, rawData.volume, 0.1)
      smoothedDataRef.current.bassLevel = THREE.MathUtils.lerp(
        smoothedDataRef.current.bassLevel,
        rawData.bassLevel,
        0.1,
      )
      smoothedDataRef.current.midLevel = THREE.MathUtils.lerp(smoothedDataRef.current.midLevel, rawData.midLevel, 0.1)
      smoothedDataRef.current.trebleLevel = THREE.MathUtils.lerp(
        smoothedDataRef.current.trebleLevel,
        rawData.trebleLevel,
        0.1,
      )

      setAudioData({ ...smoothedDataRef.current })
    }, 100)

    return () => clearInterval(interval)
  }, [isListening])

  return {
    audioData,
    isListening,
    startListening,
    stopListening,
    isLowPerformanceMode,
    setIsLowPerformanceMode,
  }
}

// Loading Progress Component
function LoadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev
        return prev + Math.random() * 3
      })
    }, 100)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
      <div className="text-white text-xl luminari bg-black/80 px-6 py-4 rounded-lg border border-gray-600">
        <div className="text-center mb-4">Loading Ranga...</div>
        <div className="w-64 bg-gray-700 rounded-full h-2 mb-2">
          <div
            className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="text-sm text-gray-300 text-center">{Math.round(progress)}%</div>
        <div className="text-xs text-gray-400 text-center mt-2">
          {progress < 30 && "Awakening from stone..."}
          {progress >= 30 && progress < 60 && "Loading ancient geometry..."}
          {progress >= 60 && progress < 90 && "Preparing the cave..."}
          {progress >= 90 && "Almost ready..."}
        </div>
      </div>
    </div>
  )
}

// Animated Gradient Background Component - optimized for mobile
function DynamicBackground({ showStars, isMobile }: { showStars: boolean; isMobile: boolean }) {
  const starsRef = useRef<any>(null)
  const meshRef = useRef<THREE.Mesh>(null)
  const { scene } = useThree()

  const zenColors = [
    [0.9, 0.8, 0.9],
    [0.8, 0.9, 0.95],
    [0.9, 95, 0.8],
    [0.95, 0.9, 0.8],
    [0.9, 0.85, 0.95],
    [0.85, 0.95, 0.9],
    [0.95, 0.9, 0.85],
    [0.8, 0.9, 0.85],
  ]

  const gradientMaterial = useRef(
    new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Vector3(...zenColors[0]) },
        color2: { value: new THREE.Vector3(...zenColors[1]) },
        color3: { value: new THREE.Vector3(...zenColors[2]) },
        color4: { value: new THREE.Vector4() },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color1;
        uniform vec3 color2;
        uniform vec3 color3;
        varying vec2 vUv;

        void main() {
          vec2 uv = vUv;
          
          float wave1 = sin(uv.x * 3.0 + time * 0.5) * 0.5 + 0.5;
          float wave2 = cos(uv.y * 2.0 + time * 0.3) * 0.5 + 0.5;
          float wave3 = sin((uv.x + uv.y) * 2.5 + time * 0.4) * 0.5 + 0.5;
          
          vec3 color = mix(color1, color2, wave1);
          color = mix(color, color3, wave2);
          
          float movement = sin(time * 0.2 + uv.x * 4.0) * cos(time * 0.15 + uv.y * 3.0);
          color += movement * 0.05;
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.BackSide,
    }),
  )

  useFrame((state, delta) => {
    if (showStars) {
      gradientMaterial.current.uniforms.time.value = state.clock.elapsedTime

      const colorIndex = Math.floor(state.clock.elapsedTime * 0.1) % zenColors.length
      const nextColorIndex = (colorIndex + 1) % zenColors.length
      const lerpFactor = (state.clock.elapsedTime * 0.1) % 1

      const currentColor1 = zenColors[colorIndex]
      const nextColor1 = zenColors[nextColorIndex]
      const currentColor2 = zenColors[(colorIndex + 2) % zenColors.length]
      const nextColor2 = zenColors[(colorIndex + 3) % zenColors.length]

      gradientMaterial.current.uniforms.color1.value.lerpVectors(
        new THREE.Vector3(...currentColor1),
        new THREE.Vector3(...nextColor1),
        lerpFactor,
      )
      gradientMaterial.current.uniforms.color2.value.lerpVectors(
        new THREE.Vector3(...currentColor2),
        new THREE.Vector3(...nextColor2),
        lerpFactor,
      )

      if (!meshRef.current) {
        const segments = isMobile ? 16 : 32
        const geometry = new THREE.SphereGeometry(500, segments, segments)
        meshRef.current = new THREE.Mesh(geometry, gradientMaterial.current)
        scene.add(meshRef.current)
      }
      scene.background = null

      if (starsRef.current) {
        const time = state.clock.elapsedTime
        starsRef.current.rotation.x = Math.sin(time * 0.02) * 0.1
        starsRef.current.rotation.y = time * 0.005
        starsRef.current.rotation.z = Math.cos(time * 0.015) * 0.05

        const avgColor1 = gradientMaterial.current.uniforms.color1.value
        const avgColor2 = gradientMaterial.current.uniforms.color2.value
        const avgR = (avgColor1.x + avgColor2.x) / 2
        const avgG = (avgColor1.y + avgColor2.y) / 2
        const avgB = (avgColor1.z + avgColor2.z) / 2

        const invertedColor = new THREE.Color(1 - avgR, 1 - avgG, 1 - avgB)

        if (starsRef.current.material) {
          starsRef.current.material.color = invertedColor
        }
      }
    } else {
      if (meshRef.current) {
        scene.remove(meshRef.current)
        meshRef.current = null
      }
      scene.background = new THREE.Color("#000000")
    }
  })

  return (
    <>
      {showStars && (
        <group ref={starsRef}>
          <Stars radius={100} depth={50} count={isMobile ? 2000 : 8000} factor={6} saturation={1} fade speed={0.5} />
        </group>
      )}
    </>
  )
}

// Loading Camera Animation Component
function LoadingCameraAnimation({ onComplete }: { onComplete: () => void }) {
  const { camera } = useThree()
  const [isAnimating, setIsAnimating] = useState(true)
  const startTime = useRef<number | null>(null)
  const animationDuration = 3000

  useFrame((state) => {
    if (!isAnimating) return

    if (startTime.current === null) {
      startTime.current = state.clock.elapsedTime * 1000
    }

    const elapsed = state.clock.elapsedTime * 1000 - startTime.current
    const progress = Math.min(elapsed / animationDuration, 1)

    const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1)
    const easedProgress = easeInOutCubic(progress)

    const startY = 15
    const startZ = 0
    const startX = 0
    const endY = 1.0
    const endZ = -0.7 + 6.1
    const endX = 1.2

    camera.position.y = startY + (endY - startY) * easedProgress
    camera.position.z = startZ + (endZ - startZ) * easedProgress
    camera.position.x = startX + (endX - startX) * easedProgress

    camera.lookAt(-0.53, -0.08, -6.0)

    if (progress >= 1) {
      setIsAnimating(false)
      onComplete()
    }
  })

  return null
}

// Orbiting Light Component - with more varied colors
function OrbitingLight({
  index,
  baseIntensity,
  audioMultiplier,
  audioData,
  isListening,
  targetPosition,
  shuKnob,
  phiKnob,
  thetaKnob,
  isMobile,
  isLowPerformanceMode,
}: {
  index: number
  baseIntensity: number
  audioMultiplier: number
  audioData: any
  isListening: boolean
  targetPosition: THREE.Vector3
  shuKnob: number
  phiKnob: number
  thetaKnob: number
  isMobile: boolean
  isLowPerformanceMode: boolean
}) {
  const lightRef = useRef<THREE.PointLight>(null)
  const sphereRef = useRef<THREE.Mesh>(null)

  const getColorPalette = () => {
    const shuLevel = shuKnob / 4
    const phiLevel = phiKnob / 2
    const thetaLevel = thetaKnob / 5

    if (shuLevel > 0.7) {
      return ["#ff0080", "#00ff80", "#8000ff"]
    } else if (phiLevel > 0.7) {
      return ["#80ffff", "#ff8080", "#80ff80"]
    } else if (thetaLevel > 0.7) {
      return ["#ffff00", "#ff00ff", "#00ffff"]
    } else if (shuLevel > 0.3 || phiLevel > 0.3 || thetaLevel > 0.3) {
      return ["#ff8000", "#8000ff", "#00ff00"]
    } else {
      return ["#8000ff", "#00ff00", "#ff8000"]
    }
  }

  const colors = getColorPalette()
  const color = colors[index]

  useFrame((state) => {
    const time = state.clock.elapsedTime

    if (isLowPerformanceMode) {
      const simpleX = targetPosition.x + Math.cos(time * 0.2 + index) * 1.5
      const simpleZ = targetPosition.z + Math.sin(time * 0.2 + index) * 1.5
      const simpleY = targetPosition.y + 0.5

      if (lightRef.current) {
        // Smooth interpolation for slower following
        lightRef.current.position.x = THREE.MathUtils.lerp(lightRef.current.position.x, simpleX, 0.02)
        lightRef.current.position.y = THREE.MathUtils.lerp(lightRef.current.position.y, simpleY, 0.02)
        lightRef.current.position.z = THREE.MathUtils.lerp(lightRef.current.position.z, simpleZ, 0.02)
        lightRef.current.intensity = baseIntensity * 0.5
        lightRef.current.color.setHex(Number.parseInt(color.replace("#", "0x")))
      }
      if (sphereRef.current) {
        sphereRef.current.position.copy(lightRef.current.position)
      }
      return
    }

    const baseRadius = 1.2 + phiKnob * 0.3
    const radius = baseRadius + Math.sin(time * 0.5) * 0.1

    const angleOffset = (index * Math.PI * 2) / 3
    const angle = time * 0.3 + angleOffset

    const orbitX = targetPosition.x + Math.cos(angle) * radius
    const orbitZ = targetPosition.z + Math.sin(angle) * radius
    const orbitY = targetPosition.y + Math.sin(time * 0.4 + index * 1.5) * 0.5

    if (lightRef.current) {
      // Smooth interpolation for slower following
      lightRef.current.position.x = THREE.MathUtils.lerp(lightRef.current.position.x, orbitX, 0.02)
      lightRef.current.position.y = THREE.MathUtils.lerp(lightRef.current.position.y, orbitY, 0.02)
      lightRef.current.position.z = THREE.MathUtils.lerp(lightRef.current.position.z, orbitZ, 0.02)
      const intensity = (baseIntensity + (isListening ? audioData.volume * audioMultiplier : 0)) * (isMobile ? 0.7 : 1)
      lightRef.current.intensity = intensity
      lightRef.current.color.setHex(Number.parseInt(color.replace("#", "0x")))
    }
    if (sphereRef.current) {
      sphereRef.current.position.copy(lightRef.current.position)
    }
  })

  return (
    <>
      <pointLight ref={lightRef} color={color} intensity={baseIntensity} distance={8} decay={2} />
      <mesh ref={sphereRef}>
        <sphereGeometry args={[0.15]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </>
  )
}

// Corrected Mouse/Click Handler Components
function PointerTracker({
  onPointerMove,
  onPointerClick,
  isActive,
  planeDepth,
}: {
  onPointerMove: (position: THREE.Vector3) => void
  onPointerClick: (position: THREE.Vector3) => void
  isActive: boolean
  planeDepth: number
}) {
  const { camera, size } = useThree()
  const plane = useRef(new THREE.Plane()).current
  const intersectionPoint = useRef(new THREE.Vector3()).current

  useEffect(() => {
    plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, planeDepth))
  }, [plane, planeDepth])

  const handlePointerEvent = useCallback(
    (event: PointerEvent) => {
      const target = event.target as HTMLElement
      if (target.closest('.ui-card, .ui-button, .ui-slider, [role="slider"]')) {
        return
      }

      const x = (event.clientX / size.width) * 2 - 1
      const y = -(event.clientY / size.height) * 2 + 1

      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera)

      if (raycaster.ray.intersectPlane(plane, intersectionPoint)) {
        if (event.type === "pointermove" && isActive) {
          onPointerMove(intersectionPoint.clone())
        } else if (event.type === "pointerdown") {
          onPointerClick(intersectionPoint.clone())
        }
      }
    },
    [camera, size, plane, isActive, onPointerMove, onPointerClick],
  )

  useEffect(() => {
    window.addEventListener("pointermove", handlePointerEvent)
    window.addEventListener("pointerdown", handlePointerEvent)
    return () => {
      window.removeEventListener("pointermove", handlePointerEvent)
      window.removeEventListener("pointerdown", handlePointerEvent)
    }
  }, [handlePointerEvent])

  return null
}

// Main Ranga Model Component - optimized for mobile with fallback material
function RangaStoneModel({
  audioData,
  morphingEffect,
  bulgeEffect,
  noiseDistortion,
  waveDistortion,
  rangaLightEmission,
  statueX,
  statueY,
  statueZ,
  lightPositions,
  shuKnob,
  onModelLoaded,
  isMobile,
  isLowPerformanceMode,
}: {
  audioData: any
  morphingEffect: number
  bulgeEffect: number
  noiseDistortion: number
  waveDistortion: number
  rangaLightEmission: number
  statueX: number
  statueY: number
  statueZ: number
  lightPositions: THREE.Vector3[]
  shuKnob: number
  onModelLoaded: () => void
  isMobile: boolean
  isLowPerformanceMode: boolean
}) {
  const statueRef = useRef<any>(null)
  const originalPositionsRef = useRef<Float32Array | null>(null)
  const rangaLightRef = useRef<THREE.PointLight>(null)
  const [modelLoaded, setModelLoaded] = useState(false)

  const [scene, setScene] = useState<THREE.Group | null>(null)

  const [texture, setTexture] = useState<THREE.Texture | null>(null)

  useEffect(() => {
    // Create a simple placeholder geometry instead of loading GLB
    const group = new THREE.Group()

    // Create a simple statue-like shape
    const geometry = new THREE.BoxGeometry(2, 4, 2)
    const material = new THREE.MeshStandardMaterial({
      color: 0x8b7355,
      roughness: 0.8,
      metalness: 0.1,
    })
    const mesh = new THREE.Mesh(geometry, material)

    // Add some detail with smaller boxes
    const detail1 = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material)
    detail1.position.set(0, 2, 0)

    const detail2 = new THREE.Mesh(new THREE.SphereGeometry(0.5), material)
    detail2.position.set(0, 2.5, 0)

    group.add(mesh)
    group.add(detail1)
    group.add(detail2)

    setScene(group)
    setModelLoaded(true)
    onModelLoaded()
  }, [onModelLoaded])

  useEffect(() => {
    // Create a simple procedural stone texture
    const canvas = document.createElement("canvas")
    canvas.width = 256
    canvas.height = 256
    const context = canvas.getContext("2d")
    if (context) {
      context.fillStyle = "#8B7355"
      context.fillRect(0, 0, 256, 256)
      for (let i = 0; i < 1000; i++) {
        const x = Math.random() * 256
        const y = Math.random() * 256
        const size = Math.random() * 3
        context.fillStyle = `rgba(${100 + Math.random() * 50}, ${80 + Math.random() * 40}, ${
          60 + Math.random() * 30
        }, 0.3)`
        context.fillRect(x, y, size, size)
      }
      const fallbackTexture = new THREE.CanvasTexture(canvas)
      fallbackTexture.wrapS = THREE.RepeatWrapping
      fallbackTexture.wrapT = THREE.RepeatWrapping
      fallbackTexture.repeat.set(2, 2)
      setTexture(fallbackTexture)
    }
  }, [])

  useEffect(() => {
    if (scene && !modelLoaded) {
      console.log("Model loaded successfully")

      scene.traverse((child) => {
        if (child.type === "Mesh") {
          statueRef.current = child
          const mesh = child as any

          if (texture) {
            mesh.material = new THREE.MeshStandardMaterial({
              map: texture,
              roughness: 0.8,
              metalness: 0.1,
            })
          } else {
            mesh.material = new THREE.MeshStandardMaterial({
              color: 0x8b7355,
              roughness: 0.8,
              metalness: 0.1,
            })
          }

          if (mesh.geometry?.attributes.position) {
            originalPositionsRef.current = new Float32Array(mesh.geometry.attributes.position.array)
          }
        }
      })

      setModelLoaded(true)
      onModelLoaded()
    }
  }, [scene, texture, modelLoaded, onModelLoaded])

  useFrame((state) => {
    if (!statueRef.current) return
    const time = state.clock.elapsedTime

    // Simple scaling and rotation effects
    const scale = 1 + Math.sin(time * 0.5) * 0.1 * (shuKnob / 4)
    statueRef.current.scale.setScalar(scale)

    if (rangaLightRef.current) {
      const glowIntensity = (1 + shuKnob * 2) * (isMobile ? 0.3 : 1)
      rangaLightRef.current.intensity = glowIntensity
      rangaLightRef.current.position.set(statueX, statueY + 1, statueZ)
    }
  })

  return (
    <group
      position={[statueX - 3.09 + 1 - 0.4, statueY - 2.77 + 3.42 - 4.38 + 2, statueZ - 0.83 + 1.32 - 1.47]}
      rotation={[0, (304 * Math.PI) / 180, 0]}
      scale={[0.014, 0.014, 0.014]}
    >
      <primitive object={scene} />
      <pointLight ref={rangaLightRef} color="#ffffff" intensity={1} distance={10} decay={1} position={[0, 50, 0]} />
      <pointLight position={[0, 100, 0]} color="#FFA500" intensity={0.5} distance={200} decay={1} />
    </group>
  )
}

export default function Page() {
  const isMobile = useIsMobile()
  const audioPlayer = useAudioPlayer()
  const { audioData, isListening, startListening, stopListening, isLowPerformanceMode } = useAudioAnalysis(
    audioPlayer.audioElement,
  )

  const [rangaPosition] = useState({ x: 0.0, y: 0.0, z: -6.0 })
  const [isLoadingComplete, setIsLoadingComplete] = useState(false)
  const [modelLoaded, setModelLoaded] = useState(false)
  const [mousePosition, setMousePosition] = useState(new THREE.Vector3(0.0, 0.0, -6.0))
  const [lockedPosition, setLockedPosition] = useState<THREE.Vector3 | null>(null)
  const [isPositionLocked, setIsPositionLocked] = useState(false)
  const [shuKnob, setShuKnob] = useState(0.0)
  const [phiKnob, setPhiKnob] = useState(0.0)
  const [thetaKnob, setThetaKnob] = useState(0.6)
  const [showStars, setShowStars] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [currentTrackName, setCurrentTrackName] = useState("")
  const [currentMode, setCurrentMode] = useState<"welcome" | "cave" | "music-only">("welcome")
  const [hasReturnedFromMode, setHasReturnedFromMode] = useState(false)
  const [browserCompatibility, setBrowserCompatibility] = useState<{
    isCompatible: boolean
    shouldFallback: boolean
  } | null>(null)
  const [showControlsMenu, setShowControlsMenu] = useState(false)
  const [showVolume, setShowVolume] = useState(false)

  // Check browser compatibility on mount
  useEffect(() => {
    const compatibility = checkBrowserCompatibility()
    setBrowserCompatibility(compatibility)

    // If browser is not compatible, auto-redirect to music-only mode
    if (compatibility.shouldFallback && currentMode === "welcome") {
      console.log("Browser not compatible with 3D experience, redirecting to music-only mode")
      // Don't auto-redirect immediately, let user see the warning first
    }
  }, [currentMode])

  const getThetaColor = (value: number) => {
    const normalizedValue = value / 5
    const red = Math.floor(normalizedValue * 128)
    const green = Math.floor(255 - normalizedValue * 255)
    const blue = Math.floor(normalizedValue * 255)
    return `rgb(${red}, ${green}, ${blue})`
  }

  useEffect(() => {
    if (audioPlayer.isPlaying || audioPlayer.audioElement?.src) {
      const trackName = audioPlayer.getCurrentTrackName()
      if (trackName !== "Loading...") {
        setCurrentTrackName(trackName)
      }
    }
  }, [audioPlayer.isPlaying, audioPlayer.audioElement?.src, audioPlayer.getCurrentTrackName])

  const handlePointerMove = useCallback((position: THREE.Vector3) => {
    setMousePosition(position)
  }, [])

  const handlePointerClick = useCallback((position: THREE.Vector3) => {
    setIsPositionLocked((prev) => {
      if (!prev) {
        setLockedPosition(position.clone())
      } else {
        setLockedPosition(null)
      }
      return !prev
    })
  }, [])

  const handleBackButtonClick = () => {
    if (audioPlayer.audioElement) {
      audioPlayer.audioElement.pause()
    }
    setCurrentMode("welcome")
    setHasReturnedFromMode(true)
  }

  if (currentMode === "welcome") {
    return (
      <WelcomeScreen
        onEnterCave={() => {
          // Check compatibility before entering cave
          if (browserCompatibility?.shouldFallback) {
            setCurrentMode("music-only")
          } else {
            setCurrentMode("cave")
          }
        }}
        onMusicOnly={() => setCurrentMode("music-only")}
        skipAnimation={hasReturnedFromMode}
        hasWebGLSupport={browserCompatibility?.isCompatible}
      />
    )
  }

  if (currentMode === "music-only") {
    return (
      <MusicOnlyMode
        onBack={() => {
          setHasReturnedFromMode(true)
          setCurrentMode("welcome")
        }}
      />
    )
  }

  const rangaLightEmission = (shuKnob / 4) * 2
  const baseIntensity = (shuKnob / 4) * 3.5 + 0.5
  const audioMultiplier = (shuKnob / 4) * 1.95 + 0.65
  const noiseDistortion = phiKnob * 2.5
  const waveDistortion = phiKnob * 2.5
  const morphingEffect = thetaKnob
  const targetPosition = isPositionLocked && lockedPosition ? lockedPosition : mousePosition

  return (
    <div className="w-full h-screen bg-black">
      <Button
        onClick={handleBackButtonClick}
        variant="outline"
        className="absolute top-4 left-4 z-10 bg-black/80 border-gray-600 text-white hover:bg-gray-800 luminari ui-button"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <Button
        onClick={() => setShowHelp(!showHelp)}
        variant="outline"
        className="absolute top-4 left-32 z-10 bg-orange-600/80 border-orange-500 text-white hover:bg-orange-700 luminari ui-button"
      >
        ?
      </Button>

      {/* Always-visible Audio Controls */}
      <div className="absolute top-4 right-16 z-20 flex items-center gap-2 mr-4">
        <Card className="bg-black/90 border-gray-600 ui-card">
          <CardContent className="p-2 flex items-center gap-2">
            <Button
              onClick={audioPlayer.togglePlayPause}
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white ui-button"
            >
              {audioPlayer.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              onClick={audioPlayer.skipToNext}
              size="sm"
              className="bg-gray-700 hover:bg-gray-600 text-white ui-button"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1">
              <Button
                onClick={() => setShowVolume(!showVolume)}
                size="sm"
                variant="ghost"
                className="p-1 h-auto hover:bg-gray-700"
              >
                <Volume2 className="w-4 h-4 text-white" />
              </Button>
              {showVolume && (
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={audioPlayer.volume}
                  onChange={(e) => audioPlayer.setVolume(Number.parseFloat(e.target.value))}
                  className="w-16 ui-slider"
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hamburger Menu Button */}
      <Button
        onClick={() => setShowControlsMenu(!showControlsMenu)}
        variant="outline"
        className="absolute top-4 right-4 z-20 bg-black/80 border-gray-600 text-white hover:bg-gray-800 ui-button"
      >
        <div className="flex flex-col gap-1">
          <div className="w-4 h-0.5 bg-white"></div>
          <div className="w-4 h-0.5 bg-white"></div>
          <div className="w-4 h-0.5 bg-white"></div>
        </div>
      </Button>

      {/* Collapsible Controls Menu */}
      {showControlsMenu && (
        <div className="absolute top-16 right-4 z-10 space-y-2">
          <Card className="bg-black/90 border-gray-600 ui-card">
            <CardContent className="p-4 space-y-3">
              <div className="text-white text-sm luminari">
                <div className="mb-2">
                  {currentTrackName && currentTrackName !== "Loading..." && (
                    <button
                      onClick={audioPlayer.downloadCurrentTrack}
                      className="text-orange-400 hover:text-orange-300 text-xs underline cursor-pointer block max-w-[200px] truncate"
                      title="Click to download"
                    >
                      {currentTrackName}
                    </button>
                  )}
                </div>
                <span
                  className={`text-sm luminari transition-colors duration-300 ${
                    isPositionLocked ? "text-yellow-400" : "text-white"
                  }`}
                >
                  sor
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/90 border-gray-600 ui-card">
            <CardContent className="p-4 space-y-4">
              <div className="space-y-3">
                <div>
                  <label
                    className="text-white text-sm luminari block mb-1"
                    style={{ color: shuKnob > 0.1 ? "#ff8000" : "#ffffff" }}
                  >
                    术
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="4"
                    step="0.1"
                    value={shuKnob}
                    onChange={(e) => setShuKnob(Number.parseFloat(e.target.value))}
                    className="w-full ui-slider"
                    style={{ accentColor: shuKnob > 0.1 ? "#ff8000" : "#666666" }}
                  />
                </div>

                <div>
                  <label
                    className="text-white text-sm luminari block mb-1"
                    style={{ color: phiKnob > 0.1 ? "#00ff00" : "#ffffff" }}
                  >
                    ф
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={phiKnob}
                    onChange={(e) => setPhiKnob(Number.parseFloat(e.target.value))}
                    className="w-full ui-slider"
                    style={{ accentColor: phiKnob > 0.1 ? "#00ff00" : "#666666" }}
                  />
                </div>

                <div>
                  <label className="text-white text-sm luminari block mb-1" style={{ color: getThetaColor(thetaKnob) }}>
                    Θ
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.1"
                    value={thetaKnob}
                    onChange={(e) => setThetaKnob(Number.parseFloat(e.target.value))}
                    className="w-full ui-slider"
                    style={{ accentColor: getThetaColor(thetaKnob) }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={isListening ? stopListening : startListening}
                  size="sm"
                  className={`${
                    isListening ? "bg-red-600 hover:bg-red-700" : "bg-gray-600 hover:bg-gray-700"
                  } text-white ui-button luminari`}
                >
                  iΘ þн {isListening ? "ON" : "OFF"}
                </Button>

                <Button
                  onClick={() => setShowStars(!showStars)}
                  size="sm"
                  className={`${
                    showStars ? "bg-purple-600 hover:bg-purple-700" : "bg-gray-600 hover:bg-gray-700"
                  } text-white ui-button luminari`}
                >
                  ʂжu
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Story dropdown instead of modal */}
      {showHelp && (
        <div className="absolute bottom-20 left-4 right-4 z-10 max-w-2xl mx-auto">
          <Card className="bg-white border-gray-300 max-h-[60vh] overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-4xl font-bold text-black luminari">
                  Yo<span className="text-orange-500">!</span>
                </h2>
              </div>
              <div className="overflow-y-auto max-h-[50vh] pr-2 text-sm leading-relaxed space-y-3 text-black font-times">
                <p>
                  Thanks for being here in <span className="font-bold luminari text-orange-500">Ranga</span>'s cave.
                </p>
                <p>You might have one of these statues, but do you know the whole story?</p>
                <p>
                  Long ago, in the cave inside the earth,{" "}
                  <span className="font-bold luminari text-orange-500">Ranga</span> banged and banged and banged.
                </p>
                <p>He loved to drum, and drummed on everything around anyone.</p>
                <p>
                  Before he entered the magical cave, he moved around the kingdom he called{" "}
                  <span className="font-bold luminari">Argara</span>,
                </p>
                <p>
                  until <span className="font-bold luminari text-orange-500">Ranga</span> found{" "}
                  <span className="font-bold luminari">Shuk</span>, a mountain that rose high up towards the central
                  floating core of
                </p>
                <p>the inside of the earth.</p>
                <p>
                  Inside <span className="font-bold luminari">Shuk</span> is this magical cave, the cave known for
                  having the <span className="font-bold luminari">most interesting</span>
                </p>
                <p>echo. The echoes would become alive and dance in the cave, they would take forms and find</p>
                <p>rocks to bang, the echoes create shadows who grow wings and sparks that create harps,</p>
                <p>gongs, fubarbettes and any instrument the banger can imagine.</p>
                <p>
                  <span className="font-bold luminari text-orange-500">Ranga</span> loved this cave, and he spent many
                  years alone here banging and banging and
                </p>
                <p>
                  banging with his own echoes. As this went on <span className="font-bold luminari">Shuk</span>, the
                  mountain <span className="font-bold luminari text-orange-500">Ranga</span> lived inside,
                </p>
                <p>
                  began to dance. <span className="font-bold luminari">Shuk</span> is one of the{" "}
                  <span className="font-bold luminari">biggest mountains</span> of{" "}
                  <span className="font-bold luminari">Argara</span>, and the dancing caused so
                </p>
                <p>
                  <span className="font-bold luminari">much fuss</span>.
                </p>
                <p>
                  All kinds of muck, dust and smoke covered <span className="font-bold luminari">stone city</span>, and
                  the dust was also laying
                </p>
                <p>
                  thick on <span className="font-bold luminari">crystal city</span>; so{" "}
                  <span className="font-bold luminari">Argara</span> decided to do something about it.{" "}
                  <span className="font-bold luminari">Argara</span> sent out an ask
                </p>
                <p>
                  for help, they asked for someone to stop{" "}
                  <span className="font-bold luminari text-orange-500">Ranga</span>.
                </p>
                <p>
                  So came the <span className="font-bold luminari">witch and sage</span>,{" "}
                  <span className="font-bold luminari text-green-500">Nana</span> &{" "}
                  <span className="font-bold luminari text-purple-500">Azar</span>. They travelled together, and entered
                </p>
                <p>
                  <span className="font-bold luminari text-orange-500">Ranga</span>'s cave.{" "}
                  <span className="font-bold luminari text-purple-500">Azar</span> went first, but as soon as he heard
                  the music he couldn't help but to dance and play.
                </p>
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
                  "<span className="font-bold luminari">Slippy slop this smock, he can for now live as a rock</span>"{" "}
                  <span className="font-bold luminari text-green-500">Nana</span> cackled. to which{" "}
                  <span className="font-bold luminari text-purple-500">Azar</span>
                </p>
                <p>added a twist to the spell.</p>
                <p>
                  "
                  <span className="font-bold luminari">
                    Well <span className="text-green-500">Nana</span>, what a fine save. But let us remember this cave,
                  </span>
                </p>
                <p>
                  <span className="font-bold luminari">for one day we shall</span>
                </p>
                <p>
                  <span className="font-bold luminari">need a beat so brave</span>".
                </p>
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
        </div>
      )}

      {!isLoadingComplete && <LoadingProgress />}

      <Canvas
        camera={{ position: [1.2, 15, -0.7 + 6.1], fov: 50 }}
        gl={{ antialias: !isMobile, powerPreference: "high-performance" }}
        className="w-full h-full"
      >
        <ambientLight intensity={0.2} />
        <LoadingCameraAnimation onComplete={() => setIsLoadingComplete(true)} />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxDistance={20}
          minDistance={2}
          target={[-0.53, -0.08, -6.0]}
        />

        {isLoadingComplete && (
          <>
            <RangaStoneModel
              audioData={audioData}
              morphingEffect={thetaKnob}
              bulgeEffect={thetaKnob}
              noiseDistortion={phiKnob}
              waveDistortion={phiKnob}
              rangaLightEmission={rangaLightEmission}
              statueX={rangaPosition.x}
              statueY={rangaPosition.y}
              statueZ={rangaPosition.z}
              lightPositions={[targetPosition]}
              shuKnob={shuKnob}
              onModelLoaded={() => setModelLoaded(true)}
              isMobile={isMobile}
              isLowPerformanceMode={isLowPerformanceMode}
            />
            <OrbitingLight
              index={0}
              baseIntensity={baseIntensity}
              audioMultiplier={audioMultiplier}
              audioData={audioData}
              isListening={isListening}
              targetPosition={targetPosition}
              shuKnob={shuKnob}
              phiKnob={phiKnob}
              thetaKnob={thetaKnob}
              isMobile={isMobile}
              isLowPerformanceMode={isLowPerformanceMode}
            />
            <OrbitingLight
              index={1}
              baseIntensity={baseIntensity}
              audioMultiplier={audioMultiplier}
              audioData={audioData}
              isListening={isListening}
              targetPosition={targetPosition}
              shuKnob={shuKnob}
              phiKnob={phiKnob}
              thetaKnob={thetaKnob}
              isMobile={isMobile}
              isLowPerformanceMode={isLowPerformanceMode}
            />
            <OrbitingLight
              index={2}
              baseIntensity={baseIntensity}
              audioMultiplier={audioMultiplier}
              audioData={audioData}
              isListening={isListening}
              targetPosition={targetPosition}
              shuKnob={shuKnob}
              phiKnob={phiKnob}
              thetaKnob={thetaKnob}
              isMobile={isMobile}
              isLowPerformanceMode={isLowPerformanceMode}
            />
            <PointerTracker
              onPointerMove={handlePointerMove}
              onPointerClick={handlePointerClick}
              isActive={!isPositionLocked}
              planeDepth={rangaPosition.z}
            />
            <DynamicBackground showStars={showStars} isMobile={isMobile} />
          </>
        )}
      </Canvas>
    </div>
  )
}
