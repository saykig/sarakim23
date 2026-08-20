'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { Color, MeshBasicMaterial, ShaderMaterial } from 'three'
import { feature } from 'topojson-client'
import countriesTopology from 'world-atlas/countries-110m.json'
import type { FeatureCollection, Geometry } from 'geojson'
import type { GlobeMethods } from 'react-globe.gl'
import type { AtlasPlace } from '../data/atlas-places'
import { atlasPlaces } from '../data/atlas-places'

const Globe = dynamic(() => import('react-globe.gl'), {
  ssr: false,
  loading: () => <div className="atlas-loading" aria-hidden="true" />,
})

const initialMemoryPlace =
  atlasPlaces.find((place) => place.memorySlug === 'interlaken') ?? null

type CountryFeature = {
  type: 'Feature'
  properties: Record<string, unknown> | null
  geometry: Geometry
}

const LAND_VERTEX_SHADER = `
  varying vec3 vGrainPosition;

  void main() {
    vGrainPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const LAND_FRAGMENT_SHADER = `
  precision highp float;

  uniform vec3 uBaseColor;
  uniform vec3 uInkColor;
  varying vec3 vGrainPosition;

  float hash31(vec3 point) {
    point = fract(point * 0.1031);
    point += dot(point, point.yzx + 33.33);
    return fract((point.x + point.y) * point.z);
  }

  float valueNoise(vec3 point) {
    vec3 cell = floor(point);
    vec3 local = fract(point);
    local = local * local * (3.0 - 2.0 * local);

    float n000 = hash31(cell + vec3(0.0, 0.0, 0.0));
    float n100 = hash31(cell + vec3(1.0, 0.0, 0.0));
    float n010 = hash31(cell + vec3(0.0, 1.0, 0.0));
    float n110 = hash31(cell + vec3(1.0, 1.0, 0.0));
    float n001 = hash31(cell + vec3(0.0, 0.0, 1.0));
    float n101 = hash31(cell + vec3(1.0, 0.0, 1.0));
    float n011 = hash31(cell + vec3(0.0, 1.0, 1.0));
    float n111 = hash31(cell + vec3(1.0, 1.0, 1.0));

    float nx00 = mix(n000, n100, local.x);
    float nx10 = mix(n010, n110, local.x);
    float nx01 = mix(n001, n101, local.x);
    float nx11 = mix(n011, n111, local.x);
    float nxy0 = mix(nx00, nx10, local.y);
    float nxy1 = mix(nx01, nx11, local.y);
    return mix(nxy0, nxy1, local.z);
  }

  void main() {
    vec3 surface = normalize(vGrainPosition);
    float inkDensity = 0.48 + valueNoise(surface * 21.0) * 0.52;
    float softGrain = smoothstep(
      0.62,
      0.91,
      valueNoise(surface * 360.0 + vec3(7.4, 2.1, 5.8))
    );
    float sparseFleck = smoothstep(
      0.925,
      0.995,
      hash31(floor(surface * 1180.0 + vec3(3.0, 19.0, 11.0)))
    );
    float inkAmount = softGrain * inkDensity * 0.12 + sparseFleck * 0.11;
    gl_FragColor = vec4(mix(uBaseColor, uInkColor, inkAmount), 1.0);
    #include <colorspace_fragment>
  }
