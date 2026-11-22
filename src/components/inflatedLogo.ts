import {
  ACESFilmicToneMapping,
  BufferAttribute,
  BufferGeometry,
  Color,
  DataTexture,
  DataUtils,
  Group,
  HalfFloatType,
  LinearFilter,
  Mesh,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  PMREMGenerator,
  RGBAFormat,
  Scene,
  Vector4,
  WebGLRenderer,
} from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

/**
 * Logo metálico inflado en 3D.
 *
 * La forma sale del canal alfa del propio logo: se calcula la distancia de cada píxel al borde
 * y se convierte en un relieve redondeado (perfil circular) por delante y por detrás, como un globo
 * de foil. No hay modelos ni texturas extra que descargar.
 *
 * `state.pressure`: 0 (plano y pequeño) → .8 (hinchado) → 1 (a punto de reventar).
 * `state.burst`:    0 (entero) → 1.2 (todos los fragmentos ya han salido de pantalla).
 */
export interface InflatedLogoState { pressure: number; burst: number }

export interface InflatedLogo {
  state: InflatedLogoState
  /** Valor de `state.burst` con el que ya han salido todos los fragmentos. */
  burstEnd: number
  render(seconds: number): void
  dispose(): void
}

const GRID = 4
const PAD = 10
const SHARDS = 26
const LOGO_CENTER_Y = .44
const BURST_SPREAD = .09
const BASE_COLOR = 0x2b63ad

const INF = 1e20

function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Transformada de distancia euclídea 1D (Felzenszwalb & Huttenlocher). */
function edt1d(f: Float32Array, n: number, out: Float32Array, v: Int32Array, z: Float32Array) {
  let k = 0
  v[0] = 0
  z[0] = -INF
  z[1] = INF
  for (let q = 1; q < n; q += 1) {
    let s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k])
    while (s <= z[k]) {
      k -= 1
      s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k])
    }
    k += 1
    v[k] = q
    z[k] = s
    z[k + 1] = INF
  }
  k = 0
  for (let q = 0; q < n; q += 1) {
    while (z[k + 1] < q) k += 1
    out[q] = (q - v[k]) * (q - v[k]) + f[v[k]]
  }
}

/** Distancia (en px) de cada píxel interior al borde más cercano. */
function insideDistance(inside: Uint8Array, w: number, h: number) {
  const size = Math.max(w, h)
  const f = new Float32Array(size)
  const d = new Float32Array(size)
  const v = new Int32Array(size)
  const z = new Float32Array(size + 1)
  const grid = new Float32Array(w * h)

  for (let i = 0; i < grid.length; i += 1) grid[i] = inside[i] ? INF : 0
  for (let x = 0; x < w; x += 1) {
    for (let y = 0; y < h; y += 1) f[y] = grid[y * w + x]
    edt1d(f, h, d, v, z)
    for (let y = 0; y < h; y += 1) grid[y * w + x] = d[y]
  }
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) f[x] = grid[y * w + x]
    edt1d(f, w, d, v, z)
    for (let x = 0; x < w; x += 1) grid[y * w + x] = Math.sqrt(d[x])
  }
  return grid
}

function boxBlur(src: Float32Array, w: number, h: number, radius: number) {
  const tmp = new Float32Array(src.length)
  const out = new Float32Array(src.length)
  const span = radius * 2 + 1
  for (let y = 0; y < h; y += 1) {
    let sum = 0
    for (let x = -radius; x <= radius; x += 1) sum += src[y * w + Math.min(Math.max(x, 0), w - 1)]
    for (let x = 0; x < w; x += 1) {
      tmp[y * w + x] = sum / span
      sum += src[y * w + Math.min(x + radius + 1, w - 1)] - src[y * w + Math.max(x - radius, 0)]
    }
  }
  for (let x = 0; x < w; x += 1) {
    let sum = 0
    for (let y = -radius; y <= radius; y += 1) sum += tmp[Math.min(Math.max(y, 0), h - 1) * w + x]
    for (let y = 0; y < h; y += 1) {
      out[y * w + x] = sum / span
      sum += tmp[Math.min(y + radius + 1, h - 1) * w + x] - tmp[Math.max(y - radius, 0) * w + x]
    }
  }
  return out
}

