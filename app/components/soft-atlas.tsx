'use client'

import dynamic from 'next/dynamic'
import {
  Component,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ErrorInfo,
  type ReactNode,
} from 'react'
import { useReducedMotion } from 'motion/react'
import { geoOrthographic, geoPath } from 'd3-geo'
import { Color, MeshBasicMaterial, ShaderMaterial, Vector3 } from 'three'
import { feature, mesh } from 'topojson-client'
import countriesTopology from 'world-atlas/countries-110m.json'
import type { FeatureCollection, Geometry } from 'geojson'
import type { GlobeMethods } from 'react-globe.gl'
import type { AtlasPlace } from '../data/atlas-places'
import { atlasPlaces } from '../data/atlas-places'

const Globe = dynamic(() => import('react-globe.gl'), {
  ssr: false,
  loading: () => <div className="atlas-loading" aria-hidden="true" />,
})

const globeCaption =
  "Hover to discover the places I've called home and travelled to!"

const CAPTION_GAP_PX = 16
const CAPTION_START_ANGLE = 160
const CAPTION_END_ANGLE = 72

type CountryFeature = {
  type: 'Feature'
  properties: Record<string, unknown> | null
  geometry: Geometry
}

type GlobeScreenGeometry = {
  centerX: number
  centerY: number
  radius: number
}

type TooltipPosition = {
  x: number
  y: number
}

type GlobeRenderBoundaryProps = {
  children: ReactNode
  fallback: ReactNode
  onError: (error: Error, info: ErrorInfo) => void
}

class GlobeRenderBoundary extends Component<
  GlobeRenderBoundaryProps,
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError(error, info)
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

const FALLBACK_SIZE = 640
const FALLBACK_RADIUS = 300
const FALLBACK_CENTRE = FALLBACK_SIZE / 2
const FALLBACK_LATITUDE = 38
const FALLBACK_LONGITUDE = 18
const FALLBACK_COUNTRY_MESH = mesh(
  countriesTopology as never,
  countriesTopology.objects.countries as never
) as Geometry

function projectFallbackPoint(
  coordinates: readonly number[],
  centreLongitude = FALLBACK_LONGITUDE
) {
  const longitude = ((coordinates[0] - centreLongitude) * Math.PI) / 180
  const latitude = (coordinates[1] * Math.PI) / 180
  const centreLatitude = (FALLBACK_LATITUDE * Math.PI) / 180
  const visibility =
    Math.sin(centreLatitude) * Math.sin(latitude) +
    Math.cos(centreLatitude) * Math.cos(latitude) * Math.cos(longitude)

  return {
    x:
      FALLBACK_CENTRE +
      FALLBACK_RADIUS * Math.cos(latitude) * Math.sin(longitude),
    y:
      FALLBACK_CENTRE -
      FALLBACK_RADIUS *
        (Math.cos(centreLatitude) * Math.sin(latitude) -
          Math.sin(centreLatitude) *
            Math.cos(latitude) *
            Math.cos(longitude)),
    visible: visibility > 0,
  }
}

