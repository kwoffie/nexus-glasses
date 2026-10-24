// ---------- Mode definitions (mirrors the landing page's Health section) ----------
const CATEGORIES = [
  { id: 'correction', label: 'Correction' },
  { id: 'comfort', label: 'Comfort' },
  { id: 'enhancement', label: 'Enhancement' },
  { id: 'monitoring', label: 'Monitoring' },
]

const MODES = [
  {
    id: 'autofocus', category: 'correction', icon: '◎', name: 'Adaptive Autofocus',
    kind: 'css', on: 'filter: url(#filterSharpMild) contrast(1.05);', off: 'filter: blur(1.5px);',
    info: 'Sharpening what you\u2019re looking at',
  },
  {
    id: 'astigmatism', category: 'correction', icon: '✦', name: 'Astigmatism Correction',
    kind: 'css', on: 'filter: url(#filterSharpStrong) contrast(1.1);', off: 'filter: blur(1px) contrast(0.95);',
    info: 'Cleaning up streaking on points of light',
  },
  {
    id: 'strain', category: 'comfort', icon: '⏱', name: 'Strain Shield',
    kind: 'css', on: 'filter: sepia(0.25) saturate(1.05) brightness(0.97);', off: 'filter: none;',
    info: '20-20-20 reminder active \u2014 warming display tone',
  },
  {
    id: 'tint', category: 'comfort', icon: '☀', name: 'Photochromic Tint',
    kind: 'brightness-react', tintColor: [120, 53, 15],
    info: 'Auto-tinting based on measured scene brightness',
  },
  {
    id: 'photophobia', category: 'comfort', icon: '⚠', name: 'Glare & Light Sensitivity Shield',
    kind: 'spike-react',
    info: 'Watching for sudden brightness spikes',
  },
  {
    id: 'color', category: 'enhancement', icon: '◐', name: 'Color Vision Assist',
    kind: 'css', on: 'filter: url(#filterDaltonDeutan);', off: 'filter: none;',
    info: 'Daltonization filter (deuteranopia profile)',
  },
  {
    id: 'contrast', category: 'enhancement', icon: '▣', name: 'Contrast Boost',
    kind: 'edge',
    info: 'Live edge-enhancement overlay',
  },
  {
    id: 'night', category: 'enhancement', icon: '☾', name: 'Night Vision Boost',
    kind: 'css', on: 'filter: brightness(2.1) contrast(1.15) saturate(0.75) hue-rotate(-6deg);', off: 'filter: none;',
    info: 'Amplifying low-light detail',
  },
  {
    id: 'distance', category: 'monitoring', icon: '⌁', name: 'Distance Guard',
    kind: 'panel', panel: 'panelDistance',
    info: '',
  },
  {
    id: 'risk', category: 'monitoring', icon: '⚕', name: 'Ocular Risk Tracker',
    kind: 'panel', panel: 'panelRisk',
    info: '',
  },
]

// ---------- State ----------
let activeCategory = CATEGORIES[0].id
let activeModeId = MODES[0].id
let isOn = true
let facingMode = 'environment'
let stream = null
let rafId = null

// Gesture state
let touchStartX = 0
let touchStartY = 0
let touchStartTime = 0
const SWIPE_THRESHOLD = 50
const SWIPE_VELOCITY_THRESHOLD = 0.3

// ---------- DOM refs ----------
const $ = (id) => document.getElementById(id)
const gate = $('gate'), startBtn = $('startBtn'), gateError = $('gateError')
const stage = $('stage'), video = $('video'), fxCanvas = $('fxCanvas')
const hudModeName = $('hudModeName'), hudModeIcon = $('hudModeIcon'), hudInfo = $('hudInfo')
const modeTabsEl = $('modeTabs'), modeListEl = $('modeList')
const onOffToggle = $('onOffToggle'), offLabel = $('offLabel'), onLabel = $('onLabel')
const flipBtn = $('flipBtn'), hudClock = $('hudClock')
const panelDistance = $('panelDistance'), panelRisk = $('panelRisk')
const distanceSlider = $('distanceSlider'), distanceReadout = $('distanceReadout')
const riskScreen = $('riskScreen'), riskScreenVal = $('riskScreenVal')
const riskFamily = $('riskFamily'), riskResult = $('riskResult')

