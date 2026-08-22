import europeMemories from '../../content/memories/europe/index.json'
import asiaMemories from '../../content/memories/asia/index.json'

export type AtlasPlace = {
  slug: string
  name: string
  lat: number
  lng: number
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
    type: 'home',
  },
  {
    slug: 'tashkent',
    name: 'Tashkent',
    lat: 41.2995,
    lng: 69.2401,
    type: 'home',
  },
  {
    slug: 'st-petersburg',
    name: 'St. Petersburg',
    lat: 59.9311,
    lng: 30.3609,
    years: '2008–2011',
    type: 'home',
  },
  {
    slug: 'daejeon',
    name: 'Daejeon',
    lat: 36.3504,
    lng: 127.3845,
    type: 'home',
  },
  {
    slug: 'tokyo',
    name: 'Tokyo',
    lat: 35.6762,
    lng: 139.6503,
    type: 'visited',
  },
  {
    slug: 'london',
    name: 'London',
    lat: 51.5072,
    lng: -0.1276,
    type: 'visited',
  },
  {
    slug: 'paris',
    name: 'Paris',
    lat: 48.8566,
    lng: 2.3522,
    type: 'visited',
  },
  {
    slug: 'italy',
    name: 'Italy',
    lat: 42.8333,
    lng: 12.8333,
    type: 'visited',
    memorySlug: 'italy',
  },
  {
    slug: 'interlaken',
    name: 'Interlaken',
    lat: 46.6863,
    lng: 7.8632,
    type: 'visited',
  },
  {
    slug: 'toronto',
    name: 'Toronto',
    lat: 43.6532,
    lng: -79.3832,
    type: 'home',
  },
  {
    slug: 'mont-st-michel',
    name: 'Mont St. Michel',
    lat: 48.636,
    lng: -1.5115,
    type: 'visited',
  },
  {
    slug: 'san-francisco',
    name: 'San Francisco',
    lat: 37.7749,
    lng: -122.4194,
    type: 'visited',
  },
  {
    slug: 'las-vegas',
    name: 'Las Vegas',
    lat: 36.1699,
    lng: -115.1398,
    type: 'visited',
  },
  {
    slug: 'orlando',
    name: 'Orlando',
    lat: 28.5383,
    lng: -81.3792,
    type: 'visited',
  },
  {
    slug: 'route-66',
    name: 'Route 66',
    lat: 35.222,
    lng: -101.8313,
    type: 'visited',
  },
  {
    slug: 'new-mexico',
    name: 'New Mexico',
    lat: 34.402,
    lng: -106.112,
    type: 'visited',
  },
  {
    slug: 'anaheim',
    name: 'Anaheim',
    lat: 33.8366,
    lng: -117.9143,
    type: 'visited',
  },
  {
    slug: 'los-angeles',
    name: 'Los Angeles',
    lat: 34.0522,
    lng: -118.2437,
    type: 'visited',
  },
  {
    slug: 'ho-chi-minh-city',
    name: 'Ho Chi Minh City',
    lat: 10.8231,
    lng: 106.6297,
    type: 'visited',
  },
  {
    slug: 'hanoi',
    name: 'Hanoi',
    lat: 21.0278,
    lng: 105.8342,
    type: 'visited',
  },
  {
    slug: 'hong-kong',
    name: 'Hong Kong',
    lat: 22.3193,
    lng: 114.1694,
    type: 'visited',
  },
  {
    slug: 'manila',
    name: 'Manila',
    lat: 14.5995,
    lng: 120.9842,
    type: 'visited',
  },
  {
    slug: 'sydney',
    name: 'Sydney',
    lat: -33.8688,
    lng: 151.2093,
    type: 'visited',
  },
  {
    slug: 'bangkok',
    name: 'Bangkok',
    lat: 13.7563,
    lng: 100.5018,
    type: 'visited',
  },
  {
    slug: 'shanghai',
    name: 'Shanghai',
    lat: 31.2304,
    lng: 121.4737,
    type: 'visited',
  },
  {
    slug: 'beijing',
    name: 'Beijing',
    lat: 39.9042,
    lng: 116.4074,
    type: 'visited',
  },
  {
    slug: 'qingdao',
    name: 'Qingdao',
    lat: 36.0671,
    lng: 120.3826,
    type: 'visited',
  },
  {
    slug: 'seoul',
    name: 'Seoul',
    lat: 37.5665,
    lng: 126.978,
    type: 'visited',
  },
  {
    slug: 'busan',
    name: 'Busan',
    lat: 35.1796,
    lng: 129.0756,
    type: 'visited',
  },
  {
    slug: 'jeju-island',
    name: 'Jeju Island',
    lat: 33.3617,
    lng: 126.5292,
    type: 'visited',
  },
  {
    slug: 'yellowknife',
    name: 'Yellowknife',
    lat: 62.454,
    lng: -114.3718,
    type: 'visited',
  },
  {
    slug: 'montreal',
    name: 'Montreal',
    lat: 45.5017,
    lng: -73.5673,
    type: 'visited',
  },
  {
    slug: 'banff',
    name: 'Banff',
    lat: 51.1784,
    lng: -115.5708,
    type: 'visited',
  },
  {
    slug: 'grand-canyon',
    name: 'Grand Canyon',
    lat: 36.1069,
    lng: -112.1129,
    type: 'visited',
  },
  {
    slug: 'new-york-city',
    name: 'New York City',
    lat: 40.7128,
    lng: -74.006,
    type: 'visited',
  },
  {
    slug: 'philadelphia',
    name: 'Philadelphia',
    lat: 39.9526,
    lng: -75.1652,
    type: 'visited',
  },
  {
    slug: 'cambridge-massachusetts',
    name: 'Cambridge, Massachusetts',
    lat: 42.3736,
    lng: -71.1097,
    type: 'visited',
  },
  {
    slug: 'new-haven',
    name: 'New Haven',
    lat: 41.3083,
    lng: -72.9279,
    type: 'visited',
  },
  {
    slug: 'new-jersey',
    name: 'New Jersey',
    lat: 40.3431,
    lng: -74.6514,
    type: 'visited',
  },
  {
    slug: 'washington-dc',
    name: 'Washington, D.C.',
    lat: 38.9072,
    lng: -77.0369,
    type: 'visited',
  },
  {
    slug: 'seattle',
    name: 'Seattle',
    lat: 47.6062,
    lng: -122.3321,
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
