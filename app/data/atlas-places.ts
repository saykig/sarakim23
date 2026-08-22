import europeMemories from '../../content/memories/europe/index.json'
import asiaMemories from '../../content/memories/asia/index.json'

export type AtlasPlace = {
  slug: string
  name: string
  lat: number
  lng: number
  /** Screen-space presentation offset; the geographic anchor remains lat/lng. */
  displayOffset?: readonly [number, number]
  years?: string
  type: 'home' | 'visited'
  memorySlug?: string
}

const places: AtlasPlace[] = [
  {
    slug: 'vancouver',
    name: 'Vancouver',
    lat: 49.2827,
    lng: -123.1207,
    displayOffset: [-10, -8],
    type: 'home',
  },
  {
    slug: 'tashkent',
    name: 'Tashkent',
    lat: 41.2995,
    lng: 69.2401,
    displayOffset: [10, -10],
    type: 'home',
  },
  {
    slug: 'st-petersburg',
    name: 'St. Petersburg',
    lat: 59.9311,
    lng: 30.3609,
    displayOffset: [12, -12],
    years: '2008–2011',
    type: 'home',
  },
  {
    slug: 'daejeon',
    name: 'Daejeon',
    lat: 36.3504,
    lng: 127.3845,
    displayOffset: [10, -8],
    type: 'home',
  },
  {
    slug: 'tokyo',
    name: 'Tokyo',
    lat: 35.6762,
    lng: 139.6503,
    displayOffset: [14, 10],
    type: 'visited',
  },
  {
    slug: 'london',
    name: 'London',
    lat: 51.5072,
    lng: -0.1276,
    displayOffset: [-26, -22],
    type: 'visited',
  },
  {
    slug: 'paris',
    name: 'Paris',
    lat: 48.8566,
    lng: 2.3522,
    displayOffset: [-12, 16],
    type: 'visited',
  },
  {
    slug: 'italy',
    name: 'Italy',
    lat: 42.8333,
    lng: 12.8333,
    displayOffset: [20, 26],
    type: 'visited',
    memorySlug: 'italy',
  },
  {
    slug: 'interlaken',
    name: 'Interlaken',
    lat: 46.6863,
    lng: 7.8632,
    displayOffset: [-10, -38],
    type: 'visited',
  },
  {
    slug: 'toronto',
    name: 'Toronto',
    lat: 43.6532,
    lng: -79.3832,
    displayOffset: [-10, -8],
    type: 'home',
  },
  {
    slug: 'jungfraujoch',
    name: 'Jungfraujoch',
    lat: 46.5475,
    lng: 7.9853,
    displayOffset: [28, -18],
    type: 'visited',
  },
  {
    slug: 'mont-st-michel',
    name: 'Mont St. Michel',
    lat: 48.636,
    lng: -1.5115,
    displayOffset: [-38, 12],
    type: 'visited',
  },
]

const importedMemorySlugs = new Set(
  [...europeMemories.locations, ...asiaMemories.locations]
    .filter(
      (location) =>
        location.photoCount > 0 ||
        ('videoCount' in location &&
          typeof location.videoCount === 'number' &&
          location.videoCount > 0)
    )
    .map((location) => location.slug)
)

export const atlasPlaces: AtlasPlace[] = places.map((place) => ({
  ...place,
  ...(importedMemorySlugs.has(place.slug) ? { memorySlug: place.slug } : {}),
}))