function FallbackGlobe({
  selectedPlace,
  reduceMotion,
  hasInteracted,
  onSelect,
  onMarkerEnter,
  onMarkerLeave,
}: {
  selectedPlace: AtlasPlace | null
  reduceMotion: boolean
  hasInteracted: boolean
  onSelect: (place: AtlasPlace) => void
  onMarkerEnter: (place: AtlasPlace) => void
  onMarkerLeave: () => void
}) {
  const [centreLongitude, setCentreLongitude] = useState(FALLBACK_LONGITUDE)

  useEffect(() => {
    if (reduceMotion || hasInteracted) return

    let frame = 0
    let previousUpdate = performance.now()
    const rotate = (now: number) => {
      const elapsed = now - previousUpdate
      if (elapsed >= 40) {
        setCentreLongitude(
          (longitude) => ((longitude + elapsed * 0.00022 + 540) % 360) - 180
        )
        previousUpdate = now
      }
      frame = requestAnimationFrame(rotate)
    }

    frame = requestAnimationFrame(rotate)
    return () => cancelAnimationFrame(frame)
  }, [hasInteracted, reduceMotion])

  const countryPath = useMemo(
    () => {
      const projection = geoOrthographic()
        .translate([FALLBACK_CENTRE, FALLBACK_CENTRE])
        .scale(FALLBACK_RADIUS)
        .rotate([-centreLongitude, -FALLBACK_LATITUDE])
        .clipAngle(90)
        .precision(0.4)
      const path = geoPath(projection)

      return path(FALLBACK_COUNTRY_MESH) ?? ''
    },
    [centreLongitude]
  )

  return (
    <div className="atlas-fallback-globe" aria-label="Soft Atlas globe">
      <svg viewBox={`0 0 ${FALLBACK_SIZE} ${FALLBACK_SIZE}`} aria-hidden="true">
        <defs>
          <clipPath id="atlas-fallback-clip">
            <circle
              cx={FALLBACK_CENTRE}
              cy={FALLBACK_CENTRE}
              r={FALLBACK_RADIUS}
            />
          </clipPath>
        </defs>
        <circle
          className="atlas-fallback-ocean"
          cx={FALLBACK_CENTRE}
          cy={FALLBACK_CENTRE}
          r={FALLBACK_RADIUS}
        />
        <g clipPath="url(#atlas-fallback-clip)">
          <ellipse
            className="atlas-fallback-gridline"
            cx={FALLBACK_CENTRE}
            cy={FALLBACK_CENTRE}
            rx={FALLBACK_RADIUS}
            ry={112}
          />
          <ellipse
            className="atlas-fallback-gridline"
            cx={FALLBACK_CENTRE}
            cy={FALLBACK_CENTRE}
            rx={FALLBACK_RADIUS}
            ry={224}
          />
          <path className="atlas-fallback-country" d={countryPath} />
        </g>
        <circle
          className="atlas-fallback-outline"
          cx={FALLBACK_CENTRE}
          cy={FALLBACK_CENTRE}
          r={FALLBACK_RADIUS}
        />
      </svg>

      {atlasPlaces.map((place) => {
        const point = projectFallbackPoint(
          [place.lng, place.lat],
          centreLongitude
        )
        if (!point.visible) return null
        const MarkerControl = place.memorySlug ? 'a' : 'button'

        return (
          <div
            key={place.slug}
            className="atlas-marker atlas-fallback-marker"
            style={{
              left: `${(point.x / FALLBACK_SIZE) * 100}%`,
              top: `${(point.y / FALLBACK_SIZE) * 100}%`,
            }}
          >
            <MarkerControl
              type={place.memorySlug ? undefined : 'button'}
              href={
                place.memorySlug
                  ? `/memories/${place.memorySlug}`
                  : undefined
              }
              className="atlas-marker-button"
              data-selected={String(place.slug === selectedPlace?.slug)}
              data-atlas-place={place.slug}
              aria-label={`Explore ${place.name}`}
              onMouseEnter={() => onMarkerEnter(place)}
              onMouseLeave={onMarkerLeave}
              onFocus={() => onMarkerEnter(place)}
              onBlur={onMarkerLeave}
              onClick={(event) => {
                event.preventDefault()
                onSelect(place)
              }}
            >
              <span className="atlas-marker-face" aria-hidden="true">
                <span className="atlas-marker-centre" />
              </span>
            </MarkerControl>
          </div>
        )
      })}
    </div>
  )
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
  const [size, setSize] = useState({ width: 0, height: 0 })

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return

    const updateSize = () => {
      const rect = element.getBoundingClientRect()
      const nextSize = {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      }

      setSize((currentSize) =>
        currentSize.width === nextSize.width &&
        currentSize.height === nextSize.height
          ? currentSize
          : nextSize
      )
    }

    updateSize()
    const observer = new ResizeObserver(updateSize)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return { ref, ...size }
}

function projectGlobeSilhouette(
  globe: GlobeMethods,
  width: number,
  height: number
): GlobeScreenGeometry | null {
  const camera = globe.camera()
  const globeRadius = globe.getGlobeRadius()

  camera.updateMatrixWorld()
  camera.updateProjectionMatrix()

  const worldCenter = new Vector3(0, 0, 0)
  const centerX = width / 2
  const centerY = height / 2
  const cameraSpaceCenter = worldCenter
    .clone()
    .applyMatrix4(camera.matrixWorldInverse)

  let radius: number

  if (camera.type === 'PerspectiveCamera') {
    const distance = cameraSpaceCenter.length()
    if (distance <= globeRadius) return null

    const tangentSlope = globeRadius / Math.sqrt(distance ** 2 - globeRadius ** 2)
    radius =
      (height / 2) * camera.projectionMatrix.elements[5] * tangentSlope
  } else if (camera.type === 'OrthographicCamera') {
    radius =
      (height / 2) * camera.projectionMatrix.elements[5] * globeRadius
  } else {
    return null
  }

  return { centerX, centerY, radius }
}