function buildShape(artwork: HTMLImageElement) {
  const sourceWidth = artwork.naturalWidth
  const sourceHeight = artwork.naturalHeight
  const w = sourceWidth + PAD * 2
  const h = sourceHeight + PAD * 2

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('2d context unavailable')
  context.drawImage(artwork, PAD, PAD, sourceWidth, sourceHeight)
  const pixels = context.getImageData(0, 0, w, h).data

  const alpha = new Uint8Array(w * h)
  const inside = new Uint8Array(w * h)
  for (let i = 0; i < alpha.length; i += 1) {
    alpha[i] = pixels[i * 4 + 3]
    inside[i] = alpha[i] > 127 ? 1 : 0
  }

  // Relieve: perfil circular según la distancia al borde. Los trazos finos quedan como tubos
  // redondeados y las zonas anchas (el punto, el aro de la «o») como cúpulas.
  const radius = sourceWidth * .075
  const distance = insideDistance(inside, w, h)
  const raw = new Float32Array(w * h)
  for (let i = 0; i < raw.length; i += 1) {
    if (!inside[i]) continue
    const d = Math.max(distance[i] - .5 - 1, 0)
    const t = Math.min(d / radius, 1)
    raw[i] = radius * Math.sqrt(1 - (1 - t) * (1 - t))
  }
  const height = boxBlur(boxBlur(boxBlur(raw, w, h, 4), w, h, 4), w, h, 3)

  const at = (x: number, y: number) => height[Math.min(Math.max(y, 0), h - 1) * w + Math.min(Math.max(x, 0), w - 1)]

  return { w, h, alpha, inside, height, at, sourceWidth, sourceHeight }
}