const ctx = fxCanvas.getContext('2d', { willReadFrequently: true })

// ---------- Clock ----------
function tickClock() {
  const d = new Date()
  hudClock.textContent = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
setInterval(tickClock, 1000)
tickClock()

// ---------- Gesture handling (orbit-style navigation) ----------
function getSwipeDirection(startX, startY, endX, endY) {
  const diffX = endX - startX
  const diffY = endY - startY
  const absDiffX = Math.abs(diffX)
  const absDiffY = Math.abs(diffY)

  if (Math.max(absDiffX, absDiffY) < SWIPE_THRESHOLD) {
    return null
  }

  if (absDiffX > absDiffY) {
    return diffX > 0 ? 'right' : 'left'
  } else {
    return diffY > 0 ? 'down' : 'up'
  }
}

function handleTouchStart(e) {
  if (e.touches.length === 1) {
    touchStartX = e.touches[0].clientX
    touchStartY = e.touches[0].clientY
    touchStartTime = Date.now()
  }
}

function handleTouchEnd(e) {
  if (!touchStartX || !touchStartY) return

  const touchEndX = e.changedTouches[0].clientX
  const touchEndY = e.changedTouches[0].clientY
  const touchEndTime = Date.now()

  const duration = touchEndTime - touchStartTime
  const direction = getSwipeDirection(touchStartX, touchStartY, touchEndX, touchEndY)

  if (direction) {
    const velocity = Math.max(
      Math.abs(touchEndX - touchStartX),
      Math.abs(touchEndY - touchStartY)
    ) / duration

    if (velocity > SWIPE_VELOCITY_THRESHOLD) {
      handleSwipe(direction)
    }
  }

  touchStartX = 0
  touchStartY = 0
  touchStartTime = 0
}

function handleSwipe(direction) {
  const currentCategoryIndex = CATEGORIES.findIndex(c => c.id === activeCategory)
  const currentModeIndex = MODES.filter(m => m.category === activeCategory).findIndex(m => m.id === activeModeId)

  if (direction === 'left' || direction === 'right') {
    // Cycle through categories
    let newCategoryIndex
    if (direction === 'left') {
      newCategoryIndex = (currentCategoryIndex + 1) % CATEGORIES.length
    } else {
      newCategoryIndex = (currentCategoryIndex - 1 + CATEGORIES.length) % CATEGORIES.length
    }
    activeCategory = CATEGORIES[newCategoryIndex].id
    const firstMode = MODES.find(m => m.category === activeCategory)
    if (firstMode) setActiveMode(firstMode.id)
  } else if (direction === 'up' || direction === 'down') {
    // Cycle through modes in current category
    const currentModes = MODES.filter(m => m.category === activeCategory)
    let newModeIndex
    if (direction === 'up') {
      newModeIndex = (currentModeIndex + 1) % currentModes.length
    } else {
      newModeIndex = (currentModeIndex - 1 + currentModes.length) % currentModes.length
    }
    if (currentModes[newModeIndex]) {
      setActiveMode(currentModes[newModeIndex].id)
    }
  }

  // Visual feedback
  pulseHUD()
}

function pulseHUD() {
  const hud = document.querySelector('.hud')
  hud.style.transition = 'transform 0.15s ease'
  hud.style.transform = 'scale(1.02)'
  setTimeout(() => {
    hud.style.transform = 'scale(1)'
  }, 150)
}

// Attach gesture listeners
document.addEventListener('touchstart', handleTouchStart, { passive: true })
document.addEventListener('touchend', handleTouchEnd, { passive: true })

// Mouse wheel support for desktop orbit controls
document.addEventListener('wheel', (e) => {
  if (e.target.closest('.panel') || e.target.closest('.hud-bottom')) {
    return // Allow normal scrolling in control areas
  }

  const currentCategoryIndex = CATEGORIES.findIndex(c => c.id === activeCategory)
  const currentModeIndex = MODES.filter(m => m.category === activeCategory).findIndex(m => m.id === activeModeId)

  if (e.deltaY > 0) {
    // Scroll down - next mode or next category
    const currentModes = MODES.filter(m => m.category === activeCategory)
    if (currentModeIndex < currentModes.length - 1) {
      setActiveMode(currentModes[currentModeIndex + 1].id)
    } else {
      const nextCategoryIndex = (currentCategoryIndex + 1) % CATEGORIES.length
      activeCategory = CATEGORIES[nextCategoryIndex].id
      const firstMode = MODES.find(m => m.category === activeCategory)
      if (firstMode) setActiveMode(firstMode.id)
    }
  } else {
    // Scroll up - previous mode or previous category
    const currentModes = MODES.filter(m => m.category === activeCategory)
    if (currentModeIndex > 0) {
      setActiveMode(currentModes[currentModeIndex - 1].id)
    } else {
      const prevCategoryIndex = (currentCategoryIndex - 1 + CATEGORIES.length) % CATEGORIES.length
      activeCategory = CATEGORIES[prevCategoryIndex].id
      const lastMode = MODES.filter(m => m.category === activeCategory).pop()
      if (lastMode) setActiveMode(lastMode.id)
    }
  }

  pulseHUD()
}, { passive: true })

// ---------- Camera ----------
async function startCamera() {
  try {
    if (stream) stream.getTracks().forEach((t) => t.stop())
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    })
    video.srcObject = stream
    await video.play()
    return true
  } catch (err) {
    gateError.hidden = false
    gateError.textContent =
      err.name === 'NotAllowedError'
        ? 'Camera permission was denied. Allow camera access in your browser settings and reload.'
        : 'Could not access a camera on this device (' + err.message + ').'
    return false
  }
}

