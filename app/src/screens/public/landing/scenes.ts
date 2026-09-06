import type * as ThreeNS from 'three'
import { MAP_CITIES, MAP_LINKS, MAP_POLYS, MAP_STEP, type CityRing } from './mapData'

/** The `SALIS AUTO last` artifact's WebGL layer: three lazy scenes behind the
 *  landing page — the circuit constellation in the hero, the six-stage rail,
 *  and the AI-era regional map.
 *
 *  Every one of them is decoration over markup that is already complete. The
 *  page ships a static SVG or HTML fallback for each, and this module refuses
 *  to start at all unless motion is allowed, the viewport is wide, and WebGL
 *  exists — the same three gates the artifact applies, so most visitors see
 *  the fallbacks and nothing is lost when they do.
 *
 *  ## Why Three.js comes off a CDN
 *
 *  It is not a bundled dependency. `vite.config.ts` routes every `node_modules`
 *  import into one shared `vendor` chunk, so bundling Three would put 792 kB in
 *  front of every visitor to every screen — twice `check-bundle`'s 375 kB
 *  ceiling, for decoration on one marketing page. Loading it at runtime keeps
 *  the bundle exactly as it was and keeps that gate honest.
 *
 *  `three` is therefore a devDependency for its types only (`import type`,
 *  erased at compile time); the runtime arrives as the UMD global. The pinned
 *  r128 is the build the artifact's scene code was written and tuned against —
 *  before r152 turned colour management on by default — so the brand hexes
 *  render exactly as designed. Version and types are pinned together; move both
 *  or neither.
 *
 *  If the script fails to load, is blocked, or throws, the catch leaves the
 *  fallbacks in place and the page is the page it already was. */

type Three = typeof ThreeNS

/** Pinned deliberately — see the note above on r128 and colour management. */
const THREE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'

/** The brand palette as WebGL wants it. These mirror `styles/tokens/colors.css`
 *  — the same values `landing.css` reaches through `var(--salis-*)` — but a
 *  GL material and a canvas context take a number and a `#rrggbb` string, not
 *  a custom property, so the scenes carry their own copy. Numeric literals
 *  keep `check-tokens` meaningful: it scans for `#` strings, and `css()` below
 *  is the only place one is ever produced. */
const C = {
  navy: 0x0b1f3b,
  navy2: 0x1e3a5f,
  blue: 0x0a5ed7,
  bright: 0x0bb3ff,
  orange: 0xf97316,
  white: 0xffffff,
  line: 0xc3cbd6,
  muted: 0x64748b,
  hairline: 0xe2e8f0,
  chip: 0xe9f0fb,
  bandMuted: 0xb7c4d6,
} as const

/** Canvas wants `#rrggbb`; WebGL wants the number. One source, two forms. */
const css = (hex: number): string => `#${hex.toString(16).padStart(6, '0')}`

const AR: Record<string, string> = {
  riyadh: 'الرياض', jeddah: 'جدة', dammam: 'الدمام', madinah: 'المدينة', abha: 'أبها',
  kuwait: 'الكويت', manama: 'المنامة', doha: 'الدوحة', abudhabi: 'أبوظبي', dubai: 'دبي',
  muscat: 'مسقط', amman: 'عمّان', cairo: 'القاهرة', baghdad: 'بغداد',
}
const EN: Record<string, string> = {
  riyadh: 'Riyadh', jeddah: 'Jeddah', dammam: 'Dammam', madinah: 'Madinah', abha: 'Abha',
  kuwait: 'Kuwait', manama: 'Manama', doha: 'Doha', abudhabi: 'Abu Dhabi', dubai: 'Dubai',
  muscat: 'Muscat', amman: 'Amman', cairo: 'Cairo', baghdad: 'Baghdad',
}

/** Pointer and scroll, sampled once for every scene rather than per instance. */
const pointer = { x: 0, y: 0, tx: 0, ty: 0, px: 0, py: 0 }
let scrollY = 0

type Pointer = typeof pointer
type Tick = (dt: number, ptr: Pointer) => void
type Api = {
  T: Three
  scene: ThreeNS.Scene
  cam: ThreeNS.PerspectiveCamera
  el: HTMLElement
  renderer: ThreeNS.WebGLRenderer
  w: number
  h: number
  t: number
  born: number
}

const isRtl = (): boolean => document.documentElement.dir === 'rtl'
const easeOut = (k: number): number => 1 - (1 - Math.max(0, Math.min(1, k))) ** 3

/** A deterministic PRNG, so the constellation is the same shape every visit. */
function seeded(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')))
  } catch {
    return false
  }
}

// ── shared materials, textures and helpers ──────────────────────────────────

const texCache: Record<string, ThreeNS.CanvasTexture> = {}

function glowTexture(T: Three, hex: number): ThreeNS.CanvasTexture {
  const key = `g${hex}`
  const hit = texCache[key]
  if (hit) return hit
  const cv = document.createElement('canvas')
  cv.width = cv.height = 64
  const ctx = cv.getContext('2d')!
  const gr = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  gr.addColorStop(0, css(hex))
  gr.addColorStop(0.35, css(hex))
  gr.addColorStop(1, 'rgba(11,31,59,0)')
  ctx.fillStyle = gr
  ctx.fillRect(0, 0, 64, 64)
  const tex = new T.CanvasTexture(cv)
  texCache[key] = tex
  return tex
}

function halo(T: Three, hex: number, size: number, opacity = 0.55): ThreeNS.Sprite {
  const s = new T.Sprite(
    new T.SpriteMaterial({
      map: glowTexture(T, hex),
      color: 0xffffff,
      transparent: true,
      opacity,
      blending: T.AdditiveBlending,
      depthWrite: false,
    })
  )
  s.scale.set(size, size, 1)
  return s
}

