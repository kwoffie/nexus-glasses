import { useEffect, useRef, useState } from 'react'
import ErrorBoundary from './ErrorBoundary'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const ACCENT = '#f59e0b'
const ACCENT_COLOR = new THREE.Color(ACCENT)

interface State {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
  controls: OrbitControls
  animId: number
  glasses: THREE.Group
  leftLens: THREE.Mesh
  rightLens: THREE.Mesh
  hudText: THREE.Sprite
  particles: THREE.Points
  time: number
  hudCanvas: HTMLCanvasElement
  hudTexture: THREE.CanvasTexture
}

// Loading spinner component
function LoadingSpinner() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm"
      role="status"
      aria-label="Loading NEXUS Spectacle 3D simulator"
    >
      <div className="relative">
        {/* Outer ring */}
        <div className="w-12 h-12 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
        {/* Inner pulse */}
        <div className="absolute inset-2 w-8 h-8 border-2 border-amber-400/20 border-b-amber-400 rounded-full animate-spin animate-reverse"></div>
        {/* Center dot */}
        <div className="absolute inset-4 w-4 h-4 bg-amber-500/40 rounded-full animate-pulse"></div>
      </div>
    </div>
  )
}

function createGlassesModel(scene: THREE.Scene): THREE.Group {
  const group = new THREE.Group()
  const frameMat = new THREE.MeshPhysicalMaterial({
    color: 0x1e293b,
    metalness: 0.85,
    roughness: 0.15,
    envMapIntensity: 1.2,
    clearcoat: 0.3,
  })
  const lensMat = new THREE.MeshPhysicalMaterial({
    color: 0x0f172a,
    metalness: 0.1,
    roughness: 0.05,
    transparent: true,
    opacity: 0.55,
    envMapIntensity: 0.8,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    side: THREE.DoubleSide,
  })
  const accentMat = new THREE.MeshPhysicalMaterial({
    color: ACCENT_COLOR,
    metalness: 0.7,
    roughness: 0.2,
    emissive: ACCENT_COLOR,
    emissiveIntensity: 0.15,
  })
  const sensorMat = new THREE.MeshPhysicalMaterial({
    color: 0x10b981,
    emissive: 0x10b981,
    emissiveIntensity: 0.5,
    metalness: 0.3,
    roughness: 0.4,
  })

  // --- Left Lens ---
  const lensShape = new THREE.Shape()
  const w = 1.1, h = 0.75
  lensShape.moveTo(-w, 0)
  lensShape.quadraticCurveTo(-w, -h * 0.5, -w * 0.7, -h)
  lensShape.quadraticCurveTo(0, -h * 1.15, w * 0.7, -h)
  lensShape.quadraticCurveTo(w, -h * 0.5, w, 0)
  lensShape.quadraticCurveTo(w, h * 0.35, w * 0.7, h * 0.5)
  lensShape.quadraticCurveTo(0, h * 0.6, -w * 0.7, h * 0.5)
  lensShape.quadraticCurveTo(-w, h * 0.35, -w, 0)

  const extrudeSettings = { depth: 0.06, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 6 }
  const leftGeo = new THREE.ExtrudeGeometry(lensShape, extrudeSettings)
  const leftLens = new THREE.Mesh(leftGeo, lensMat)
  leftLens.position.set(-1.4, 0, 0)
  leftLens.rotation.x = -0.05
  leftLens.rotation.z = 0.02
  group.add(leftLens)

  // --- Right Lens ---
  const rightGeo = new THREE.ExtrudeGeometry(lensShape, extrudeSettings)
  const rightLens = new THREE.Mesh(rightGeo, lensMat)
  rightLens.position.set(1.4, 0, 0)
  rightLens.rotation.x = -0.05
  rightLens.rotation.z = -0.02
  group.add(rightLens)

  // --- Frame Rim Left ---
  const rimShape = new THREE.Shape()
  rimShape.moveTo(-w - 0.05, 0)
  rimShape.quadraticCurveTo(-w - 0.05, -h * 0.55, -w * 0.7 - 0.05, -h - 0.03)
  rimShape.quadraticCurveTo(0, -h * 1.2, w * 0.7 + 0.05, -h - 0.03)
  rimShape.quadraticCurveTo(w + 0.05, -h * 0.55, w + 0.05, 0)
  rimShape.quadraticCurveTo(w + 0.05, h * 0.38, w * 0.7 + 0.05, h * 0.55)
  rimShape.quadraticCurveTo(0, h * 0.65, -w * 0.7 - 0.05, h * 0.55)
  rimShape.quadraticCurveTo(-w - 0.05, h * 0.38, -w - 0.05, 0)

  const rimExtrude = { depth: 0.1, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 4 }
  const rimLeftGeo = new THREE.ExtrudeGeometry(rimShape, rimExtrude)
  const rimLeft = new THREE.Mesh(rimLeftGeo, frameMat)
  rimLeft.position.set(-1.4, 0, -0.03)
  rimLeft.rotation.x = -0.05
  rimLeft.rotation.z = 0.02
  group.add(rimLeft)

  const rimRight = rimLeft.clone()
  rimRight.position.set(1.4, 0, -0.03)
  rimRight.rotation.x = -0.05
  rimRight.rotation.z = -0.02
  group.add(rimRight)

  // --- Bridge ---
  const bridgeGeo = new THREE.TorusGeometry(0.25, 0.06, 8, 12, Math.PI)
  const bridge = new THREE.Mesh(bridgeGeo, frameMat)
  bridge.position.set(0, 0.15, 0.08)
  bridge.rotation.x = 0.1
  bridge.rotation.z = 0
  group.add(bridge)

  // --- Left Arm ---
  const armShape2 = new THREE.Shape()
  armShape2.moveTo(0, 0.06)
  armShape2.lineTo(4.8, 0.06)
  armShape2.lineTo(4.8, -0.04)
  armShape2.lineTo(0, -0.04)
  armShape2.closePath()
  const armExtrude2 = { depth: 0.06, bevelEnabled: false }
  const armGeo2 = new THREE.ExtrudeGeometry(armShape2, armExtrude2)
  const armMat = new THREE.MeshPhysicalMaterial({
    color: 0x334155,
    metalness: 0.8,
    roughness: 0.2,
  })
  const leftArm = new THREE.Mesh(armGeo2, armMat)
  leftArm.position.set(-1.8, -0.1, 0)
  leftArm.rotation.y = -0.35
  leftArm.rotation.x = 0.15
  leftArm.rotation.z = 0.08
  group.add(leftArm)

  // --- Right Arm ---
  const rightArm = leftArm.clone()
  rightArm.position.set(1.8, -0.1, 0)
  rightArm.rotation.y = 0.35
  rightArm.rotation.x = 0.15
  rightArm.rotation.z = -0.08
  group.add(rightArm)

  // --- Temple tips ---
  const tipGeo = new THREE.SphereGeometry(0.08, 8, 8)
  const tipMat = new THREE.MeshPhysicalMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.3 })
  const leftTip = new THREE.Mesh(tipGeo, tipMat)
  leftTip.position.set(-4.5, -0.05, 0.02)
  leftTip.scale.set(1.2, 1, 0.8)
  group.add(leftTip)

  const rightTip = leftTip.clone()
  rightTip.position.set(4.5, -0.05, 0.02)
  group.add(rightTip)

  // --- Nose pads ---
  const padGeo = new THREE.SphereGeometry(0.06, 6, 6)
  const padMat = new THREE.MeshPhysicalMaterial({ color: 0x475569, metalness: 0.4, roughness: 0.5 })
  const leftPad = new THREE.Mesh(padGeo, padMat)
  leftPad.position.set(-0.3, -0.55, 0.25)
  leftPad.scale.set(1.2, 0.7, 0.6)
  group.add(leftPad)
  const rightPad = leftPad.clone()
  rightPad.position.set(0.3, -0.55, 0.25)
  group.add(rightPad)

  // --- HUD projector (accent strip on right lens edge) ---
  const hudStripGeo = new THREE.BoxGeometry(0.02, 0.5, 0.01)
  const hudStrip = new THREE.Mesh(hudStripGeo, accentMat)
  hudStrip.position.set(0.9, 0.05, 0.08)
  group.add(hudStrip)

  // --- Sensor dots on right arm ---
  for (let i = 0; i < 3; i++) {
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), sensorMat)
    dot.position.set(2.5 + i * 0.2, -0.05, 0.06)
    group.add(dot)
  }

  // --- HUD info display (right lens) ---
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 128
  const ctx = canvas.getContext('2d')!
  
  // Store for animation updates
  const hudData = { canvas, ctx, time: 0 }

  function updateHUD(time: number) {
    const ctx = hudData.ctx
    ctx.clearRect(0, 0, 256, 128)

    // HUD background with subtle pulse
    const pulse = 0.06 + Math.sin(time * 0.2) * 0.02
    ctx.fillStyle = `rgba(245, 158, 11, ${pulse})`
    ctx.roundRect(10, 10, 236, 108, 8)
    ctx.fill()

    ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)'
    ctx.lineWidth = 1
    ctx.roundRect(10, 10, 236, 108, 8)
    ctx.stroke()

    // Labels
    ctx.font = '14px monospace'
    ctx.fillStyle = '#f59e0b'
    ctx.fillText('NAV', 24, 38)
    ctx.fillText('HR', 24, 60)
    ctx.fillText('BAT', 24, 82)

    // Dynamic values
    ctx.font = '16px monospace'
    ctx.fillStyle = '#f8fafc'
    const navDist = Math.floor(200 + Math.sin(time * 0.3) * 50) + 'm'
    const hrBpm = Math.floor(130 + Math.cos(time * 0.5) * 15) + ' BPM'
    ctx.fillText(navDist, 100, 38)
    ctx.fillText(hrBpm, 100, 60)
    ctx.fillText('87%', 100, 82)

    // Pulse dot (animated)
    ctx.fillStyle = '#10b981'
    ctx.beginPath()
    const dotPulse = Math.sin(time * 3) * 0.5 + 0.5
    ctx.arc(210, 34, 3 + Math.sin(time * 3) * 1, 0, Math.PI * 2)
    ctx.fill()
    
    // Inner pulse indicator
    ctx.fillStyle = `rgba(16, 185, 129, ${dotPulse})`
    ctx.beginPath()
    ctx.arc(210, 34, 5 + dotPulse * 2, 0, Math.PI * 2)
    ctx.fill()
  }

  updateHUD(0)

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0.85, depthTest: false })
  const sprite = new THREE.Sprite(spriteMat)
  sprite.position.set(0.4, -0.35, 0.25)
  sprite.scale.set(0.8, 0.4, 1)

  // Store references on group for animation
  ;(group as any).userData = { hudSprite: sprite, hudCanvas: canvas, hudTexture: texture, updateHUD }

  return group
}