startBtn.addEventListener('click', async () => {
  startBtn.disabled = true
  startBtn.textContent = 'Requesting camera\u2026'
  const ok = await startCamera()
  if (ok) {
    gate.hidden = true
    stage.hidden = false
    resizeCanvas()
    buildTabs()
    buildModeList()
    setActiveMode(activeModeId)
    loop()
  } else {
    startBtn.disabled = false
    startBtn.textContent = 'Try Again'
  }
})

flipBtn.addEventListener('click', async () => {
  facingMode = facingMode === 'environment' ? 'user' : 'environment'
  await startCamera()
})

function resizeCanvas() {
  fxCanvas.width = window.innerWidth
  fxCanvas.height = window.innerHeight
}
window.addEventListener('resize', resizeCanvas)

// ---------- UI: category tabs ----------
function buildTabs() {
  modeTabsEl.innerHTML = ''
  CATEGORIES.forEach((cat) => {
    const btn = document.createElement('button')
    btn.className = 'tab-btn' + (cat.id === activeCategory ? ' active' : '')
    btn.textContent = cat.label
    btn.onclick = () => {
      activeCategory = cat.id
      const first = MODES.find((m) => m.category === cat.id)
      buildTabs()
      buildModeList()
      if (first) setActiveMode(first.id)
    }
    modeTabsEl.appendChild(btn)
  })
}

// ---------- UI: mode buttons ----------
function buildModeList() {
  modeListEl.innerHTML = ''
  MODES.filter((m) => m.category === activeCategory).forEach((mode) => {
    const btn = document.createElement('button')
    btn.className = 'mode-btn' + (mode.id === activeModeId ? ' active' : '')
    btn.innerHTML = `<span class="ico">${mode.icon}</span><span>${mode.name}</span>`
    btn.onclick = () => setActiveMode(mode.id)
    modeListEl.appendChild(btn)
  })
}

function setActiveMode(id) {
  activeModeId = id
  const mode = MODES.find((m) => m.id === id)
  hudModeName.textContent = mode.name
  hudModeIcon.textContent = mode.icon
  hudInfo.textContent = isOn ? mode.info : ''
  panelDistance.hidden = mode.panel !== 'panelDistance'
  panelRisk.hidden = mode.panel !== 'panelRisk'
  ;[...modeListEl.children].forEach((el, i) => {
    const m = MODES.filter((mm) => mm.category === activeCategory)[i]
    el.classList.toggle('active', m && m.id === id)
  })
  applyMode()
}