const lit = (T: Three, hex: number, intensity = 0.55): ThreeNS.MeshPhongMaterial =>
  new T.MeshPhongMaterial({ color: hex, emissive: hex, emissiveIntensity: intensity, shininess: 60 })

const traceMaterial = (T: Three, color: number, opacity = 0.9): ThreeNS.MeshBasicMaterial =>
  new T.MeshBasicMaterial({ color, transparent: true, opacity })

function lights(T: Three, S: ThreeNS.Scene): void {
  S.add(new T.AmbientLight(0xffffff, 0.55))
  const d = new T.DirectionalLight(0xffffff, 0.75)
  d.position.set(4, 6, 8)
  S.add(d)
  const p = new T.PointLight(C.bright, 0.6, 40)
  p.position.set(-6, 4, 10)
  S.add(p)
}

function roundRect(x: CanvasRenderingContext2D, l: number, t: number, w: number, h: number, r: number): void {
  x.beginPath()
  x.moveTo(l + r, t)
  x.arcTo(l + w, t, l + w, t + h, r)
  x.arcTo(l + w, t + h, l, t + h, r)
  x.arcTo(l, t + h, l, t, r)
  x.arcTo(l, t, l + w, t, r)
  x.closePath()
}

/** The job card, drawn once on a canvas and shared by the rail and map scenes. */
function jobCardTexture(T: Three): ThreeNS.CanvasTexture {
  const hit = texCache.job
  if (hit) return hit
  const cv = document.createElement('canvas')
  cv.width = 512
  cv.height = 320
  const x = cv.getContext('2d')!
  x.fillStyle = css(C.white)
  x.fillRect(0, 0, 512, 320)
  x.fillStyle = css(C.navy)
  x.fillRect(0, 0, 512, 78)
  x.fillStyle = css(C.white)
  x.font = '600 26px Poppins, Inter, sans-serif'
  x.fillText('Job card', 28, 48)
  x.fillStyle = css(C.bright)
  x.font = '500 26px "JetBrains Mono", monospace'
  x.fillText('JC-4F2A', 340, 48)
  x.fillStyle = css(C.muted)
  x.font = '500 16px "JetBrains Mono", monospace'
  x.fillText('PLATE', 28, 118)
  x.fillText('AMOUNT', 300, 118)
  x.fillStyle = css(C.navy)
  x.font = '500 30px "JetBrains Mono", monospace'
  x.fillText('RUH 4821', 28, 158)
  x.fillText('SAR 1,245.00', 300, 158)
  x.fillStyle = css(C.hairline)
  x.fillRect(28, 186, 456, 2)
  x.fillStyle = css(C.chip)
  roundRect(x, 28, 214, 178, 48, 24)
  x.fill()
  x.fillStyle = css(C.blue)
  x.font = '600 22px Poppins, Inter, sans-serif'
  x.fillText('In repair', 52, 246)
  x.fillStyle = css(C.orange)
  x.beginPath()
  x.arc(460, 238, 12, 0, 6.283)
  x.fill()
  x.fillStyle = css(C.muted)
  x.font = '400 18px Inter, sans-serif'
  x.fillText('Bay 3 · 09:40', 300, 246)
  const tex = new T.CanvasTexture(cv)
  tex.anisotropy = 4
  texCache.job = tex
  return tex
}

function labelTexture(T: Three, en: string, ar: string): ThreeNS.CanvasTexture {
  const cv = document.createElement('canvas')
  cv.width = 256
  cv.height = 96
  const x = cv.getContext('2d')!
  x.textAlign = 'center'
  x.fillStyle = 'rgba(11,31,59,.72)'
  roundRect(x, 8, 8, 240, 80, 14)
  x.fill()
  x.strokeStyle = 'rgba(11,179,255,.45)'
  x.lineWidth = 2
  x.stroke()
  x.fillStyle = css(C.white)
  x.font = '600 26px Inter, sans-serif'
  x.fillText(en, 128, 44)
  x.fillStyle = css(C.bandMuted)
  x.font = '500 24px "Noto Sans Arabic", sans-serif'
  x.fillText(ar, 128, 76)
  return new T.CanvasTexture(cv)
}

/** The job-card slab: a lit box wearing the card texture, inside a soft rim. */
function slab(T: Three, w: number, h: number): ThreeNS.Group {
  const g = new T.Group()
  const mats = [
    lit(T, C.blue, 0.5), lit(T, C.blue, 0.5), lit(T, C.blue, 0.5), lit(T, C.blue, 0.5),
    new T.MeshPhongMaterial({ map: jobCardTexture(T), shininess: 30 }),
    lit(T, C.navy, 0.2),
  ]
  g.add(new T.Mesh(new T.BoxGeometry(w, h, 0.12), mats))
  const rim = new T.Mesh(
    new T.PlaneGeometry(w * 1.12, h * 1.18),
    new T.MeshBasicMaterial({ color: C.bright, transparent: true, opacity: 0.22, blending: T.AdditiveBlending, depthWrite: false })
  )
  rim.position.z = -0.09
  g.add(rim)
  return g
}

