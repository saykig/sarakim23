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
  {
    slug: 'san-francisco',
    name: 'San Francisco',
    lat: 37.7749,
    lng: -122.4194,
    displayOffset: [-14, -10],
    type: 'visited',
  },
  {
    slug: 'las-vegas',
    name: 'Las Vegas',
    lat: 36.1699,
    lng: -115.1398,
    displayOffset: [12, -18],
    type: 'visited',
  },
  {
    slug: 'orlando',
    name: 'Orlando',
    lat: 28.5383,
    lng: -81.3792,
    displayOffset: [12, 12],
    type: 'visited',
  },
  {
    slug: 'route-66',
    name: 'Route 66',
    lat: 35.222,
    lng: -101.8313,
    displayOffset: [10, 15],
    type: 'visited',
  },
  {
    slug: 'new-mexico',
    name: 'New Mexico',
    lat: 34.402,
    lng: -106.112,
    displayOffset: [-12, -16],
    type: 'visited',
  },
  {
    slug: 'anaheim',
    name: 'Anaheim',
    lat: 33.8366,
    lng: -117.9143,
    displayOffset: [20, 10],
    type: 'visited',
  },
  {
    slug: 'los-angeles',
    name: 'Los Angeles',
    lat: 34.0522,
    lng: -118.2437,
    displayOffset: [-18, -8],
    type: 'visited',
  },
  {
    slug: 'ho-chi-minh-city',
    name: 'Ho Chi Minh City',
    lat: 10.8231,
    lng: 106.6297,
    displayOffset: [-10, 18],
    type: 'visited',
  },
  {
    slug: 'hanoi',
    name: 'Hanoi',
    lat: 21.0278,
    lng: 105.8342,
    displayOffset: [-15, -20],
    type: 'visited',
  },
  {
    slug: 'hong-kong',
    name: 'Hong Kong',
    lat: 22.3193,
    lng: 114.1694,
    displayOffset: [15, 12],
    type: 'visited',
  },
  {
    slug: 'manila',
    name: 'Manila',
    lat: 14.5995,
    lng: 120.9842,
    displayOffset: [12, 18],
    type: 'visited',
  },
  {
    slug: 'sydney',
    name: 'Sydney',
    lat: -33.8688,
    lng: 151.2093,
    displayOffset: [14, 10],
    type: 'visited',
  },
  {
    slug: 'bangkok',
    name: 'Bangkok',
    lat: 13.7563,
    lng: 100.5018,
    displayOffset: [-18, 4],
    type: 'visited',
  },
  {
    slug: 'shanghai',
    name: 'Shanghai',
    lat: 31.2304,
    lng: 121.4737,
    displayOffset: [18, -6],
    type: 'visited',
  },
  {
    slug: 'beijing',
    name: 'Beijing',
    lat: 39.9042,
    lng: 116.4074,
    displayOffset: [-14, -20],
    type: 'visited',
  },
  {
    slug: 'qingdao',
    name: 'Qingdao',
    lat: 36.0671,
    lng: 120.3826,
    displayOffset: [18, 18],
    type: 'visited',
  },
  {
    slug: 'seoul',
    name: 'Seoul',
    lat: 37.5665,
    lng: 126.978,
    displayOffset: [-15, -10],
    type: 'visited',
  },
  {
    slug: 'busan',
    name: 'Busan',
    lat: 35.1796,
    lng: 129.0756,
    displayOffset: [18, 15],
    type: 'visited',
  },
  {
    slug: 'jeju-island',
    name: 'Jeju Island',
    lat: 33.3617,
    lng: 126.5292,
    displayOffset: [0, 25],
    type: 'visited',
  },
  {
    slug: 'yellowknife',
    name: 'Yellowknife',
    lat: 62.454,
    lng: -114.3718,
    displayOffset: [10, -10],
    type: 'visited',
  },
  {
    slug: 'montreal',
    name: 'Montreal',
    lat: 45.5017,
    lng: -73.5673,
    displayOffset: [12, 10],
    type: 'visited',
  },
  {
    slug: 'banff',
    name: 'Banff',
    lat: 51.1784,
    lng: -115.5708,
    displayOffset: [12, -10],
    type: 'visited',
  },
  {
    slug: 'grand-canyon',
    name: 'Grand Canyon',
    lat: 36.1069,
    lng: -112.1129,
    displayOffset: [20, 15],
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