function createEnvironment(scene: THREE.Scene): THREE.Points {
  // Gradient background
  const canvas = document.createElement('canvas')
  canvas.width = 2
  canvas.height = 512
  const ctx = canvas.getContext('2d')!
  const grad = ctx.createLinearGradient(0, 0, 0, 512)
  grad.addColorStop(0, '#0c1929')
  grad.addColorStop(0.3, '#0f172a')
  grad.addColorStop(0.6, '#1a1a2e')
  grad.addColorStop(0.8, '#2d1b2e')
  grad.addColorStop(1, '#1a1a2e')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 2, 512)
  const bgTexture = new THREE.CanvasTexture(canvas)
  scene.background = bgTexture

  // Phase 6a: Add subtle fog for atmospheric depth
  scene.fog = new THREE.FogExp2(0x080812, 0.015)

  // Soft ambient light
  const ambient = new THREE.AmbientLight(0x404060, 0.8)
  scene.add(ambient)

  // Key light (warm)
  const keyLight = new THREE.DirectionalLight(0xffeedd, 2.5)
  keyLight.position.set(5, 8, 6)
  keyLight.castShadow = false
  scene.add(keyLight)

  // Fill light (cool)
  const fillLight = new THREE.DirectionalLight(0x8888ff, 1.2)
  fillLight.position.set(-4, 3, 5)
  scene.add(fillLight)

  // Rim light
  const rimLight = new THREE.DirectionalLight(0xffffff, 0.8)
  rimLight.position.set(-2, -1, -8)
  scene.add(rimLight)

  // Accent glow from below
  const accentLight = new THREE.PointLight(0xf59e0b, 1.5, 10)
  accentLight.position.set(0, -3, 1)
  scene.add(accentLight)

  // Ground plane (subtle reflection)
  const groundGeo = new THREE.PlaneGeometry(20, 20)
  const groundMat = new THREE.MeshPhysicalMaterial({
    color: 0x080812,
    metalness: 0.9,
    roughness: 0.3,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide,
  })
  const ground = new THREE.Mesh(groundGeo, groundMat)
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -1.8
  scene.add(ground)

  // Phase 6a: Enhanced particle system with shader material
  const particleCount = 600
  const positions = new Float32Array(particleCount * 3)
  const sizes = new Float32Array(particleCount)
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5
    sizes[i] = 0.015 + Math.random() * 0.06
  }
  const particleGeo = new THREE.BufferGeometry()
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
  
  // Phase 6a: Shader material for wispy particles with time-based animation
  const particleMat = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      pixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
    },
    vertexShader: `
      attribute float size;
      varying float vOpacity;
      uniform float time;
      void main() {
        vOpacity = size * 8.0;
        vec3 pos = position;
        pos.y += sin(time * 0.3 + position.x * 0.5) * 0.1;
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = size * 30.0 * (30.0 / -mvPosition.z) * pixelRatio;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying float vOpacity;
      void main() {
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;
        float alpha = (1.0 - dist * 2.0) * vOpacity;
        gl_FragColor = vec4(148.0/255.0, 163.0/255.0, 184.0/255.0, alpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  
  const particles = new THREE.Points(particleGeo, particleMat)
  scene.add(particles)

  return particles
}

export default function ProductSimulation({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const stateRef = useRef<State | null>(null)
  // Phase 8: Loading state
  const [isLoading, setIsLoading] = useState(true)
  // Phase 10: FPS counter and screenshot
  const [showFps, setShowFps] = useState(false)
  const [fps, setFps] = useState(60)
  const fpsRef = useRef({ count: 0, lastTime: 0, fps: 60 })

  // Phase 10: Screenshot function
  const takeScreenshot = () => {
    if (!stateRef.current) return
    const renderer = stateRef.current.renderer
    const link = document.createElement('a')
    link.download = `nexus-spectacle-${Date.now()}.png`
    link.href = renderer.domElement.toDataURL('image/png')
    link.click()
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Phase 8: Show loading state while initializing
    const loadingTimer = setTimeout(() => setIsLoading(false), 1500)

    // WebGL check
    try {
      const testCanvas = document.createElement('canvas')
      const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl')
      if (!gl) {
        setIsLoading(false)
        return
      }
    } catch {
      setIsLoading(false)
      return
    }

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.1, 50)
    camera.position.set(0, 1.5, 6)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    renderer.domElement.style.display = 'block'
    container.appendChild(renderer.domElement)

    // Phase 9: Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    // Phase 6b: Enhanced OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = !prefersReducedMotion
    controls.dampingFactor = 0.08
    controls.minDistance = 3
    controls.maxDistance = 12
    controls.autoRotate = !prefersReducedMotion
    controls.autoRotateSpeed = 1.0
    controls.target.set(0, 0.1, 0)
    controls.maxPolarAngle = Math.PI / 2.2
    controls.minPolarAngle = Math.PI / 6
    controls.enablePan = false
    controls.rotateSpeed = 0.8
    controls.zoomSpeed = 1.2

    const glasses = createGlassesModel(scene)
    glasses.position.y = 0.1
    scene.add(glasses)

    const particles = createEnvironment(scene)

    const state: State = {
      scene, camera, renderer, controls, animId: 0,
      glasses, particles,
      leftLens: glasses.children.find(c => c.position.x < -1) as THREE.Mesh,
      rightLens: glasses.children.find(c => c.position.x > 1) as THREE.Mesh,
      hudText: (glasses as any).userData?.hudSprite as THREE.Sprite,
      time: 0,
      hudCanvas: (glasses as any).userData?.hudCanvas as HTMLCanvasElement,
      hudTexture: (glasses as any).userData?.hudTexture as THREE.CanvasTexture,
    }
    stateRef.current = state

    // Add HUD sprite to scene
    if (state.hudText) {
      glasses.add(state.hudText)
    }

    // Phase 6b: Touch interaction handlers
    let autoRotateWasEnabled = true

    renderer.domElement.addEventListener('touchstart', () => {
      autoRotateWasEnabled = controls.autoRotate
      controls.autoRotate = false
    }, { passive: true })

    renderer.domElement.addEventListener('touchend', () => {
      setTimeout(() => {
        controls.autoRotate = autoRotateWasEnabled
      }, 3000)
    }, { passive: true })

    // Resize handler
    const onResize = () => {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    // Phase 12: RAF throttling when tab is hidden
    let isTabVisible = !document.hidden

    document.addEventListener('visibilitychange', () => {
      isTabVisible = !document.hidden
    })

    // Animation
    function animate() {
      state.animId = requestAnimationFrame(animate)

      // Phase 12: Skip heavy updates when tab is hidden
      if (!isTabVisible) return

      state.time += 0.016

      controls.update()

      // Update particle shader time uniform
      ;(particles.material as THREE.ShaderMaterial).uniforms.time.value = state.time

      // Glasses subtle float
      glasses.position.y = 0.1 + Math.sin(state.time * 0.5) * 0.04
      glasses.rotation.z = Math.sin(state.time * 0.3) * 0.01

      // Lens pulse
      const pulse = 0.55 + Math.sin(state.time * 2) * 0.05
      ;(state.leftLens.material as THREE.MeshPhysicalMaterial).opacity = pulse
      ;(state.rightLens.material as THREE.MeshPhysicalMaterial).opacity = pulse

      // Phase 6c: Update HUD with dynamic data
      if ((glasses as any).userData?.updateHUD) {
        ;(glasses as any).userData.updateHUD(state.time)
        state.hudTexture.needsUpdate = true
      }

      // Particles drift
      const pos = particles.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < pos.length; i += 3) {
        pos[i + 1] += Math.sin(state.time + i) * 0.0003
        pos[i] += Math.cos(state.time * 0.5 + i * 0.1) * 0.0002
        if (pos[i + 1] > 5) pos[i + 1] = -5
        if (pos[i] > 10) pos[i] = -10
      }
      particles.geometry.attributes.position.needsUpdate = true

      renderer.render(scene, camera)

      // Phase 10: FPS tracking
      fpsRef.current.count++
      if (state.time - fpsRef.current.lastTime >= 1) {
        fpsRef.current.fps = fpsRef.current.count
        fpsRef.current.count = 0
        fpsRef.current.lastTime = state.time
        setFps(fpsRef.current.fps)
      }
    }
    animate()

    return () => {
      clearTimeout(loadingTimer)
      cancelAnimationFrame(state.animId)
      controls.dispose()
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <ErrorBoundary componentName="NEXUS Spectacle 3D Simulator">
      <div
        ref={containerRef}
        className={className}
      style={{ touchAction: 'none', position: 'relative', ...style }}
      role="img"
      aria-label="NEXUS Spectacle 3D product visualization"
      tabIndex={0}
      onKeyDown={(e) => {
        // Phase 12: Keyboard shortcuts
        if (!stateRef.current) return
        const s = stateRef.current
        switch (e.key.toLowerCase()) {
          case 'r':
            s.controls.reset()
            break
          case 'f':
            s.controls.target.set(0, 0.1, 0)
            break
          case ' ':
            s.controls.autoRotate = !s.controls.autoRotate
            break
          case 's':
            if (e.shiftKey) takeScreenshot()
            break
        }
      }}
    >
      {isLoading && <LoadingSpinner />}
      {/* Phase 10: FPS Counter */}
      {!isLoading && showFps && (
        <div className="absolute top-2 left-2 bg-slate-900/70 text-green-400 font-mono text-xs px-2 py-1 rounded">
          <div>FPS: {fps.toFixed(1)}</div>
          <div>MS: {(1000 / fps).toFixed(1)}</div>
        </div>
      )}
      {/* Phase 10: Control buttons */}
      {!isLoading && (
        <div className="absolute top-2 right-2 flex gap-1">
          <button
            onClick={() => setShowFps(!showFps)}
            className="bg-slate-800/70 hover:bg-slate-700 text-amber-400 text-xs px-2 py-1 rounded"
            aria-label={showFps ? "Hide FPS counter" : "Show FPS counter"}
          >
            📊
          </button>
          <button
            onClick={takeScreenshot}
            className="bg-slate-800/70 hover:bg-slate-700 text-amber-400 text-xs px-2 py-1 rounded"
            aria-label="Capture screenshot"
          >
            📷
          </button>
        </div>
      )}
    </div>
    </ErrorBoundary>
  )
}