/** The brand trace: horizontal, one 45-degree diagonal, horizontal. */
function rightAngle(T: Three, a: ThreeNS.Vector3, b: ThreeNS.Vector3): ThreeNS.CurvePath<ThreeNS.Vector3> {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const dz = b.z - a.z
  const diag = Math.min(Math.abs(dy), Math.abs(dx) * 0.6)
  const x1 = a.x + (dx - Math.sign(dx) * diag) * 0.5
  const p1 = new T.Vector3(x1, a.y, a.z + dz * 0.3)
  const p2 = new T.Vector3(x1 + Math.sign(dx) * diag, a.y + Math.sign(dy) * diag, a.z + dz * 0.7)
  const p3 = new T.Vector3(b.x, p2.y, b.z)
  const path = new T.CurvePath<ThreeNS.Vector3>()
  path.add(new T.LineCurve3(a, p1))
  path.add(new T.LineCurve3(p1, p2))
  path.add(new T.LineCurve3(p2, p3))
  if (Math.abs(p3.y - b.y) > 0.01) path.add(new T.LineCurve3(p3, b))
  return path
}

/** Draw-in for tube geometries: the drawn index range grows with k in 0..1. */
function drawTo(geo: ThreeNS.BufferGeometry, k: number): void {
  const n = geo.index ? geo.index.count : geo.attributes.position.count
  geo.setDrawRange(0, Math.floor(n * easeOut(k)))
}

/** Cheap hover: distance from the pointer ray to an object's world position. */
function hoverer(api: Api): (obj: ThreeNS.Object3D) => number {
  const T = api.T
  const rc = new T.Raycaster()
  const nd = new T.Vector2()
  const wp = new T.Vector3()
  return (obj) => {
    const r = api.el.getBoundingClientRect()
    nd.x = ((pointer.px - r.left) / r.width) * 2 - 1
    nd.y = -((pointer.py - r.top) / r.height) * 2 + 1
    if (nd.x < -1.2 || nd.x > 1.2 || nd.y < -1.2 || nd.y > 1.2) return 99
    rc.setFromCamera(nd, api.cam)
    obj.getWorldPosition(wp)
    return rc.ray.distanceToPoint(wp)
  }
}

// ── loading the runtime ─────────────────────────────────────────────────────

declare global {
  interface Window {
    THREE?: Three
  }
}

let loading: Promise<Three> | null = null

function loadThree(): Promise<Three> {
  if (window.THREE) return Promise.resolve(window.THREE)
  loading ??= new Promise<Three>((resolve, reject) => {
    const s = document.createElement('script')
    s.src = THREE_URL
    s.async = true
    s.crossOrigin = 'anonymous'
    s.onload = () => (window.THREE ? resolve(window.THREE) : reject(new Error('three loaded without a global')))
    s.onerror = () => reject(new Error(`three failed to load from ${THREE_URL}`))
    document.head.appendChild(s)
  })
  return loading
}

// ── the render loop ─────────────────────────────────────────────────────────

/** One renderer per scene, rendering only while the section is on screen and
 *  the tab is visible. Returns the teardown the caller must run on unmount —
 *  a leaked WebGL context is one of the few browser resources a page can
 *  actually exhaust. */
function stage(T: Three, el: HTMLElement, build: (api: Api) => Tick): () => void {
  const renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
  renderer.setClearColor(0x000000, 0)
  el.appendChild(renderer.domElement)

  const scene = new T.Scene()
  const cam = new T.PerspectiveCamera(42, 1, 0.1, 120)
  const api: Api = { T, scene, cam, el, renderer, w: 1, h: 1, t: 0, born: 0 }
  const tick = build(api)

  let visible = false
  let raf = 0
  let last = 0

  const size = (): void => {
    const w = el.clientWidth || 1
    const h = el.clientHeight || 1
    api.w = w
    api.h = h
    renderer.setSize(w, h, false)
    cam.aspect = w / h
    cam.updateProjectionMatrix()
  }

  const frame = (now: number): void => {
    raf = 0
    if (!visible || document.hidden) return
    const dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016
    last = now
    api.t += dt
    pointer.x += (pointer.tx - pointer.x) * 0.06
    pointer.y += (pointer.ty - pointer.y) * 0.06
    tick(dt, pointer)
    renderer.render(scene, cam)
    raf = requestAnimationFrame(frame)
  }

  const start = (): void => {
    if (raf || !visible || document.hidden) return
    last = 0
    raf = requestAnimationFrame(frame)
  }

  const host = el.parentElement ?? el
  const io = new IntersectionObserver(
    (entries) => {
      visible = entries[0]?.isIntersecting ?? false
      if (visible && !api.born) api.born = 1
      start()
    },
    { threshold: 0 }
  )
  io.observe(host)
  document.addEventListener('visibilitychange', start)
  host.classList.add('has-scene')

  let ro: ResizeObserver | null = null
  const canObserve = typeof ResizeObserver !== 'undefined'
  if (canObserve) {
    ro = new ResizeObserver(size)
    ro.observe(el)
  } else {
    window.addEventListener('resize', size)
  }
  size()

  return () => {
    if (raf) cancelAnimationFrame(raf)
    io.disconnect()
    ro?.disconnect()
    document.removeEventListener('visibilitychange', start)
    window.removeEventListener('resize', size)
    host.classList.remove('has-scene')
    scene.traverse((obj) => {
      const mesh = obj as Partial<ThreeNS.Mesh>
      mesh.geometry?.dispose()
      const mat = mesh.material
      if (Array.isArray(mat)) for (const m of mat) m.dispose()
      else mat?.dispose()
    })
    renderer.dispose()
    renderer.domElement.remove()
  }
}

// ── scene 1: the circuit constellation behind the hero ──────────────────────

type Constellation = ReturnType<typeof constellation>