function pointOnCircle(
  centerX: number,
  centerY: number,
  radius: number,
  angle: number
) {
  const radians = (angle * Math.PI) / 180
  return {
    x: centerX + radius * Math.cos(radians),
    y: centerY + radius * Math.sin(radians),
  }
}

function circularArcPath(
  geometry: GlobeScreenGeometry,
  radius: number,
  startAngle: number,
  endAngle: number
) {
  const start = pointOnCircle(
    geometry.centerX,
    geometry.centerY,
    radius,
    startAngle
  )
  const end = pointOnCircle(
    geometry.centerX,
    geometry.centerY,
    radius,
    endAngle
  )
  const angularSpan = Math.abs(endAngle - startAngle) % 360
  const largeArcFlag = angularSpan > 180 ? 1 : 0
  const sweepFlag = endAngle > startAngle ? 1 : 0

  return [
    `M ${start.x.toFixed(3)} ${start.y.toFixed(3)}`,
    `A ${radius.toFixed(3)} ${radius.toFixed(3)} 0 ${largeArcFlag} ${sweepFlag}`,
    `${end.x.toFixed(3)} ${end.y.toFixed(3)}`,
  ].join(' ')
}

function createMarkerElement(
  place: AtlasPlace,
  selected: boolean,
  onSelect: (place: AtlasPlace) => void,
  onMarkerEnter: (place: AtlasPlace) => void,
  onMarkerLeave: () => void
) {
  const marker = document.createElement('div')
  marker.className = 'atlas-marker'

  const control = place.memorySlug
    ? document.createElement('a')
    : document.createElement('button')
  if (control instanceof HTMLAnchorElement) {
    control.href = `/memories/${place.memorySlug}`
  } else {
    control.type = 'button'
  }
  control.className = 'atlas-marker-button'
  control.dataset.selected = String(selected)
  control.dataset.atlasPlace = place.slug
  control.setAttribute('aria-label', `Explore ${place.name}`)

  const face = document.createElement('span')
  face.className = 'atlas-marker-face'
  face.setAttribute('aria-hidden', 'true')

  const centre = document.createElement('span')
  centre.className = 'atlas-marker-centre'
  face.appendChild(centre)

  control.append(face)
  marker.append(control)
  control.addEventListener('mouseenter', () => onMarkerEnter(place))
  control.addEventListener('mouseleave', onMarkerLeave)
  control.addEventListener('focus', () => onMarkerEnter(place))
  control.addEventListener('blur', onMarkerLeave)
  control.addEventListener('click', (event) => {
    event.stopPropagation()
    event.preventDefault()
    onSelect(place)
  })

  return marker
}

function AtlasTooltipOverlay({
  place,
  position,
  onPointerEnter,
  onPointerLeave,
}: {
  place: AtlasPlace | null
  position: TooltipPosition | null
  onPointerEnter: () => void
  onPointerLeave: () => void
}) {
  if (!place || !position) return null

  return (
    <div className="atlas-tooltip-layer" aria-live="polite">
      <div
        className="atlas-tooltip-card"
        role="tooltip"
        aria-label={`${place.name} • ${place.type}. ${place.memorySlug ? 'Discover memory' : 'Memory in progress'}`}
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onFocusCapture={onPointerEnter}
        onBlurCapture={onPointerLeave}
      >
        <span className="atlas-tooltip-label">
          <strong>{place.name}</strong>
          <span className="atlas-tooltip-label-node" aria-hidden="true" />
          <span className="atlas-tooltip-type">{place.type}</span>
        </span>
        {place.memorySlug ? (
          <a
            className="atlas-tooltip-action"
            href={`/memories/${place.memorySlug}`}
          >
            Discover memory →
          </a>
        ) : (
          <span className="atlas-tooltip-action">Memory in progress</span>
        )}
      </div>
    </div>
  )
}

