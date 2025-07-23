"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Stars, OrbitControls } from "@react-three/drei"
import { useRef, useEffect, useState, useCallback } from "react"
import * as THREE from "three"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Volume2, Play, Pause, SkipForward } from "lucide-react"
import { useAudioPlayer } from "@/hooks/use-audio-player"

// Mobile detection hook
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        window.innerWidth < 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      )
    }

    if (typeof window !== "undefined") {
      checkMobile()
      window.addEventListener("resize", checkMobile)
      return () => window.removeEventListener("resize", checkMobile)
    }
  }, [])

  return isMobile
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
      if (typeof window !== "undefined") {
        rampDown()
      }
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
    if (typeof window !== "undefined") {
      window.addEventListener("pointermove", handlePointerEvent)
      window.addEventListener("pointerdown", handlePointerEvent)
      return () => {
        window.removeEventListener("pointermove", handlePointerEvent)
        window.removeEventListener("pointerdown", handlePointerEvent)
      }
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
    if (typeof document !== "undefined") {
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
      {scene && <primitive object={scene} />}
      <pointLight ref={rangaLightRef} color="#ffffff" intensity={1} distance={10} decay={1} position={[0, 50, 0]} />
      <pointLight position={[0, 100, 0]} color="#FFA500" intensity={0.5} distance={200} decay={1} />
    </group>
  )
}

interface CaveExperienceProps {
  onBack: () => void
}

export default function CaveExperience({ onBack }: CaveExperienceProps) {
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
  const [showControlsMenu, setShowControlsMenu] = useState(false)
  const [showVolume, setShowVolume] = useState(false)

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
    onBack()
  }

  const rangaLightEmission = (shuKnob / 4) * 2
  const baseIntensity = (shuKnob / 4) * 3.5 + 0.5
  const audioMultiplier = (shuKnob / 4) * 1.95 + 0.65
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
                  began to dance. <span className="font-bold luminari">Shuk</span> is one of
                </p>
                <p>
                  the <span className="font-bold luminari">biggest mountains</span> of{" "}
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