function constellation(T: Three, g: ThreeNS.Group, spread: number, depth: number, dim: boolean, rnd: () => number) {
  const pts: ThreeNS.Vector3[] = []
  const cols = 9
  const rows = 5
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (rnd() < 0.2) continue
      pts.push(
        new T.Vector3(
          ((c - (cols - 1) / 2) * 5 + (rnd() - 0.5) * 2.2) * spread,
          ((r - (rows - 1) / 2) * 4.2 + (rnd() - 0.5) * 1.6) * spread,
          (rnd() - 0.5) * 10 + depth
        )
      )
    }
  }
  const colors = pts.map(() => (rnd() < 0.12 ? C.orange : rnd() < 0.5 ? C.bright : C.blue))
  const byCol = new Map<number, number[]>([[C.blue, []], [C.bright, []], [C.orange, []]])
  pts.forEach((_p, i) => byCol.get(colors[i]!)!.push(i))

  const inst: { mesh: ThreeNS.InstancedMesh; ids: number[] }[] = []
  const dummy = new T.Object3D()
  const sphere = new T.SphereGeometry(0.26, 14, 14)
  for (const [col, ids] of byCol) {
    if (!ids.length) continue
    const material = lit(T, col, dim ? 0.35 : 0.7)
    if (dim) {
      material.transparent = true
      material.opacity = 0.55
    }
    const m = new T.InstancedMesh(sphere, material, ids.length)
    ids.forEach((id, k) => {
      dummy.position.copy(pts[id]!)
      dummy.scale.setScalar(0.001)
      dummy.updateMatrix()
      m.setMatrixAt(k, dummy.matrix)
    })
    g.add(m)
    inst.push({ mesh: m, ids })
  }

  const halos = pts.map((p, i) => {
    const s = halo(T, colors[i]!, dim ? 1.6 : 2.2, dim ? 0.25 : 0.5)
    s.position.copy(p)
    s.scale.setScalar(0.001)
    g.add(s)
    return s
  })

  const paths: ThreeNS.CurvePath<ThreeNS.Vector3>[] = []
  const tubes: ThreeNS.BufferGeometry[] = []
  const used = new Set<string>()
  pts.forEach((p, i) => {
    const best: [number, number][] = []
    pts.forEach((q, j) => {
      if (i !== j) best.push([p.distanceTo(q), j])
    })
    best.sort((u, v) => u[0] - v[0])
    for (let k = 0; k < 2 && k < best.length; k++) {
      const [d, j] = best[k]!
      const key = `${Math.min(i, j)}:${Math.max(i, j)}`
      if (used.has(key) || d > 9 * spread) continue
      used.add(key)
      const path = rightAngle(T, p, pts[j]!)
      const geo = new T.TubeGeometry(path, 24, dim ? 0.045 : 0.06, 5, false)
      geo.setDrawRange(0, 0)
      const tube = new T.Mesh(geo, traceMaterial(T, rnd() < 0.15 ? C.orange : rnd() < 0.5 ? C.bright : C.blue, dim ? 0.45 : 0.9))
      g.add(tube)
      paths.push(path)
      tubes.push(geo)
    }
  })

  return { pts, n: pts.length, inst, halos, paths, tubes, dummy }
}

function hero(api: Api): Tick {
  const T = api.T
  const S = api.scene
  api.cam.position.set(0, 0, 30)
  S.fog = new T.Fog(C.navy, 22, 60)
  lights(T, S)

  const near = new T.Group()
  const far = new T.Group()
  S.add(far)
  S.add(near)
  const A = constellation(T, near, 1, 0, false, seeded(7))
  const B = constellation(T, far, 1.7, -16, true, seeded(11))

  // Particles with three trailing points each, vertex colours fading along the trail.
  const paths = A.paths
  const N = Math.min(70, paths.length * 2)
  const TR = 4
  const pos = new Float32Array(N * TR * 3)
  const col = new Float32Array(N * TR * 3)
  const state: { p: ThreeNS.CurvePath<ThreeNS.Vector3>; t: number; v: number }[] = []
  const rnd = seeded(3)
  for (let i = 0; i < N; i++) {
    state.push({ p: paths[i % paths.length]!, t: rnd(), v: 0.06 + rnd() * 0.08 })
    for (let k = 0; k < TR; k++) {
      const f = 1 - k / TR
      col[(i * TR + k) * 3] = f
      col[(i * TR + k) * 3 + 1] = f
      col[(i * TR + k) * 3 + 2] = f
    }
  }
  const geo = new T.BufferGeometry()
  geo.setAttribute('position', new T.BufferAttribute(pos, 3))
  geo.setAttribute('color', new T.BufferAttribute(col, 3))
  near.add(
    new T.Points(
      geo,
      new T.PointsMaterial({
        map: glowTexture(T, C.white), vertexColors: true, size: 0.55, transparent: true,
        opacity: 0.95, blending: T.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
      })
    )
  )

  const tmp = new T.Vector3()
  let age = 0
  const dist = hoverer(api)
  const probe = new T.Object3D()
  let camZ = 30
  let camYaw = 0

  const grow = (K: Constellation, at: number, delayMul: number): void => {
    for (const it of K.inst) {
      it.ids.forEach((id, k) => {
        let s = easeOut((at - id * 0.02 * delayMul) / 0.5)
        if (s <= 0) s = 0.001
        K.dummy.position.copy(K.pts[id]!)
        K.dummy.scale.setScalar(s)
        K.dummy.updateMatrix()
        it.mesh.setMatrixAt(k, K.dummy.matrix)
      })
      it.mesh.instanceMatrix.needsUpdate = true
    }
    K.halos.forEach((h, i) => {
      const s = easeOut((at - i * 0.02 * delayMul) / 0.5)
      h.scale.setScalar(Math.max(0.001, s) * (K === A ? 2.2 : 1.6))
    })
    K.tubes.forEach((t, i) => drawTo(t, (at - 0.25 - i * 0.03 * delayMul) / 0.7))
  }

  return (dt, ptr) => {
    if (age < 3) {
      age += dt
      grow(A, age, 1)
      grow(B, age - 0.3, 0.8)
    }
    for (let i = 0; i < N; i++) {
      const s = state[i]!
      s.t += s.v * dt
      if (s.t > 1) {
        s.t = 0
        s.p = paths[Math.floor(rnd() * paths.length)]!
      }
      for (let k = 0; k < TR; k++) {
        // `CurvePath.getPoint` returns a fresh vector and ignores any target
        // argument — unlike the concrete curves, which fill one. The artifact
        // passed `tmp` here and then read it, so its hero trail particles all
        // sat at the origin. Copying the return value is the fix.
        tmp.copy(s.p.getPoint(Math.max(0, s.t - k * 0.012)))
        const o = (i * TR + k) * 3
        pos[o] = tmp.x
        pos[o + 1] = tmp.y
        pos[o + 2] = tmp.z
      }
    }
    geo.attributes.position.needsUpdate = true

    // Halos near the pointer swell.
    if (age > 1.5) {
      for (let j = 0; j < A.n; j++) {
        probe.position.copy(A.pts[j]!)
        near.localToWorld(probe.position)
        const target = dist(probe) < 2.4 ? 3.6 : 2.2
        const h = A.halos[j]!
        h.scale.setScalar(h.scale.x + (target - h.scale.x) * 0.12)
      }
    }

    const dir = isRtl() ? -1 : 1
    near.scale.x = dir
    far.scale.x = dir
    near.rotation.y += (ptr.x * 0.16 * dir + Math.sin(api.t * 0.15) * 0.05 - near.rotation.y) * 0.05
    near.rotation.x += (-ptr.y * 0.1 + Math.sin(api.t * 0.11) * 0.03 - near.rotation.x) * 0.05
    far.rotation.y = near.rotation.y * 0.45
    far.rotation.x = near.rotation.x * 0.45
    near.position.y = Math.sin(api.t * 0.3) * 0.5
    far.position.y = near.position.y * 0.4
    near.position.x = dir * 3 + Math.cos(api.t * 0.2) * 0.4
    far.position.x = dir * 1.2

    // Scroll: a slow dolly in and a few degrees of yaw.
    const k = Math.min(1, scrollY / 700)
    camZ += (30 - k * 3.5 - camZ) * 0.05
    camYaw += (k * 0.06 * dir - camYaw) * 0.05
    api.cam.position.set(Math.sin(camYaw) * camZ, k * -1.2, Math.cos(camYaw) * camZ)
    api.cam.lookAt(0, 0, 0)
  }
}

