'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { MeshBasicMaterial } from 'three'
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

type CountryFeature = {
  type: 'Feature'
  properties: Record<string, unknown> | null
  geometry: Geometry
}

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

function createMarkerElement(
  place: AtlasPlace,
  selected: boolean,
  onSelect: (place: AtlasPlace) => void
) {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'atlas-marker'
  button.dataset.selected = String(selected)
  button.setAttribute('aria-label', `Explore ${place.name}`)

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
  action.textContent = 'archive entry in progress'
  tooltip.appendChild(action)

  button.append(face, tooltip)
  button.addEventListener('click', (event) => {
    event.stopPropagation()
    onSelect(place)
  })

  return button
}

export function SoftAtlas() {
  const globeRef = useRef<GlobeMethods>()
  const reduceMotion = useReducedMotion()
  const [selectedPlace, setSelectedPlace] = useState<AtlasPlace | null>(null)
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

  useEffect(() => () => globeMaterial.dispose(), [globeMaterial])

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
            polygonCapColor={() => '#dfe4cf'}
            polygonSideColor={() => 'rgba(232, 234, 216, 0)'}
            polygonStrokeColor={() => 'rgba(57, 78, 56, 0.78)'}
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