// ---------- ON/OFF toggle ----------
onOffToggle.addEventListener('click', () => {
  isOn = !isOn
  onOffToggle.setAttribute('aria-checked', String(isOn))
  offLabel.classList.toggle('active', !isOn)
  onLabel.classList.toggle('active', isOn)
  const mode = MODES.find((m) => m.id === activeModeId)
  hudInfo.textContent = isOn ? mode.info : ''
  applyMode()
})
offLabel.classList.toggle('active', !isOn)
onLabel.classList.toggle('active', isOn)

// ---------- Apply mode (CSS-filter modes) ----------
function applyMode() {
  const mode = MODES.find((m) => m.id === activeModeId)
  if (mode.kind === 'css') {
    video.style.cssText = isOn ? mode.on : mode.off
  } else if (mode.kind === 'panel') {
    video.style.cssText = 'filter:none;'
  } else {
    // brightness-react / spike-react / edge are handled per-frame in the render loop
    video.style.cssText = 'filter:none;'
  }
  ctx.clearRect(0, 0, fxCanvas.width, fxCanvas.height)

  // Animate mode transition
  animateModeTransition()
}

function animateModeTransition() {
  const stage = document.querySelector('.stage')
  stage.style.transition = 'opacity 0.2s ease'
  stage.style.opacity = '0.85'
  setTimeout(() => {
    stage.style.opacity = '1'
  }, 200)
}

// ---------- Panels ----------
distanceSlider.addEventListener('input', () => {
  const v = Number(distanceSlider.value)
  distanceReadout.textContent = v + ' cm'
  distanceReadout.style.color = v < 30 ? '#f87171' : '#fcd34d'
  distanceReadout.textContent = v < 30 ? `${v} cm \u2014 too close, back up` : `${v} cm`
})

function updateRisk() {
  const hrs = Number(riskScreen.value)
  riskScreenVal.textContent = hrs + ' hrs'
  const fam = riskFamily.value
  let months = 24
  if (hrs >= 10) months -= 6
  if (hrs >= 14) months -= 6
  if (fam === 'yes') months -= 6
  if (fam === 'unsure') months -= 3
  months = Math.max(6, months)
  riskResult.textContent = `Suggested next dilated exam: within ${months} months`
}
riskScreen.addEventListener('input', updateRisk)
riskFamily.addEventListener('change', updateRisk)
updateRisk()

// ---------- Per-frame processing for brightness/spike/edge modes ----------
let lastBrightness = null
const SAMPLE_SIZE = 48 // downscale for fast luminance sampling
const sampleCanvas = document.createElement('canvas')
sampleCanvas.width = SAMPLE_SIZE
sampleCanvas.height = SAMPLE_SIZE
const sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true })

// Animation frame tracking for smooth HUD updates
let lastFrameTime = performance.now()
const FRAME_RATE = 60
const FRAME_DURATION = 1000 / FRAME_RATE

function measureBrightness() {
  if (video.readyState < 2) return 0.5
  sampleCtx.drawImage(video, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE)
  const data = sampleCtx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE).data
  let total = 0
  for (let i = 0; i < data.length; i += 4) {
    total += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
  }
  return total / (SAMPLE_SIZE * SAMPLE_SIZE) / 255
}

const EDGE_SIZE = 96
const edgeCanvas = document.createElement('canvas')
edgeCanvas.width = EDGE_SIZE
edgeCanvas.height = EDGE_SIZE
const edgeCtx = edgeCanvas.getContext('2d', { willReadFrequently: true })