// ── scene 2: the six-stage rail in depth, driven by scroll ──────────────────

function rail(api: Api): Tick {
  const T = api.T
  const S = api.scene
  const el = api.el
  lights(T, S)
  const camTarget = new T.Vector3(0, 0.35, 0)
  const camLook = new T.Vector3(0, 0.35, 0)
  api.cam.position.set(0, 2.6, 7.4)
  api.cam.lookAt(camLook)

  const g = new T.Group()
  S.add(g)
  const stagesEl = (el.parentElement ?? el).querySelectorAll<HTMLElement>('.rail6 a')
  const n = stagesEl.length || 6
  const pts: ThreeNS.Vector3[] = []
  for (let i = 0; i < n; i++) {
    pts.push(new T.Vector3((i - (n - 1) / 2) * 4.2, 0, Math.sin((i / (n - 1)) * Math.PI) * 2.4 - 1.2))
  }
  const curve = new T.CatmullRomCurve3(pts, false, 'catmullrom', 0.4)
  const tubeGeo = new T.TubeGeometry(curve, 120, 0.07, 7, false)
  tubeGeo.setDrawRange(0, 0)
  g.add(new T.Mesh(tubeGeo, lit(T, C.blue, 0.6)))
  const glowGeo = new T.TubeGeometry(curve, 60, 0.16, 6, false)
  glowGeo.setDrawRange(0, 0)
  g.add(
    new T.Mesh(glowGeo, new T.MeshBasicMaterial({ color: C.bright, transparent: true, opacity: 0.16, blending: T.AdditiveBlending, depthWrite: false }))
  )

  const ringGeo = new T.TorusGeometry(0.46, 0.07, 8, 32)
  const nodeGeo = new T.SphereGeometry(0.3, 16, 16)
  const nodes = pts.map((p, i) => {
    const col = i === n - 1 ? C.orange : i === n - 2 ? C.bright : C.blue
    const m = new T.Mesh(nodeGeo, lit(T, col, 0.7))
    m.position.copy(p)
    m.scale.setScalar(0.001)
    g.add(m)
    const h = halo(T, col, 2.0, 0.45)
    h.position.copy(p)
    g.add(h)
    const ring = new T.Mesh(ringGeo, new T.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.3 }))
    ring.position.copy(p)
    ring.rotation.x = Math.PI / 2
    g.add(ring)
    const pulse = new T.Mesh(
      ringGeo,
      new T.MeshBasicMaterial({ color: col, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false })
    )
    pulse.position.copy(p)
    pulse.rotation.x = Math.PI / 2
    g.add(pulse)
    return { m, ring, pulse, pt: 9 }
  })

  const token = slab(T, 2.0, 1.25)
  g.add(token)

  const driver = (el.dataset.driver ? document.querySelector(el.dataset.driver) : null) ?? el.parentElement ?? el
  let prog = 0
  let target = 0
  let active = -1
  const tangent = new T.Vector3()
  const at = new T.Vector3()
  let age = 0

  const progress = (): void => {
    const r = driver.getBoundingClientRect()
    const vh = window.innerHeight
    target = Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (r.height + vh * 0.35)))
  }
  window.addEventListener('scroll', progress, { passive: true })
  progress()

  return (dt, ptr) => {
    if (age < 3) {
      age += dt
      drawTo(tubeGeo, age / 1.4)
      drawTo(glowGeo, age / 1.4)
      nodes.forEach((nd, i) => nd.m.scale.setScalar(Math.max(0.001, easeOut((age - 0.2 - i * 0.18) / 0.5))))
    }
    prog += (target - prog) * 0.08
    const p = Math.max(0.001, Math.min(0.999, prog))
    curve.getPointAt(p, at)
    curve.getTangentAt(p, tangent)
    token.position.set(at.x, at.y + 1.1 + Math.sin(api.t * 2) * 0.06, at.z)
    token.rotation.y = Math.atan2(tangent.x, tangent.z) - Math.PI / 2 + ptr.x * 0.15
    token.rotation.x = -0.18 + ptr.y * 0.08
    token.rotation.z = -tangent.z * 0.3

    const idx = Math.round(p * (n - 1))
    if (idx !== active) {
      active = idx
      for (let i = 0; i < stagesEl.length; i++) stagesEl[i]!.classList.toggle('is-active', i === idx)
      nodes.forEach((nd, i) => {
        if (i === idx) nd.pt = 0
      })
    }
    nodes.forEach((nd, i) => {
      const want = i === idx ? 1.45 : 1
      nd.m.scale.setScalar(nd.m.scale.x + (want - nd.m.scale.x) * 0.1)
      const mat = nd.pulse.material as ThreeNS.MeshBasicMaterial
      if (nd.pt < 0.7) {
        nd.pt += dt
        const k = nd.pt / 0.7
        nd.pulse.scale.setScalar(1 + k * 1.6)
        mat.opacity = (1 - k) * 0.9
      } else {
        mat.opacity = 0
      }
    })

    camTarget.set(at.x * 0.35, 0.35, 0)
    camLook.lerp(camTarget, 0.05)
    api.cam.position.x += (at.x * 0.3 - api.cam.position.x) * 0.05
    api.cam.lookAt(camLook)
    g.scale.x = isRtl() ? -1 : 1
    g.rotation.y += (ptr.x * 0.05 - g.rotation.y) * 0.05
  }
}