function buildGeometry(shape: ReturnType<typeof buildShape>) {
  const { w, h, alpha, inside, at } = shape
  const columns = Math.floor((w - 1) / GRID)
  const rows = Math.floor((h - 1) / GRID)

  const cells: [number, number][] = []
  for (let j = 0; j < rows; j += 1) {
    for (let i = 0; i < columns; i += 1) {
      let seen = false
      for (let y = j * GRID; y <= (j + 1) * GRID && !seen; y += 1) {
        for (let x = i * GRID; x <= (i + 1) * GRID; x += 1) {
          if (alpha[y * w + x] > 40) { seen = true; break }
        }
      }
      if (seen) cells.push([i, j])
    }
  }

  // Fragmentos: semillas repartidas por el interior con una distancia mínima entre ellas.
  const random = mulberry32(11)
  const interior: number[] = []
  for (let i = 0; i < inside.length; i += 7) if (inside[i]) interior.push(i)
  const seeds: { x: number; y: number }[] = []
  const minGap = shape.sourceWidth * .085
  for (let tries = 0; tries < 4000 && seeds.length < SHARDS; tries += 1) {
    const index = interior[Math.floor(random() * interior.length)]
    const x = index % w
    const y = Math.floor(index / w)
    const gap = minGap * (1 - tries / 6000)
    if (seeds.every(seed => Math.hypot(seed.x - x, seed.y - y) > gap)) seeds.push({ x, y })
  }
  while (seeds.length < SHARDS) seeds.push(seeds[seeds.length % Math.max(seeds.length, 1)] ?? { x: w / 2, y: h / 2 })

  const toWorldX = (x: number) => x - w / 2
  const toWorldY = (y: number) => h / 2 - y
  const centerX = toWorldX(w / 2)
  const centerY = toWorldY(h / 2)

  const triangleCount = cells.length * 4
  const position = new Float32Array(triangleCount * 9)
  const shapeAttribute = new Float32Array(triangleCount * 12)
  const maskUv = new Float32Array(triangleCount * 6)
  const shardAttribute = new Float32Array(triangleCount * 3)

  let cursor = 0
  const corner = (i: number, j: number) => {
    const x = Math.min(i * GRID, w - 1)
    const y = Math.min(j * GRID, h - 1)
    return {
      x, y, height: at(x, y),
      gx: (at(x + 2, y) - at(x - 2, y)) / 4,
      gy: -(at(x, y + 2) - at(x, y - 2)) / 4,
    }
  }
  const nearestSeed = (x: number, y: number) => {
    let best = 0
    let bestDistance = Infinity
    for (let s = 0; s < seeds.length; s += 1) {
      const d = (seeds[s].x - x) ** 2 + (seeds[s].y - y) ** 2
      if (d < bestDistance) { bestDistance = d; best = s }
    }
    return best
  }

  for (const [i, j] of cells) {
    const tl = corner(i, j)
    const tr = corner(i + 1, j)
    const bl = corner(i, j + 1)
    const br = corner(i + 1, j + 1)
    const triangles = [
      [tl, bl, br, 1], [tl, br, tr, 1],
      [tl, br, bl, -1], [tl, tr, br, -1],
    ] as const
    for (const [a, b, c, side] of triangles) {
      const shard = nearestSeed((a.x + b.x + c.x) / 3, (a.y + b.y + c.y) / 3)
      for (const vertex of [a, b, c]) {
        position[cursor * 3] = toWorldX(vertex.x)
        position[cursor * 3 + 1] = toWorldY(vertex.y)
        shapeAttribute[cursor * 4] = vertex.height
        shapeAttribute[cursor * 4 + 1] = vertex.gx
        shapeAttribute[cursor * 4 + 2] = vertex.gy
        shapeAttribute[cursor * 4 + 3] = side
        maskUv[cursor * 2] = (vertex.x + .5) / w
        maskUv[cursor * 2 + 1] = (vertex.y + .5) / h
        shardAttribute[cursor] = shard
        cursor += 1
      }
    }
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(position, 3))
  geometry.setAttribute('aShape', new BufferAttribute(shapeAttribute, 4))
  geometry.setAttribute('aMaskUv', new BufferAttribute(maskUv, 2))
  geometry.setAttribute('aShard', new BufferAttribute(shardAttribute, 1))
  // Parámetros por fragmento. Salen disparados desde el centro, hacia la cámara y girando.
  const shardA: Vector4[] = []
  const shardB: Vector4[] = []
  const shardC: Vector4[] = []
  const farthest = Math.max(...seeds.map(seed => Math.hypot(toWorldX(seed.x) - centerX, toWorldY(seed.y) - centerY)), 1)
  for (const seed of seeds) {
    const sx = toWorldX(seed.x)
    const sy = toWorldY(seed.y)
    const away = Math.atan2(sy - centerY, sx - centerX) + (random() - .5) * .9
    const power = .55 + random() * .45
    const axis = [random() - .5, random() - .5, random() - .5]
    const axisLength = Math.hypot(axis[0], axis[1], axis[2]) || 1
    const reach = Math.hypot(sx - centerX, sy - centerY) / farthest
    shardA.push(new Vector4(sx, sy, Math.cos(away) * power, Math.sin(away) * power))
    shardB.push(new Vector4(.06 + random() * .28, (random() < .5 ? -1 : 1) * (5 + random() * 11), axis[0] / axisLength, axis[1] / axisLength))
    shardC.push(new Vector4(axis[2] / axisLength, reach * BURST_SPREAD, 0, 0))
  }

  // Textura de campo: gradiente del relieve (rg) y silueta (a). Con filtrado bilineal da normales
  // por píxel, así el reflejo sale liso aunque la malla sea gruesa.
  const field = new Uint16Array(w * h * 4)
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const o = (y * w + x) * 4
      field[o] = DataUtils.toHalfFloat((at(x + 1, y) - at(x - 1, y)) / 2)
      field[o + 1] = DataUtils.toHalfFloat(-(at(x, y + 1) - at(x, y - 1)) / 2)
      field[o + 3] = DataUtils.toHalfFloat(alpha[y * w + x] / 255)
    }
  }
  const mask = new DataTexture(field, w, h, RGBAFormat, HalfFloatType)
  mask.magFilter = LinearFilter
  mask.minFilter = LinearFilter
  mask.generateMipmaps = false
  mask.needsUpdate = true

  return { geometry, mask, shardA, shardB, shardC }
}

const vertexHead = /* glsl */ `
  attribute vec4 aShape;
  attribute vec2 aMaskUv;
  attribute float aShard;
  uniform float uInflate;
  uniform float uTime;
  uniform float uWobble;
  uniform float uBurst;
  uniform float uReach;
  uniform float uDistance;
  uniform vec4 uShardA[${SHARDS}];
  uniform vec4 uShardB[${SHARDS}];
  uniform vec4 uShardC[${SHARDS}];
  varying vec2 vMaskUv;
  varying vec3 vNM0;
  varying vec3 vNM1;
  varying vec3 vNM2;
  varying float vSide;

  mat3 axisRotation(vec3 axis, float angle) {
    float c = cos(angle);
    float s = sin(angle);
    float t = 1.0 - c;
    return mat3(
      t * axis.x * axis.x + c,          t * axis.x * axis.y + s * axis.z, t * axis.x * axis.z - s * axis.y,
      t * axis.x * axis.y - s * axis.z, t * axis.y * axis.y + c,          t * axis.y * axis.z + s * axis.x,
      t * axis.x * axis.z + s * axis.y, t * axis.y * axis.z - s * axis.x, t * axis.z * axis.z + c
    );
  }
`