export function SoftAtlas() {
  const globeRef = useRef<GlobeMethods | undefined>(undefined)
  const viewportRef = useRef<HTMLDivElement>(null)
  const tooltipClearTimerRef = useRef<number | null>(null)
  const reduceMotion = useReducedMotion()
  const [selectedPlace, setSelectedPlace] = useState<AtlasPlace | null>(null)
  const [hoveredPlace, setHoveredPlace] = useState<AtlasPlace | null>(null)
  const [tooltipPosition, setTooltipPosition] =
    useState<TooltipPosition | null>(null)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [projectedGlobe, setProjectedGlobe] =
    useState<GlobeScreenGeometry | null>(null)
  const [showGeometryDebug, setShowGeometryDebug] = useState(false)
  const { ref: frameRef, width, height } = useElementSize<HTMLDivElement>()

  const cancelTooltipClear = useCallback(() => {
    if (tooltipClearTimerRef.current === null) return
    window.clearTimeout(tooltipClearTimerRef.current)
    tooltipClearTimerRef.current = null
  }, [])

  const showTooltip = useCallback(
    (place: AtlasPlace) => {
      cancelTooltipClear()
      setHoveredPlace(place)
    },
    [cancelTooltipClear]
  )

  const scheduleTooltipClear = useCallback(() => {
    cancelTooltipClear()
    tooltipClearTimerRef.current = window.setTimeout(() => {
      setHoveredPlace(null)
      tooltipClearTimerRef.current = null
    }, 120)
  }, [cancelTooltipClear])

  useEffect(
    () => () => {
      cancelTooltipClear()
    },
    [cancelTooltipClear]
  )

  const globeGeometry =
    projectedGlobe ??
    (width > 0 && height > 0
      ? {
          centerX: width / 2,
          centerY: height / 2,
          radius: (Math.min(width, height) * FALLBACK_RADIUS) / FALLBACK_SIZE,
        }
      : null)
  const captionRadius = globeGeometry
    ? globeGeometry.radius + CAPTION_GAP_PX
    : 0
  const captionPath = globeGeometry
    ? circularArcPath(
        globeGeometry,
        captionRadius,
        CAPTION_START_ANGLE,
        CAPTION_END_ANGLE
      )
    : ''

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
      cancelTooltipClear()
      setSelectedPlace(place)
      setHasInteracted(true)
      const controls = globeRef.current?.controls()
      if (controls) controls.autoRotate = false
      globeRef.current?.pointOfView(
        { lat: place.lat, lng: place.lng, altitude: 1.72 },
        reduceMotion ? 0 : 1100
      )
    },
    [cancelTooltipClear, reduceMotion]
  )

  const activeTooltipPlace = hoveredPlace ?? selectedPlace

  useEffect(() => {
    if (!activeTooltipPlace) {
      setTooltipPosition(null)
      return
    }

    let frame = 0
    const updatePosition = () => {
      const viewport = viewportRef.current
      const marker = frameRef.current?.querySelector<HTMLElement>(
        `[data-atlas-place="${activeTooltipPlace.slug}"]`
      )

      if (viewport && marker) {
        const viewportRect = viewport.getBoundingClientRect()
        const markerRect = marker.getBoundingClientRect()
        const halfCardWidth = Math.min(
          88,
          Math.max(0, viewportRect.width / 2 - 8)
        )
        const rawX = markerRect.left - viewportRect.left + markerRect.width / 2
        const rawY = markerRect.top - viewportRect.top + markerRect.height / 2 - 8
        const nextPosition = {
          x: Math.max(
            halfCardWidth,
            Math.min(viewportRect.width - halfCardWidth, rawX)
          ),
          y: Math.max(64, Math.min(viewportRect.height - 8, rawY)),
        }

        setTooltipPosition((currentPosition) =>
          currentPosition &&
          Math.abs(currentPosition.x - nextPosition.x) < 0.5 &&
          Math.abs(currentPosition.y - nextPosition.y) < 0.5
            ? currentPosition
            : nextPosition
        )
      }

      frame = requestAnimationFrame(updatePosition)
    }

    updatePosition()
    return () => cancelAnimationFrame(frame)
  }, [activeTooltipPlace, frameRef])

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
      return createMarkerElement(
        place,
        place.selected,
        focusPlace,
        showTooltip,
        scheduleTooltipClear
      )
    },
    [focusPlace, scheduleTooltipClear, showTooltip]
  )

  const handleReady = useCallback(() => {
    // react-kapsule may invoke this from the child's layout effect before its
    // forwarded ref has been attached. Readiness must not depend on ref timing.
    setIsReady(true)
  }, [])

  useEffect(() => {
    if (!isReady) return

    const globe = globeRef.current
    if (!globe) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Soft Atlas became ready without an attached globe ref.')
      }
      return
    }

    globe.pointOfView({ lat: 38, lng: 18, altitude: 1.72 }, 0)
    const controls = globe.controls()
    controls.enableZoom = false
    controls.enablePan = false
    controls.minPolarAngle = Math.PI * 0.16
    controls.maxPolarAngle = Math.PI * 0.84
    controls.autoRotateSpeed = 0.12
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    const handleInteractionStart = () => {
      controls.autoRotate = false
      setHasInteracted(true)
    }
    controls.addEventListener('start', handleInteractionStart)

    return () => controls.removeEventListener('start', handleInteractionStart)
  }, [isReady])

  useEffect(() => {
    const controls = globeRef.current?.controls()
    if (!controls) return
    controls.autoRotate = !reduceMotion && !hasInteracted
  }, [hasInteracted, isReady, reduceMotion])

  useEffect(() => {
    if (!isReady || width <= 0 || height <= 0) return

    const globe = globeRef.current
    if (!globe) return

    const nextGeometry = projectGlobeSilhouette(globe, width, height)
    setProjectedGlobe((currentGeometry) => {
      if (!currentGeometry || !nextGeometry) return nextGeometry

      const unchanged =
        Math.abs(currentGeometry.centerX - nextGeometry.centerX) < 0.01 &&
        Math.abs(currentGeometry.centerY - nextGeometry.centerY) < 0.01 &&
        Math.abs(currentGeometry.radius - nextGeometry.radius) < 0.01
      return unchanged ? currentGeometry : nextGeometry
    })
  }, [height, isReady, width])

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return
    setShowGeometryDebug(
      new URLSearchParams(window.location.search).has('debugAtlasGeometry')
    )
  }, [])

  useEffect(() => {
    const clearSelectedPlace = (event: MouseEvent) => {
      const target = event.target
      if (
        target instanceof Element &&
        target.closest('.atlas-marker-button, .atlas-tooltip-card')
      ) {
        return
      }
      setSelectedPlace(null)
    }

    document.addEventListener('click', clearSelectedPlace)
    return () => document.removeEventListener('click', clearSelectedPlace)
  }, [])

  return (
    <div className="atlas-experience">
      <div
        ref={viewportRef}
        className="atlas-globe-viewport"
        data-testid="soft-atlas-globe-viewport"
        role="region"
        aria-label="Interactive atlas of places Sara has called home or visited"
      >
        <div
          ref={frameRef}
          className="atlas-globe-frame"
          data-testid="soft-atlas-globe"
          data-ready={isReady}
        >
          {width === 0 || height === 0 ? (
            <div className="atlas-loading" aria-hidden="true" />
          ) : (
            <GlobeRenderBoundary
              onError={(error, info) => {
                if (process.env.NODE_ENV !== 'production') {
                  console.error('Soft Atlas WebGL renderer failed.', error, info)
                }
                setIsReady(true)
              }}
              fallback={
                <FallbackGlobe
                  selectedPlace={selectedPlace}
                  reduceMotion={Boolean(reduceMotion)}
                  hasInteracted={hasInteracted}
                  onSelect={focusPlace}
                  onMarkerEnter={showTooltip}
                  onMarkerLeave={scheduleTooltipClear}
                />
              }
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
            </GlobeRenderBoundary>
          )}

          <svg
            className="atlas-globe-caption"
            viewBox={`0 0 ${Math.max(width, 1)} ${Math.max(height, 1)}`}
            preserveAspectRatio="none"
            role="img"
            aria-labelledby="atlas-globe-caption-title"
            focusable="false"
            data-globe-center-x={globeGeometry?.centerX.toFixed(3)}
            data-globe-center-y={globeGeometry?.centerY.toFixed(3)}
            data-globe-radius={globeGeometry?.radius.toFixed(3)}
            data-caption-radius={captionRadius.toFixed(3)}
          >
            <title id="atlas-globe-caption-title">{globeCaption}</title>
            <defs>
              <path id="atlas-caption-arc" d={captionPath} />
            </defs>
            {showGeometryDebug && globeGeometry ? (
              <g aria-hidden="true" className="atlas-geometry-debug">
                <circle
                  cx={globeGeometry.centerX}
                  cy={globeGeometry.centerY}
                  r={globeGeometry.radius}
                />
                <circle
                  cx={globeGeometry.centerX}
                  cy={globeGeometry.centerY}
                  r={captionRadius}
                />
              </g>
            ) : null}
            <text className="atlas-caption-text">
              <textPath
                href="#atlas-caption-arc"
                startOffset="50%"
                textAnchor="middle"
              >
                {globeCaption}
              </textPath>
            </text>
          </svg>
        </div>
        <AtlasTooltipOverlay
          place={activeTooltipPlace}
          position={tooltipPosition}
          onPointerEnter={cancelTooltipClear}
          onPointerLeave={scheduleTooltipClear}
        />
      </div>

    </div>
  )
}