// ── scene 3: the region as a dotted map ─────────────────────────────────────

function map(api: Api): Tick {
  const T = api.T
  const S = api.scene
  const el = api.el
  const cx = 45
  const cy = 26
  const k = 0.34
  const X = (lon: number): number => (lon - cx) * k
  const Y = (lat: number): number => (lat - cy) * k

  const inside = (poly: readonly (readonly [number, number])[], x: number, y: number): boolean => {
    let r = false
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i]!
      const [xj, yj] = poly[j]!
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) r = !r
    }
    return r
  }
  const land = (lon: number, lat: number): boolean => MAP_POLYS.some((p) => inside(p, lon, lat))

  lights(T, S)
  api.cam.position.set(0, 0.6, 17)
  api.cam.lookAt(0, 0, 0)
  S.fog = new T.Fog(C.navy, 16, 34)
  const mapG = new T.Group()
  S.add(mapG)
  mapG.rotation.x = -0.3

  // Two dot tones: coast dots (any neighbour is sea) read the outline; inner dots fill.
  const coast: number[] = []
  const inner: number[] = []
  for (let lat = 12; lat <= 38; lat += MAP_STEP) {
    for (let lon = 24; lon <= 62; lon += MAP_STEP) {
      if (!land(lon, lat)) continue
      const edge =
        !land(lon + MAP_STEP, lat) || !land(lon - MAP_STEP, lat) || !land(lon, lat + MAP_STEP) || !land(lon, lat - MAP_STEP)
      ;(edge ? coast : inner).push(X(lon), Y(lat), 0)
    }
  }
  const cloud = (arr: number[], color: number, size: number, opacity: number): void => {
    const gg = new T.BufferGeometry()
    gg.setAttribute('position', new T.BufferAttribute(new Float32Array(arr), 3))
    mapG.add(
      new T.Points(
        gg,
        new T.PointsMaterial({ color, map: glowTexture(T, color), size, transparent: true, opacity, sizeAttenuation: true, depthWrite: false })
      )
    )
  }
  cloud(inner, C.blue, 0.26, 0.6)
  cloud(coast, C.bright, 0.34, 0.95)

  // A faint grid under the map, vignetted toward the edges.
  const gcv = document.createElement('canvas')
  gcv.width = gcv.height = 512
  const gx = gcv.getContext('2d')!
  gx.strokeStyle = 'rgba(11,179,255,.35)'
  gx.lineWidth = 1
  for (let i = 0; i <= 512; i += 32) {
    gx.beginPath()
    gx.moveTo(i, 0)
    gx.lineTo(i, 512)
    gx.stroke()
    gx.beginPath()
    gx.moveTo(0, i)
    gx.lineTo(512, i)
    gx.stroke()
  }
  const rg = gx.createRadialGradient(256, 256, 60, 256, 256, 256)
  rg.addColorStop(0, 'rgba(11,31,59,0)')
  rg.addColorStop(1, 'rgba(11,31,59,1)')
  gx.fillStyle = rg
  gx.fillRect(0, 0, 512, 512)
  const grid = new T.Mesh(
    new T.PlaneGeometry(22, 22),
    new T.MeshBasicMaterial({ map: new T.CanvasTexture(gcv), transparent: true, opacity: 0.4, blending: T.AdditiveBlending, depthWrite: false })
  )
  grid.position.z = -0.25
  mapG.add(grid)

  type Node = {
    v: ThreeNS.Vector3
    ring: CityRing
    mesh: ThreeNS.Mesh
    halo: ThreeNS.Sprite
    label: ThreeNS.Sprite | null
    base: number
  }
  const byName = new Map<string, Node>()
  const nodes: Node[] = []
  const nodeGeo = new T.SphereGeometry(0.17, 12, 12)
  MAP_CITIES.forEach((c, ci) => {
    const v = new T.Vector3(X(c.lon), Y(c.lat), 0.04)
    const col = c.ring === 0 ? C.orange : c.ring === 3 ? C.bright : C.blue
    const material = lit(T, col, 0.7)
    material.transparent = true
    material.opacity = c.ring === 0 ? 1 : 0.15
    const mesh = new T.Mesh(nodeGeo, material)
    mesh.position.copy(v)
    mesh.scale.setScalar(c.ring === 0 ? 1.7 : 0.8)
    mapG.add(mesh)
    const h = halo(T, col, c.ring === 0 ? 3.2 : 2.2, c.ring === 0 ? 0.7 : 0)
    h.position.copy(v)
    mapG.add(h)
    let label: ThreeNS.Sprite | null = null
    if (c.ring < 3) {
      label = new T.Sprite(
        new T.SpriteMaterial({ map: labelTexture(T, EN[c.id] ?? c.id, AR[c.id] ?? ''), transparent: true, opacity: c.ring === 0 ? 1 : 0, depthWrite: false })
      )
      label.scale.set(1.7, 0.64, 1)
      label.position.set(v.x, v.y + (ci % 2 ? -0.62 : 0.62), 0.4)
      mapG.add(label)
    }
    const node: Node = { v, ring: c.ring, mesh, halo: h, label, base: c.ring === 0 ? 3.2 : 2.2 }
    byName.set(c.id, node)
    nodes.push(node)
  })

  // Arcs above the map, revealed by draw range when their ring lights.
  type Trace = { ring: CityRing; mat: ThreeNS.MeshBasicMaterial; geo: ThreeNS.BufferGeometry; max: number; path: ThreeNS.QuadraticBezierCurve3; k: number }
  const traces: Trace[] = []
  const mid = new T.Vector3()
  for (const [from, to] of MAP_LINKS) {
    const a = byName.get(from)
    const b = byName.get(to)
    if (!a || !b) continue
    mid.addVectors(a.v, b.v).multiplyScalar(0.5)
    mid.z = a.v.distanceTo(b.v) * 0.32 + 0.2
    const path = new T.QuadraticBezierCurve3(a.v.clone(), mid.clone(), b.v.clone())
    const geo = new T.TubeGeometry(path, 28, 0.035, 5, false)
    geo.setDrawRange(0, 0)
    const mat = traceMaterial(T, b.ring === 1 ? C.orange : C.bright, 0)
    mapG.add(new T.Mesh(geo, mat))
    traces.push({ ring: b.ring, mat, geo, max: b.ring === 3 ? 0.4 : 0.9, path, k: 0 })
  }

  const N = 70
  const pos = new Float32Array(N * 3)
  const state: { i: number; t: number; v: number }[] = []
  const tmp = new T.Vector3()
  const rnd = seeded(5)
  for (let i = 0; i < N; i++) state.push({ i: i % Math.max(1, traces.length), t: rnd(), v: 0.1 + rnd() * 0.12 })
  const dg = new T.BufferGeometry()
  dg.setAttribute('position', new T.BufferAttribute(pos, 3))
  mapG.add(
    new T.Points(
      dg,
      new T.PointsMaterial({ color: C.white, map: glowTexture(T, C.white), size: 0.36, transparent: true, opacity: 0.95, blending: T.AdditiveBlending, depthWrite: false })
    )
  )

  // The job card in front, with three capability nodes orbiting and tethered to it.
  const orbit = new T.Group()
  S.add(orbit)
  const card = slab(T, 2.1, 1.3)
  card.scale.setScalar(0.001)
  orbit.add(card)
  const orbs = [C.bright, C.blue, C.orange].map((col) => {
    const m = new T.Mesh(new T.SphereGeometry(0.14, 12, 12), lit(T, col, 0.8))
    orbit.add(m)
    m.add(halo(T, col, 1.4, 0.6))
    const lg = new T.BufferGeometry()
    lg.setAttribute('position', new T.BufferAttribute(new Float32Array(6), 3))
    const line = new T.Line(lg, new T.LineBasicMaterial({ color: col, transparent: true, opacity: 0.2 }))
    orbit.add(line)
    return { m, line, arr: lg.attributes.position.array as Float32Array, geo: lg }
  })
  orbit.add(new T.Mesh(new T.TorusGeometry(1.6, 0.012, 6, 90), new T.MeshBasicMaterial({ color: C.bright, transparent: true, opacity: 0.35 })))

  const driver =
    (el.dataset.driver ? document.querySelector(el.dataset.driver) : null) ?? el.closest('section') ?? el.parentElement ?? el
  let target = 0
  let prog = 0
  let age = 0
  const dist = hoverer(api)
  const progress = (): void => {
    const r = driver.getBoundingClientRect()
    target = Math.max(0, Math.min(1, (window.innerHeight * 0.95 - r.top) / (r.height * 0.9)))
  }
  window.addEventListener('scroll', progress, { passive: true })
  progress()
  const ringAt = [0, 0.22, 0.5, 0.78]

  return (dt, ptr) => {
    age += dt
    prog += (target - prog) * 0.06
    const halfH = api.cam.position.z * Math.tan(0.3665)
    const halfW = halfH * (api.w / api.h)
    const side = isRtl() ? -1 : 1
    mapG.position.x = -side * halfW * 0.18
    mapG.position.y = 0.2
    orbit.position.set(side * halfW * 0.58, 0.1, 3)
    orbit.rotation.x = 0.95
    orbit.rotation.z = -0.25 * side

    const cs = easeOut((age - 1.6) / 0.6)
    card.scale.setScalar(Math.max(0.001, cs))
    card.rotation.x = -0.95
    card.rotation.z = 0.25 * side
    card.position.y = Math.sin(api.t * 1.5) * 0.08

    const a = api.t * 0.55
    orbs.forEach((o, i) => {
      const ang = a + i * 2.094
      o.m.position.set(Math.cos(ang) * 1.6, Math.sin(ang) * 1.6, 0)
      o.arr[0] = o.m.position.x
      o.arr[1] = o.m.position.y
      o.arr[2] = 0
      o.geo.attributes.position.needsUpdate = true
      ;(o.line.material as ThreeNS.LineBasicMaterial).opacity = 0.12 + 0.55 * Math.max(0, -Math.sin(ang)) * cs
    })

    for (const n of nodes) {
      const on = prog >= ringAt[n.ring]! ? 1 : 0
      const o = n.ring === 3 ? 0.55 : 1
      const meshMat = n.mesh.material as ThreeNS.MeshPhongMaterial
      meshMat.opacity += ((on ? o : 0.15) - meshMat.opacity) * 0.08
      const sc = on ? (n.ring === 0 ? 1.7 : 1.15) : 0.8
      n.mesh.scale.setScalar(n.mesh.scale.x + (sc - n.mesh.scale.x) * 0.08)
      n.halo.material.opacity += ((on ? (n.ring === 0 ? 0.7 : 0.45) : 0) - n.halo.material.opacity) * 0.08
      if (n.label) n.label.material.opacity += ((on ? 1 : 0) - n.label.material.opacity) * 0.08
      let hs = n.base
      if (on && dist(n.mesh) < 1.6) hs = n.base * 1.8
      if (n.ring === 0) hs *= 1 + Math.sin(api.t * 2) * 0.1
      n.halo.scale.setScalar(n.halo.scale.x + (hs - n.halo.scale.x) * 0.15)
    }

    for (const tr of traces) {
      const on = prog >= ringAt[tr.ring]!
      tr.k += ((on ? 1 : 0) - tr.k) * 0.06
      drawTo(tr.geo, tr.k * 1.05)
      tr.mat.opacity += ((on ? tr.max : 0) - tr.mat.opacity) * 0.06
    }

    for (let i = 0; i < N; i++) {
      const s = state[i]!
      const tr = traces[s.i]
      if (!tr || tr.k < 0.6) {
        pos[i * 3 + 2] = -50
        continue
      }
      s.t += s.v * dt
      if (s.t > 1) {
        s.t = 0
        s.i = Math.floor(rnd() * traces.length)
      }
      tr.path.getPoint(s.t, tmp)
      pos[i * 3] = tmp.x
      pos[i * 3 + 1] = tmp.y
      pos[i * 3 + 2] = tmp.z + 0.05
    }
    dg.attributes.position.needsUpdate = true

    mapG.rotation.y += (ptr.x * 0.08 - mapG.rotation.y) * 0.05
    mapG.rotation.x += (-0.3 - ptr.y * 0.05 - mapG.rotation.x) * 0.05
  }
}