function drawEdges() {
  edgeCtx.drawImage(video, 0, 0, EDGE_SIZE, EDGE_SIZE)
  const src = edgeCtx.getImageData(0, 0, EDGE_SIZE, EDGE_SIZE)
  const out = edgeCtx.createImageData(EDGE_SIZE, EDGE_SIZE)
  const gray = new Float32Array(EDGE_SIZE * EDGE_SIZE)
  for (let i = 0, p = 0; i < src.data.length; i += 4, p++) {
    gray[p] = 0.299 * src.data[i] + 0.587 * src.data[i + 1] + 0.114 * src.data[i + 2]
  }
  for (let y = 1; y < EDGE_SIZE - 1; y++) {
    for (let x = 1; x < EDGE_SIZE - 1; x++) {
      const i = y * EDGE_SIZE + x
      const gx =
        -gray[i - EDGE_SIZE - 1] + gray[i - EDGE_SIZE + 1] +
        -2 * gray[i - 1] + 2 * gray[i + 1] +
        -gray[i + EDGE_SIZE - 1] + gray[i + EDGE_SIZE + 1]
      const gy =
        -gray[i - EDGE_SIZE - 1] - 2 * gray[i - EDGE_SIZE] - gray[i - EDGE_SIZE + 1] +
        gray[i + EDGE_SIZE - 1] + 2 * gray[i + EDGE_SIZE] + gray[i + EDGE_SIZE + 1]
      const mag = Math.min(255, Math.sqrt(gx * gx + gy * gy))
      const o = i * 4
      out.data[o] = 248; out.data[o + 1] = 250; out.data[o + 2] = 252
      out.data[o + 3] = mag > 60 ? mag : 0
    }
  }
  edgeCtx.putImageData(out, 0, 0)
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(edgeCanvas, 0, 0, fxCanvas.width, fxCanvas.height)
}

let spikeDim = 0
function loop(currentTime) {
  // Throttle to target frame rate for smoother animations
  const elapsed = currentTime - lastFrameTime

  if (elapsed >= FRAME_DURATION) {
    lastFrameTime = currentTime - (elapsed % FRAME_DURATION)

    const mode = MODES.find((m) => m.id === activeModeId)

    if (mode.kind === 'brightness-react') {
      ctx.clearRect(0, 0, fxCanvas.width, fxCanvas.height)
      if (isOn) {
        const b = measureBrightness()
        const strength = Math.max(0, (b - 0.35)) * 0.9
        const [r, g, bl] = mode.tintColor
        ctx.fillStyle = `rgba(${r},${g},${bl},${strength.toFixed(3)})`
        ctx.fillRect(0, 0, fxCanvas.width, fxCanvas.height)
        hudInfo.textContent = `Scene brightness ${(b * 100).toFixed(0)}% — tint ${(strength * 100).toFixed(0)}%`
      }
    } else if (mode.kind === 'spike-react') {
      ctx.clearRect(0, 0, fxCanvas.width, fxCanvas.height)
      if (isOn) {
        const b = measureBrightness()
        if (lastBrightness !== null) {
          const delta = b - lastBrightness
          if (delta > 0.06) spikeDim = 1
        }
        lastBrightness = b
        spikeDim *= 0.9
        if (spikeDim > 0.02) {
          ctx.fillStyle = `rgba(3,7,18,${Math.min(0.75, spikeDim).toFixed(3)})`
          ctx.fillRect(0, 0, fxCanvas.width, fxCanvas.height)
          hudInfo.textContent = 'Glare spike detected — dimming'
        } else {
          hudInfo.textContent = 'Watching for brightness spikes'
        }
      }
    } else if (mode.kind === 'edge') {
      if (isOn) {
        drawEdges()
      } else {
        ctx.clearRect(0, 0, fxCanvas.width, fxCanvas.height)
      }
    }
  }

  rafId = requestAnimationFrame(loop)
}

// ---------- Keyboard shortcuts ----------
document.addEventListener('keydown', (e) => {
  switch(e.key) {
    case ' ':
      e.preventDefault()
      onOffToggle.click()
      break
    case 'ArrowLeft':
      e.preventDefault()
      handleSwipe('left')
      break
    case 'ArrowRight':
      e.preventDefault()
      handleSwipe('right')
      break
    case 'ArrowUp':
      e.preventDefault()
      handleSwipe('up')
      break
    case 'ArrowDown':
      e.preventDefault()
      handleSwipe('down')
      break
    case 'f':
    case 'F':
      flipBtn.click()
      break
  }
})

// ---------- Register service worker for installability ----------
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {})
  })
}