`

function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [size, setSize] = useState({ width: 720, height: 720 })

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const updateSize = () => {
      const rect = element.getBoundingClientRect()
      setSize({
        width: Math.max(1, Math.round(rect.width)),
        height: Math.max(1, Math.round(rect.height)),
      })
    }

    updateSize()
    const observer = new ResizeObserver(updateSize)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return { ref, ...size }
}

function markerLeaderStyle(offset: readonly [number, number]) {
  const distance = Math.hypot(offset[0], offset[1])
  const headGap = Math.min(5, distance)

  return {
    width: `${Math.max(0, distance - headGap).toFixed(3)}px`,
    transform: `rotate(${Math.atan2(-offset[1], -offset[0]).toFixed(5)}rad) translateX(${headGap.toFixed(3)}px)`,
  }
}

function createMarkerElement(
  place: AtlasPlace,
  selected: boolean,
  onSelect: (place: AtlasPlace) => void
) {
  const marker = document.createElement('div')
  marker.className = 'atlas-marker'

  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'atlas-marker-button atlas-marker-offset'
  button.dataset.selected = String(selected)
  button.setAttribute('aria-label', `Explore ${place.name}`)

  const offset = place.displayOffset ?? [0, 0]

  const anchor = document.createElement('span')
  anchor.className = 'atlas-marker-anchor'
  anchor.setAttribute('aria-hidden', 'true')

  button.style.left = `${offset[0]}px`
  button.style.top = `${offset[1]}px`

  if (offset[0] !== 0 || offset[1] !== 0) {
    const leader = document.createElement('span')
    leader.className = 'atlas-marker-leader'
    leader.setAttribute('aria-hidden', 'true')
    Object.assign(leader.style, markerLeaderStyle(offset))
    button.appendChild(leader)
  }

  const face = document.createElement('span')
  face.className = 'atlas-marker-face'
  face.setAttribute('aria-hidden', 'true')

  const centre = document.createElement('span')
  centre.className = 'atlas-marker-centre'
  face.appendChild(centre)

  const tooltip = document.createElement('span')
  tooltip.className = 'atlas-marker-tooltip'
  tooltip.setAttribute('role', 'tooltip')

  const name = document.createElement('strong')
  name.textContent = place.name
  tooltip.appendChild(name)

  if (place.years) {
    const years = document.createElement('span')
    years.textContent = place.years
    tooltip.appendChild(years)
  }

  const action = document.createElement('span')
  action.textContent = place.memorySlug
    ? 'discover memory →'
    : 'archive entry in progress'
  tooltip.appendChild(action)

  button.append(face, tooltip)
  marker.append(anchor, button)
  button.addEventListener('click', (event) => {
    event.stopPropagation()
    onSelect(place)
  })

  return marker
}

export function SoftAtlas() {
  const globeRef = useRef<GlobeMethods>()
  const reduceMotion = useReducedMotion()
  const [selectedPlace, setSelectedPlace] =
    useState<AtlasPlace | null>(initialMemoryPlace)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const { ref: frameRef, width, height } = useElementSize<HTMLDivElement>()

  const countries = useMemo(() => {
    const collection = feature(
      countriesTopology as never,
      countriesTopology.objects.countries as never
    ) as unknown as FeatureCollection

    return collection.features as CountryFeature[]
  }, [])

  const globeMaterial = useMemo(
    () => new MeshBasicMaterial({ color: '#dfe4cf' }),
    []
  )

  const landMaterial = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uBaseColor: { value: new Color('#dfe4cf') },
          uInkColor: { value: new Color('#5d694f') },
        },
        vertexShader: LAND_VERTEX_SHADER,
        fragmentShader: LAND_FRAGMENT_SHADER,
        toneMapped: false,
      }),
    []
  )

  useEffect(
    () => () => {
      globeMaterial.dispose()
      landMaterial.dispose()
    },
    [globeMaterial, landMaterial]
  )

  const focusPlace = useCallback(
    (place: AtlasPlace) => {
      setSelectedPlace(place)
      setHasInteracted(true)
      const controls = globeRef.current?.controls()
      if (controls) controls.autoRotate = false
      globeRef.current?.pointOfView(
        { lat: place.lat, lng: place.lng, altitude: 1.72 },
        reduceMotion ? 0 : 1100
      )
    },
    [reduceMotion]
  )

  const markerData = useMemo(
    () =>
      atlasPlaces.map((place) => ({
        ...place,
        selected: place.slug === selectedPlace?.slug,
      })),
    [selectedPlace?.slug]
  )

  const markerElement = useCallback(
    (datum: object) => {
      const place = datum as AtlasPlace & { selected: boolean }
      return createMarkerElement(place, place.selected, focusPlace)
    },
    [focusPlace]
  )

  const handleReady = useCallback(() => {
    const globe = globeRef.current
    if (!globe) return

    globe.pointOfView({ lat: 38, lng: 18, altitude: 1.72 }, 0)
    const controls = globe.controls()
    controls.enableZoom = false
    controls.enablePan = false
    controls.minPolarAngle = Math.PI * 0.16
    controls.maxPolarAngle = Math.PI * 0.84
    controls.autoRotate = !reduceMotion
    controls.autoRotateSpeed = 0.12
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.addEventListener('start', () => {
      controls.autoRotate = false
      setHasInteracted(true)
    })
    setIsReady(true)
  }, [reduceMotion])

  useEffect(() => {
    const controls = globeRef.current?.controls()
    if (!controls) return
    controls.autoRotate = !reduceMotion && !hasInteracted
  }, [hasInteracted, isReady, reduceMotion])

  return (
    <div className="atlas-experience">
      <div
        className="atlas-globe-viewport"
        role="region"
        aria-label="Interactive atlas of places Sara has called home or visited"
      >
        <div
          ref={frameRef}
          className="atlas-globe-frame"
          data-ready={isReady}
        >
          <Globe
            ref={globeRef}
            width={width}
            height={height}
            backgroundColor="rgba(232, 234, 216, 0)"
            globeMaterial={globeMaterial}
            showAtmosphere={false}
            showGraticules={false}
            animateIn={!reduceMotion}
            waitForGlobeReady
            polygonsData={countries}
            polygonCapMaterial={landMaterial}
            polygonSideColor={() => 'rgba(232, 234, 216, 0)'}
            polygonStrokeColor={() => 'rgba(57, 78, 56, 0.9)'}
            polygonAltitude={0.004}
            polygonsTransitionDuration={0}
            htmlElementsData={markerData}
            htmlLat="lat"
            htmlLng="lng"
            htmlAltitude={0.014}
            htmlElement={markerElement}
            htmlTransitionDuration={0}
            onGlobeReady={handleReady}
            rendererConfig={{ antialias: true, alpha: true }}
          />
        </div>
        <p className="atlas-instruction" aria-hidden="true">
          drag the globe · select a place
        </p>
      </div>

      <div className="atlas-annotation" aria-live="polite">
        {selectedPlace ? (
          selectedPlace.memorySlug ? (
            <Link
              href={`/memories/${selectedPlace.memorySlug}`}
              className="atlas-memory-teaser"
            >
              <span className="atlas-annotation-kicker">
                {selectedPlace.type === 'home' ? 'called home' : 'visited'}
              </span>
              <span className="atlas-annotation-name">{selectedPlace.name}</span>
              <span className="atlas-memory-status">memory archive</span>
              <span className="atlas-memory-action">discover memory →</span>
            </Link>
          ) : (
            <>
              <p className="atlas-annotation-kicker">
                {selectedPlace.type === 'home' ? 'called home' : 'visited'}
              </p>
              <p className="atlas-annotation-name">{selectedPlace.name}</p>
              <p className="atlas-annotation-meta">
                {selectedPlace.years ? `${selectedPlace.years} · ` : ''}
                memory archive in progress
              </p>
            </>
          )
        ) : null}
      </div>

      <details className="atlas-place-index">
        <summary>browse all {atlasPlaces.length} places</summary>
        <div className="atlas-place-list">
          {atlasPlaces.map((place) => (
            <button
              key={place.slug}
              type="button"
              data-selected={place.slug === selectedPlace?.slug}
              onClick={() => focusPlace(place)}
            >
              {place.name}
            </button>
          ))}
        </div>
      </details>
    </div>
  )
}