const vertexNormal = /* glsl */ `
  vec3 objectNormal = normalize(vec3(-aShape.y * uInflate, -aShape.z * uInflate, aShape.w));
  vec3 shapedPosition = vec3(position.xy, aShape.w * aShape.x * uInflate);
  float ripple = sin(uTime * 6.3 + position.x * .05) * sin(uTime * 4.7 + position.y * .06 + position.x * .02);
  shapedPosition += objectNormal * ripple * uWobble;

  mat3 turn = mat3(1.0);
  if (uBurst > 0.0) {
    int shard = int(aShard + .5);
    vec4 a = uShardA[shard];
    vec4 b = uShardB[shard];
    vec4 c = uShardC[shard];
    float progress = clamp(uBurst - c.y, 0.0, 1.0);
    float travel = 1.0 - pow(1.0 - progress, 2.0);
    turn = axisRotation(vec3(b.zw, c.x), b.y * travel);
    vec3 pivot = vec3(a.xy, 0.0);
    float shrink = 1.0 - smoothstep(.5, 1.0, progress) * .97;
    shapedPosition = pivot + turn * (shapedPosition - pivot) * shrink;
    shapedPosition += vec3(a.zw * uReach, b.x * uDistance) * travel;
    shapedPosition.y -= uReach * .22 * progress * progress;
    objectNormal = turn * objectNormal;
  }
  vMaskUv = aMaskUv;
  vSide = aShape.w;
  mat3 viewTurn = normalMatrix * turn;
  vNM0 = viewTurn[0];
  vNM1 = viewTurn[1];
  vNM2 = viewTurn[2];
`

const fragmentHead = /* glsl */ `
  uniform sampler2D uMask;
  uniform float uInflate;
  varying vec2 vMaskUv;
  varying vec3 vNM0;
  varying vec3 vNM1;
  varying vec3 vNM2;
  varying float vSide;
`

const fragmentNormal = /* glsl */ `
  vec3 reliefNormal = normalize(vec3(-fieldSample.xy * uInflate, vSide));
  normal = normalize(vNM0 * reliefNormal.x + vNM1 * reliefNormal.y + vNM2 * reliefNormal.z) * faceDirection;
  nonPerturbedNormal = normal;
`

const fragmentCoverage = /* glsl */ `
  vec4 fieldSample = texture2D(uMask, vMaskUv);
  float edgeWidth = clamp(fwidth(fieldSample.a) * .55, .015, .5);
  diffuseColor.a *= smoothstep(.5 - edgeWidth, .5 + edgeWidth, fieldSample.a);
  if (diffuseColor.a < .004) discard;
`