// ── entry point ─────────────────────────────────────────────────────────────

const BUILDERS: Record<string, (api: Api) => Tick> = { hero, rail, map }

/** Wire every `.scene[data-scene]` inside `root`, loading Three only when one
 *  of them comes near the viewport. Returns the teardown for the caller's
 *  effect; calling it stops every loop and disposes every GL context. */
export function initLandingScenes(root: HTMLElement): () => void {
  const containers = [...root.querySelectorAll<HTMLElement>('.scene[data-scene]')]
  if (!containers.length) return () => {}

  // The same three gates the artifact applies. Below any of them the static
  // fallbacks in the markup are the design, not a degraded version of it.
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  if (reduce || window.innerWidth < 860 || !('IntersectionObserver' in window) || !hasWebGL()) {
    return () => {}
  }

  const onPointer = (e: PointerEvent): void => {
    pointer.px = e.clientX
    pointer.py = e.clientY
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1
    pointer.ty = (e.clientY / window.innerHeight) * 2 - 1
  }
  const onScroll = (): void => {
    scrollY = window.scrollY || document.documentElement.scrollTop
  }
  window.addEventListener('pointermove', onPointer, { passive: true })
  window.addEventListener('scroll', onScroll, { passive: true })

  let disposed = false
  const teardowns: (() => void)[] = []

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const el = (entry.target as HTMLElement & { _scene?: HTMLElement })._scene
        io.unobserve(entry.target)
        if (!el || el.dataset.live) continue
        const build = BUILDERS[el.dataset.scene ?? '']
        if (!build) continue
        el.dataset.live = '1'
        loadThree()
          .then((T) => {
            // The effect may have torn down while the script was in flight.
            if (disposed) return
            teardowns.push(stage(T, el, build))
          })
          .catch(() => {
            // The static fallback is already on screen; leave it there.
            delete el.dataset.live
          })
      }
    },
    { rootMargin: '100% 0px' }
  )
  for (const el of containers) {
    const host = (el.parentElement ?? el) as HTMLElement & { _scene?: HTMLElement }
    host._scene = el
    io.observe(host)
  }

  return () => {
    disposed = true
    io.disconnect()
    window.removeEventListener('pointermove', onPointer)
    window.removeEventListener('scroll', onScroll)
    for (const teardown of teardowns) teardown()
    for (const el of containers) delete el.dataset.live
  }
}
