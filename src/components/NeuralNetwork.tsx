import { useEffect, useRef } from 'react'
import * as THREE from 'three'

interface NodeData {
  x: number; y: number; z: number
  vx: number; vy: number; vz: number
  radius: number
  color: number
  importance: number
  pulseSpeed: number
  pulsePhase: number
}

interface EdgeData {
  source: number
  target: number
}

interface ParticleData {
  x: number; y: number; z: number
  vx: number; vy: number; vz: number
  life: number
  maxLife: number
  size: number
}

const COLORS = [0xf59e0b, 0x3b82f6, 0x10b981, 0x8b5cf6]
const COLOR_WEIGHTS = [0.40, 0.35, 0.20, 0.05]

function pickColor(): number {
  const r = Math.random()
  let cumulative = 0
  for (let i = 0; i < COLORS.length; i++) {
    cumulative += COLOR_WEIGHTS[i]
    if (r < cumulative) return COLORS[i]
  }
  return COLORS[0]
}

export default function NeuralNetwork({ className = '' }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const stateRef = useRef<{
    renderer: THREE.WebGLRenderer
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    nodes: NodeData[]
    edges: EdgeData[]
    nodeMeshes: THREE.Mesh[]
    glowMeshes: THREE.Mesh[]
    edgeMeshes: THREE.Mesh[]
    ambientParticles: THREE.Mesh[]
    burstParticles: ParticleData[]
    burstMeshes: THREE.Mesh[]
    mouseX: number
    mouseY: number
    targetRotX: number
    targetRotY: number
    cameraDist: number
    animId: number
    lastTime: number
    isVisible: boolean
    raycaster: THREE.Raycaster
    pointer: THREE.Vector2
  } | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Check for WebGL support
    try {
      const testCanvas = document.createElement('canvas')
      const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl')
      if (!gl) {
        console.warn('WebGL not supported')
        return
      }
    } catch (e) {
      console.warn('WebGL check failed:', e)
      return
    }

    const NODE_COUNT = 50
    const EDGE_COUNT = 120
    const AMBIENT_COUNT = 200

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0b1220)
    
    // Use fallback dimensions if container not yet sized
    const width = container.clientWidth || 800
    const height = container.clientHeight || 600
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    } catch (e) {
      console.warn('WebGL initialization failed:', e)
      return
    }
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    renderer.domElement.style.display = 'block'
    container.appendChild(renderer.domElement)

    // Nodes
    const nodes: NodeData[] = []
    const nodeMeshes: THREE.Mesh[] = []
    const glowMeshes: THREE.Mesh[] = []

    for (let i = 0; i < NODE_COUNT; i++) {
      const importance = Math.random()
      const radius = 0.3 + importance * 1.2
      const color = pickColor()
      const node: NodeData = {
        x: (Math.random() - 0.5) * 60,
        y: (Math.random() - 0.5) * 60,
        z: (Math.random() - 0.5) * 60,
        vx: 0, vy: 0, vz: 0,
        radius,
        color,
        importance,
        pulseSpeed: 1.5 + Math.random() * 2,
        pulsePhase: Math.random() * Math.PI * 2,
      }
      nodes.push(node)

      const geo = new THREE.SphereGeometry(radius, 32, 32)
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.set(node.x, node.y, node.z)
      scene.add(mesh)
      nodeMeshes.push(mesh)

      const glowGeo = new THREE.SphereGeometry(radius * 2.5, 16, 16)
      const glowMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.08 })
      const glowMesh = new THREE.Mesh(glowGeo, glowMat)
      glowMesh.position.set(node.x, node.y, node.z)
      scene.add(glowMesh)
      glowMeshes.push(glowMesh)
    }

    // Edges
    const edges: EdgeData[] = []
    const edgeMeshes: THREE.Mesh[] = []
    const addedPairs = new Set<string>()

    for (let i = 0; i < EDGE_COUNT; i++) {
      let a = Math.floor(Math.random() * NODE_COUNT)
      let b = Math.floor(Math.random() * NODE_COUNT)
      while (a === b) b = Math.floor(Math.random() * NODE_COUNT)
      const key = a < b ? `${a}-${b}` : `${b}-${a}`
      if (addedPairs.has(key)) continue
      addedPairs.add(key)
      edges.push({ source: a, target: b })

      const geo = new THREE.CylinderGeometry(0.06, 0.06, 1, 4, 1)
      geo.rotateX(Math.PI / 2)
      const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.06 })
      const mesh = new THREE.Mesh(geo, mat)
      scene.add(mesh)
      edgeMeshes.push(mesh)
    }

    // Outer wireframe sphere
    const outerSphereGeo = new THREE.IcosahedronGeometry(35, 1)
    const outerSphereMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.04, wireframe: true })
    const outerSphere = new THREE.Mesh(outerSphereGeo, outerSphereMat)
    scene.add(outerSphere)

    // Orbital rings
    const rings: THREE.Mesh[] = []
    const ringGeo = new THREE.TorusGeometry(25, 0.15, 16, 100)
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.15 })
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(ringGeo, ringMat.clone())
      ring.rotation.x = Math.random() * Math.PI
      ring.rotation.y = Math.random() * Math.PI
      scene.add(ring)
      rings.push(ring)
    }

    // Central core
    const coreGeo = new THREE.IcosahedronGeometry(2.5, 2)
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.3, wireframe: true })
    const core = new THREE.Mesh(coreGeo, coreMat)
    scene.add(core)

    // Data flow particles (travel along edges)
    const flowParticles: ParticleData[] = []
    const flowMeshes: THREE.Mesh[] = []
    const flowGeo = new THREE.SphereGeometry(0.15, 8, 8)
    const flowMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.9 })
    for (let i = 0; i < 80; i++) {
      const mesh = new THREE.Mesh(flowGeo, flowMat.clone())
      mesh.visible = false
      scene.add(mesh)
      flowMeshes.push(mesh)
      flowParticles.push({
        x: 0, y: 0, z: 0,
        vx: 0, vy: 0, vz: 0,
        life: 0, maxLife: 0, size: 0.15
      })
    }

    // Holographic grid plane
    const gridHelper = new THREE.GridHelper(60, 20, 0xf59e0b, 0xf59e0b)
    gridHelper.position.y = -25
    gridHelper.material.opacity = 0.08
    gridHelper.material.transparent = true
    scene.add(gridHelper)

    // Ambient particles
    const ambientParticles: THREE.Mesh[] = []
    const particleGeo = new THREE.SphereGeometry(1, 6, 6)
    const particleMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.35 })

    for (let i = 0; i < AMBIENT_COUNT; i++) {
      const size = 0.05 + Math.random() * 0.12
      const mesh = new THREE.Mesh(particleGeo, particleMat.clone())
      mesh.scale.setScalar(size)
      mesh.position.set(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100
      )
      mesh.userData = {
        vx: (Math.random() - 0.5) * 0.02,
        vy: (Math.random() - 0.5) * 0.02,
        vz: (Math.random() - 0.5) * 0.02,
      }
      scene.add(mesh)
      ambientParticles.push(mesh)
    }

    // Burst particles
    const burstParticles: ParticleData[] = []
    const burstMeshes: THREE.Mesh[] = []
    const burstGeo = new THREE.SphereGeometry(1, 6, 6)
    const burstMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.8 })

    for (let i = 0; i < 60; i++) {
      const mesh = new THREE.Mesh(burstGeo, burstMat.clone())
      mesh.visible = false
      scene.add(mesh)
      burstMeshes.push(mesh)
      burstParticles.push({ x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, life: 0, maxLife: 0, size: 0.1 })
    }

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2(-10, -10)

    const state = {
      renderer, scene, camera,
      nodes, edges, nodeMeshes, glowMeshes, edgeMeshes,
      ambientParticles, burstParticles, burstMeshes,
      flowParticles, flowMeshes,
      mouseX: 0.5, mouseY: 0.5,
      targetRotX: 0, targetRotY: 0,
      cameraDist: 80,
      animId: 0, lastTime: performance.now(),
      isVisible: true,
      raycaster, pointer,
      isDragging: false,
      previousMouseX: 0,
      previousMouseY: 0,
    }
    stateRef.current = state

    // Camera initial position
    camera.position.set(0, 0, 80)
    camera.lookAt(0, 0, 0)

    // Mouse handlers for orbit controls
    const onMouseDown = (e: MouseEvent) => {
      state.isDragging = true
      state.previousMouseX = e.clientX
      state.previousMouseY = e.clientY
    }

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      state.mouseX = (e.clientX - rect.left) / rect.width
      state.mouseY = (e.clientY - rect.top) / rect.height

      if (state.isDragging) {
        const deltaX = e.clientX - state.previousMouseX
        const deltaY = e.clientY - state.previousMouseY
        state.targetRotY += deltaX * 0.005
        state.targetRotX += deltaY * 0.005
        // Clamp vertical rotation
        state.targetRotX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, state.targetRotX))
        state.previousMouseX = e.clientX
        state.previousMouseY = e.clientY
      }
    }

    const onMouseUp = () => {
      state.isDragging = false
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const zoomSpeed = 0.1
      state.cameraDist += e.deltaY * zoomSpeed
      state.cameraDist = Math.max(20, Math.min(150, state.cameraDist))
    }

    const onClick = (e: MouseEvent) => {
      // Only spawn burst if not dragging
      if (state.isDragging) return
      const rect = container.getBoundingClientRect()
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      const intersects = raycaster.intersectObjects(nodeMeshes)
      if (intersects.length > 0) {
        const idx = nodeMeshes.indexOf(intersects[0].object as THREE.Mesh)
        if (idx >= 0) spawnBurst(nodes[idx].x, nodes[idx].y, nodes[idx].z)
      }
    }

    function spawnBurst(x: number, y: number, z: number) {
      let spawned = 0
      for (let i = 0; i < burstParticles.length && spawned < 25; i++) {
        if (burstParticles[i].life <= 0) {
          burstParticles[i].x = x
          burstParticles[i].y = y
          burstParticles[i].z = z
          const theta = Math.random() * Math.PI * 2
          const phi = Math.random() * Math.PI
          const speed = 0.3 + Math.random() * 0.5
          burstParticles[i].vx = Math.sin(phi) * Math.cos(theta) * speed
          burstParticles[i].vy = Math.sin(phi) * Math.sin(theta) * speed
          burstParticles[i].vz = Math.cos(phi) * speed
          burstParticles[i].life = 1.0
          burstParticles[i].maxLife = 1.0
          burstParticles[i].size = 0.08 + Math.random() * 0.15
          burstMeshes[i].visible = true
          burstMeshes[i].position.set(x, y, z)
          burstMeshes[i].scale.setScalar(burstParticles[i].size)
          spawned++
        }
      }
    }

    container.addEventListener('mousedown', onMouseDown)
    container.addEventListener('mousemove', onMouseMove)
    container.addEventListener('mouseup', onMouseUp)
    container.addEventListener('mouseleave', onMouseUp)
    container.addEventListener('wheel', onWheel, { passive: false })
    container.addEventListener('click', onClick)

    // Visibility observer
    const observer = new IntersectionObserver(
      ([entry]) => { state.isVisible = entry.isIntersecting },
      { threshold: 0.05 }
    )
    observer.observe(container)

    // Animation loop
    function animate() {
      state.animId = requestAnimationFrame(animate)
      if (!state.isVisible) return

      const now = performance.now()
      const dt = Math.min((now - state.lastTime) / 1000, 0.05)
      state.lastTime = now
      const time = now / 1000

      // Force-directed layout
      const repulsion = 1.0
      const attraction = 1.0
      const dtForce = 0.016

      // Repulsion
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x
          const dy = nodes[j].y - nodes[i].y
          const dz = nodes[j].z - nodes[i].z
          const distSq = dx * dx + dy * dy + dz * dz
          let dist = Math.sqrt(distSq)
          if (dist < 0.1) dist = 0.1
          const force = (200.0 * repulsion) / (distSq)
          const fx = (dx / dist) * force
          const fy = (dy / dist) * force
          const fz = (dz / dist) * force
          nodes[i].vx -= fx * dtForce
          nodes[i].vy -= fy * dtForce
          nodes[i].vz -= fz * dtForce
          nodes[j].vx += fx * dtForce
          nodes[j].vy += fy * dtForce
          nodes[j].vz += fz * dtForce
        }
      }

      // Attraction
      for (const edge of edges) {
        const s = nodes[edge.source]
        const t = nodes[edge.target]
        const dx = t.x - s.x
        const dy = t.y - s.y
        const dz = t.z - s.z
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.001
        const force = dist * 0.05 * attraction
        const fx = (dx / dist) * force
        const fy = (dy / dist) * force
        const fz = (dz / dist) * force
        s.vx += fx * dtForce
        s.vy += fy * dtForce
        s.vz += fz * dtForce
        t.vx -= fx * dtForce
        t.vy -= fy * dtForce
        t.vz -= fz * dtForce
      }

      // Center gravity + integrate
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]
        n.vx -= n.x * 0.01
        n.vy -= n.y * 0.01
        n.vz -= n.z * 0.01
        n.vx *= 0.9
        n.vy *= 0.9
        n.vz *= 0.9
        n.x += n.vx
        n.y += n.vy
        n.z += n.vz

        // Pulse
        const pulseScale = 1 + Math.sin(time * n.pulseSpeed + n.pulsePhase) * 0.12
        nodeMeshes[i].scale.setScalar(pulseScale)
        glowMeshes[i].scale.setScalar(pulseScale * 2.5)
        nodeMeshes[i].position.set(n.x, n.y, n.z)
        glowMeshes[i].position.set(n.x, n.y, n.z)
      }

      // Update edges
      for (let i = 0; i < edges.length; i++) {
        const s = nodes[edges[i].source]
        const t = nodes[edges[i].target]
        const midX = (s.x + t.x) / 2
        const midY = (s.y + t.y) / 2
        const midZ = (s.z + t.z) / 2
        const dx = t.x - s.x
        const dy = t.y - s.y
        const dz = t.z - s.z
        const len = Math.sqrt(dx * dx + dy * dy + dz * dz)
        edgeMeshes[i].position.set(midX, midY, midZ)
        edgeMeshes[i].scale.set(1, 1, len)
        edgeMeshes[i].lookAt(t.x, t.y, t.z)
      }

      // Rotate rings
      for (let i = 0; i < rings.length; i++) {
        rings[i].rotation.x += 0.002 * (i + 1)
        rings[i].rotation.y += 0.003 * (i + 1)
      }

      // Pulse core
      const coreScale = 1 + Math.sin(time * 2) * 0.15
      core.scale.setScalar(coreScale)
      core.rotation.x += 0.005
      core.rotation.y += 0.008

      // Ambient particles
      for (const p of ambientParticles) {
        p.position.x += p.userData.vx
        p.position.y += p.userData.vy
        p.position.z += p.userData.vz
        if (Math.abs(p.position.x) > 50) p.userData.vx *= -1
        if (Math.abs(p.position.y) > 50) p.userData.vy *= -1
        if (Math.abs(p.position.z) > 50) p.userData.vz *= -1
      }

      // Burst particles
      for (let i = 0; i < burstParticles.length; i++) {
        const bp = burstParticles[i]
        if (bp.life > 0) {
          bp.x += bp.vx
          bp.y += bp.vy
          bp.z += bp.vz
          bp.life -= dt * 1.5
          const alpha = Math.max(0, bp.life / bp.maxLife)
          burstMeshes[i].position.set(bp.x, bp.y, bp.z)
          burstMeshes[i].scale.setScalar(bp.size * alpha)
          ;(burstMeshes[i].material as THREE.MeshBasicMaterial).opacity = alpha * 0.8
          if (bp.life <= 0) burstMeshes[i].visible = false
        }
      }

      // Data flow particles
      if (Math.random() < 0.3) {
        const edgeIdx = Math.floor(Math.random() * edges.length)
        const edge = edges[edgeIdx]
        const source = nodes[edge.source]
        const target = nodes[edge.target]
        for (let i = 0; i < flowParticles.length; i++) {
          if (flowParticles[i].life <= 0) {
            flowParticles[i].x = source.x
            flowParticles[i].y = source.y
            flowParticles[i].z = source.z
            flowParticles[i].life = 1.0
            flowParticles[i].maxLife = 1.0
            flowMeshes[i].visible = true
            flowMeshes[i].position.set(source.x, source.y, source.z)
            break
          }
        }
      }
      for (let i = 0; i < flowParticles.length; i++) {
        const fp = flowParticles[i]
        if (fp.life > 0) {
          const edgeIdx = i % edges.length
          const edge = edges[edgeIdx]
          const source = nodes[edge.source]
          const target = nodes[edge.target]
          const progress = 1 - fp.life
          fp.x = source.x + (target.x - source.x) * progress
          fp.y = source.y + (target.y - source.y) * progress
          fp.z = source.z + (target.z - source.z) * progress
          fp.life -= dt * 2.5
          const alpha = Math.max(0, fp.life / fp.maxLife)
          flowMeshes[i].position.set(fp.x, fp.y, fp.z)
          flowMeshes[i].scale.setScalar(0.15 * alpha)
          ;(flowMeshes[i].material as THREE.MeshBasicMaterial).opacity = alpha * 0.9
          if (fp.life <= 0) flowMeshes[i].visible = false
        }
      }

      // Camera (orbit controls)
      if (!state.isDragging) {
        state.targetRotX = (state.mouseY - 0.5) * 0.8
        state.targetRotY = (state.mouseX - 0.5) * 0.8
      }
      const camX = Math.sin(state.targetRotY) * Math.cos(-state.targetRotX) * state.cameraDist
      const camY = Math.sin(-state.targetRotX) * state.cameraDist
      const camZ = Math.cos(state.targetRotY) * Math.cos(-state.targetRotX) * state.cameraDist
      camera.position.x += (camX - camera.position.x) * 0.05 * dt * 60
      camera.position.y += (camY - camera.position.y) * 0.05 * dt * 60
      camera.position.z += (camZ - camera.position.z) * 0.05 * dt * 60
      camera.lookAt(0, 0, 0)

      renderer.render(scene, camera)
    }

    animate()

    // Resize
    const onResize = () => {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(state.animId)
      container.removeEventListener('mousedown', onMouseDown)
      container.removeEventListener('mousemove', onMouseMove)
      container.removeEventListener('mouseup', onMouseUp)
      container.removeEventListener('mouseleave', onMouseUp)
      container.removeEventListener('wheel', onWheel)
      container.removeEventListener('click', onClick)
      window.removeEventListener('resize', onResize)
      observer.disconnect()
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
      // Dispose geometries and materials
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose()
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose())
          } else {
            obj.material.dispose()
          }
        }
      })
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ touchAction: 'none' }}
    />
  )
}