export function createInflatedLogo(artwork: HTMLImageElement, host: HTMLElement, onContextLost?: () => void): InflatedLogo {
  const canvas = document.createElement('canvas')
  canvas.className = 'intro-canvas'
  const context = canvas.getContext('webgl2', { alpha: true, antialias: true })
  if (!context) throw new Error('WebGL 2 unavailable')

  const shape = buildShape(artwork)
  const { geometry, mask, shardA, shardB, shardC } = buildGeometry(shape)
  const renderer = new WebGLRenderer({ canvas, context, alpha: true })
  renderer.debug.onShaderError = () => { throw new Error('Unable to render the 3D logo') }
  renderer.setClearColor(0x000000, 0)
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  const handleLost = (event: Event) => {
    event.preventDefault()
    onContextLost?.()
  }
  canvas.addEventListener('webglcontextlost', handleLost)
  const scene = new Scene()
  const environmentScene = new RoomEnvironment()
  const generator = new PMREMGenerator(renderer)
  const environment = generator.fromScene(environmentScene, .04, .1, 100, { size: 128 })
  scene.environment = environment.texture
  scene.environmentIntensity = 1.15

  const uniforms = {
    uInflate: { value: 0 },
    uTime: { value: 0 },
    uWobble: { value: 0 },
    uBurst: { value: 0 },
    uReach: { value: 1000 },
    uDistance: { value: 2000 },
    uMask: { value: mask },
    uShardA: { value: shardA },
    uShardB: { value: shardB },
    uShardC: { value: shardC },
  }

  const material = new MeshPhysicalMaterial({
    color: new Color(BASE_COLOR),
    metalness: 1,
    roughness: .2,
    clearcoat: 1,
    clearcoatRoughness: .12,
    transparent: true,
    premultipliedAlpha: true,
  })
  material.customProgramCacheKey = () => 'inflated-logo'
  material.onBeforeCompile = shader => {
    Object.assign(shader.uniforms, uniforms)
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${vertexHead}`)
      .replace('#include <beginnormal_vertex>', vertexNormal)
      .replace('#include <begin_vertex>', 'vec3 transformed = shapedPosition;')
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${fragmentHead}`)
      .replace('#include <alphatest_fragment>', fragmentCoverage)
      .replace('#include <normal_fragment_begin>', `#include <normal_fragment_begin>\n${fragmentNormal}`)
  }

  const mesh = new Mesh(geometry, material)
  mesh.frustumCulled = false
  const group = new Group()
  group.add(mesh)
  scene.add(group)

  const camera = new PerspectiveCamera(28, 1, 1, 10)
  let showingShards = false

  const layout = () => {
    const width = Math.max(host.clientWidth, 1)
    const height = Math.max(host.clientHeight, 1)
    const aspect = shape.sourceWidth / shape.sourceHeight
    const logoWidth = Math.min(width * (width < 720 ? .7 : .44), 640, height * .5 * aspect)
    const unitsPerPixel = shape.sourceWidth / logoWidth
    const visibleHeight = height * unitsPerPixel
    const distance = visibleHeight / (2 * Math.tan((camera.fov * Math.PI) / 360))

    // Keep the same projection while rendering a smaller, denser canvas around the intact logo.
    // Only the shards need the full viewport.
    const viewWidth = showingShards ? width : Math.min(width, Math.ceil(logoWidth * 1.27 + 16))
    const viewHeight = showingShards ? height : Math.min(height, Math.ceil(logoWidth / aspect * 1.42 + 16))
    const left = Math.floor((width - viewWidth) * .5)
    const top = Math.min(height - viewHeight, Math.max(0, Math.floor(height * LOGO_CENTER_Y - viewHeight * .5)))
    const pixels = showingShards ? 900_000 : 760_000
    const pixelRatio = showingShards ? Math.min(devicePixelRatio, 1.25) : Math.min(Math.max(devicePixelRatio, 1.5), 1.85)
    renderer.setPixelRatio(Math.min(pixelRatio, Math.sqrt(pixels / (viewWidth * viewHeight))))
    renderer.setSize(viewWidth, viewHeight, false)
    canvas.style.left = `${left}px`
    canvas.style.top = `${top}px`
    canvas.style.width = `${viewWidth}px`
    canvas.style.height = `${viewHeight}px`

    camera.near = distance * .08
    camera.far = distance * 2.2
    camera.position.set(0, 0, distance)
    camera.setViewOffset(width, height, left, top, viewWidth, viewHeight)
    group.position.y = (.5 - LOGO_CENTER_Y) * visibleHeight
    uniforms.uReach.value = Math.hypot(width, height) * unitsPerPixel * .5
    uniforms.uDistance.value = distance * .55
  }
  layout()
  host.append(canvas)
  addEventListener('resize', layout)

  const state: InflatedLogoState = { pressure: 0, burst: 0 }
  const smooth = (x: number) => x * x * (3 - 2 * x)

  return {
    state,
    burstEnd: 1 + BURST_SPREAD,
    render(seconds) {
      if (state.burst > 0 && !showingShards) {
        showingShards = true
        layout()
      }
      const body = smooth(Math.min(state.pressure / .8, 1))
      const stress = Math.max(0, (state.pressure - .8) / .2)
      uniforms.uTime.value = seconds
      uniforms.uInflate.value = .04 + .86 * body + .22 * stress
      uniforms.uWobble.value = 1.4 * body + 5 * stress * stress
      uniforms.uBurst.value = state.burst

      const scale = .3 + .7 * body + .09 * stress
      group.scale.setScalar(scale)
      group.rotation.y = Math.sin(seconds * 1.15) * .2 * body
      group.rotation.x = Math.sin(seconds * .8 + 1) * .07 * body
      group.rotation.z = Math.sin(seconds * 31) * .012 * stress
      scene.environmentRotation.y = seconds * .45

      mesh.visible = state.burst < 1.3
      renderer.render(scene, camera)
    },
    dispose() {
      removeEventListener('resize', layout)
      canvas.removeEventListener('webglcontextlost', handleLost)
      geometry.dispose()
      material.dispose()
      mask.dispose()
      environment.dispose()
      environmentScene.dispose()
      generator.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      canvas.remove()
    },
  }
}
