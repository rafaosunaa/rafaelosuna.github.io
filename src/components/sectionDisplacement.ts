const vertex = `
attribute vec2 position;
varying vec2 uv;
void main() {
  uv = vec2(position.x, -position.y) * .5 + .5;
  gl_Position = vec4(position, 0., 1.);
}
`

const fragment = `
precision mediump float;
varying vec2 uv;
uniform sampler2D fromPlate;
uniform sampler2D toPlate;
uniform float progress;
uniform float direction;
uniform vec2 crop;

void main() {
  float x = direction > 0. ? uv.x : 1. - uv.x;
  float sweep = mix(-.24, 1.24, progress);
  float distance = x - sweep;
  float wave = sin(uv.y * 19. + progress * 9.) * .55
             + sin(uv.y * 45. - x * 6. - progress * 12.) * .29
             + sin(uv.y * 9. + x * 11.) * .51;
  float bend = wave * exp(-abs(distance) * 4.4) * .14 * sin(progress * 3.14159);
  float incoming = 1. - smoothstep(-.035, .047, distance + bend);
  vec2 paper = (uv - .5) * crop + .5;
  vec2 shift = vec2(bend * direction * 1.6, bend * .24) * crop;
  vec4 a = texture2D(fromPlate, paper + shift);
  vec4 b = texture2D(toPlate, paper - shift * 1.6);
  gl_FragColor = mix(a, b, incoming);
}
`

function loadPlate(svg: SVGSVGElement, color: string) {
  const plate = svg.cloneNode(true) as SVGSVGElement
  plate.setAttribute('width', '1280')
  plate.setAttribute('height', '680')
  plate.setAttribute('color', color)
  const source = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(plate)], { type: 'image/svg+xml' }))
  const image = new Image()
  image.src = source
  return image.decode().then(() => image).finally(() => URL.revokeObjectURL(source))
}

export function createSectionDisplacement(canvas: HTMLCanvasElement, plates: readonly [SVGSVGElement, SVGSVGElement]) {
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false })
  if (!gl) return

  const program = gl.createProgram()
  if (!program) return

  const sources = [[gl.VERTEX_SHADER, vertex], [gl.FRAGMENT_SHADER, fragment]] as const
  for (const [kind, source] of sources) {
    const shader = gl.createShader(kind)
    if (!shader) {
      gl.deleteProgram(program)
      return
    }
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    gl.attachShader(program, shader)
    gl.deleteShader(shader)
  }
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program)
    return
  }
  const quad = gl.createBuffer()
  const textures = [gl.createTexture(), gl.createTexture()]
  let ready = false
  let disposed = false

  Promise.all([loadPlate(plates[0], '#d8e9fa'), loadPlate(plates[1], '#174478')]).then(images => {
    if (disposed || !quad || textures.some(texture => !texture)) return
    const plate = document.createElement('canvas')
    plate.width = images[0].width
    plate.height = images[0].height
    const context = plate.getContext('2d')
    if (!context) return
    images.forEach((image, index) => {
      context.fillStyle = index === 0 ? '#174478' : '#f8f0de'
      context.fillRect(0, 0, plate.width, plate.height)
      context.drawImage(image, 0, 0)
      gl.activeTexture(gl.TEXTURE0 + index)
      gl.bindTexture(gl.TEXTURE_2D, textures[index])
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, plate)
    })

    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, quad)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const position = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
    gl.uniform1i(gl.getUniformLocation(program, 'fromPlate'), 0)
    gl.uniform1i(gl.getUniformLocation(program, 'toPlate'), 1)
    ready = gl.getError() === gl.NO_ERROR
  }).catch(() => { ready = false })

  const progressUniform = gl.getUniformLocation(program, 'progress')
  const directionUniform = gl.getUniformLocation(program, 'direction')
  const cropUniform = gl.getUniformLocation(program, 'crop')

  return {
    draw(progress: number, direction: number) {
      if (!ready || gl.isContextLost()) return false
      const density = Math.min(devicePixelRatio, 1.25, 1600 / Math.max(innerWidth, innerHeight))
      const width = Math.max(1, Math.round(innerWidth * density))
      const height = Math.max(1, Math.round(innerHeight * density))
      if (canvas.width !== width) canvas.width = width
      if (canvas.height !== height) canvas.height = height
      const ratio = width / height / (1280 / 680)
      gl.viewport(0, 0, width, height)
      gl.uniform2f(cropUniform, Math.min(ratio, 1), Math.min(1 / ratio, 1))
      gl.uniform1f(progressUniform, progress)
      gl.uniform1f(directionUniform, direction)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      return true
    },
    dispose() {
      disposed = true
      gl.deleteProgram(program)
      gl.deleteBuffer(quad)
      textures.forEach(texture => gl.deleteTexture(texture))
    },
  }
}
