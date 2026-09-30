import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { Vector3, type Mesh } from 'three'
import { intToRgb } from '../colors'
import type { FresnelCoreProps } from '../types'
import { useTokenColor } from '../useTokenColor'

/* Ported from williams-media-portal/src/public/app/hero-3d.js (FS_SPHERE / FS_HALO), with the
 * hard-coded violet/blue replaced by token uniforms. three's ShaderMaterial supplies position,
 * normal, modelMatrix, viewMatrix, projectionMatrix and cameraPosition. */
export const CORE_VERTEX = /* glsl */ `
varying vec3 vN;
varying vec3 vP;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vP = wp.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`

export const CORE_FRAGMENT = /* glsl */ `
precision mediump float;
varying vec3 vN;
varying vec3 vP;
uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uRim;
void main() {
  vec3 n = normalize(vN);
  vec3 v = normalize(cameraPosition - vP);
  float fres = pow(1.0 - max(dot(n, v), 0.0), 2.4);
  float band = 0.5 + 0.5 * sin(n.y * 3.2 + uTime * 0.35 + n.x * 1.7);
  vec3 base = mix(uColorA, uColorB, band * 0.55);
  vec3 l = normalize(vec3(-0.45, 0.85, 0.9));
  float diff = 0.5 + 0.5 * max(dot(n, l), 0.0);
  float spec = pow(max(dot(reflect(-l, n), v), 0.0), 48.0);
  vec3 col = base * diff + uRim * fres * 0.85 + vec3(1.0) * spec * 0.3;
  gl_FragColor = vec4(col, 1.0);
}`

export const HALO_VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`

export const HALO_FRAGMENT = /* glsl */ `
precision mediump float;
varying vec2 vUv;
uniform float uAlpha;
uniform vec3 uColorA;
uniform vec3 uRim;
void main() {
  float d = length(vUv - 0.5) * 2.0;
  float a = smoothstep(1.0, 0.3, d);
  a = a * a * uAlpha;
  vec3 c = mix(uColorA, uRim, 1.0 - d);
  gl_FragColor = vec4(c, a);
}`

const rgb = (n: number) => new Vector3(...intToRgb(n))
/** Lighten toward white (the hero's lilac rim is violet mixed ~70% with white). */
const tintToWhite = (n: number, amount: number) => {
  const [r, g, b] = intToRgb(n)
  return new Vector3(r + (1 - r) * amount, g + (1 - g) * amount, b + (1 - b) * amount)
}

/** A fresnel-lit sphere with a drifting two-colour band and an optional soft halo. */
export function FresnelCore({
  radius = 0.88,
  position = [0, 0, 0],
  colorRole = 'accent-1',
  secondaryRole = 'accent-2',
  rimColor,
  halo = true,
  animate = true,
  segments = 40,
}: FresnelCoreProps) {
  const a = useTokenColor(colorRole)
  const b = useTokenColor(secondaryRole)
  const core = useRef<Mesh>(null)
  const haloRef = useRef<Mesh>(null)

  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uColorA: { value: new Vector3() }, uColorB: { value: new Vector3() }, uRim: { value: new Vector3() } }),
    [],
  )
  const haloUniforms = useMemo(() => ({ uAlpha: { value: 0.42 }, uColorA: uniforms.uColorA, uRim: uniforms.uRim }), [uniforms])

  useEffect(() => {
    uniforms.uColorA.value.copy(rgb(a))
    uniforms.uColorB.value.copy(rgb(b))
    uniforms.uRim.value.copy(rimColor === undefined ? tintToWhite(a, 0.7) : rgb(rimColor))
  }, [a, b, rimColor, uniforms])

  useFrame((state, delta) => {
    if (haloRef.current) haloRef.current.quaternion.copy(state.camera.quaternion)
    if (!animate) return
    uniforms.uTime.value += delta
    if (core.current) core.current.rotation.y += delta * 0.12
  })

  const rings = Math.max(8, Math.round(segments * 0.7))
  return (
    <group position={position}>
      {halo ? (
        <mesh ref={haloRef} position={[0, 0, -0.3]} renderOrder={-1}>
          <planeGeometry args={[radius * 5.2, radius * 5.2]} />
          <shaderMaterial vertexShader={HALO_VERTEX} fragmentShader={HALO_FRAGMENT} uniforms={haloUniforms} transparent depthWrite={false} depthTest={false} />
        </mesh>
      ) : null}
      <mesh ref={core} scale={radius}>
        <sphereGeometry args={[1, segments, rings]} />
        <shaderMaterial vertexShader={CORE_VERTEX} fragmentShader={CORE_FRAGMENT} uniforms={uniforms} />
      </mesh>
    </group>
  )
}
