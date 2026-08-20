export type AtlasPlace = {
  slug: string
  name: string
  lat: number
  lng: number
  years?: string
  type: 'home' | 'visited'
  memorySlug?: string
}

export const atlasPlaces: AtlasPlace[] = [
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
    slug: 'orvieto',
    name: 'Orvieto',
    lat: 42.7185,
    lng: 12.1107,
    type: 'visited',
  },
  {
    slug: 'capri',
    name: 'Capri',
    lat: 40.5509,
    lng: 14.2429,
    type: 'visited',
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
    slug: 'jungfraujoch',
    name: 'Jungfraujoch',
    lat: 46.5475,
    lng: 7.9853,
    type: 'visited',
  },
  {
    slug: 'mont-st-michel',
    name: 'Mont St. Michel',
    lat: 48.636,
    lng: -1.5115,
    type: 'visited',
  },
  {
    slug: 'san-gimignano',
    name: 'San Gimignano',
    lat: 43.4677,
    lng: 11.0431,
    type: 'visited',
  },
  {
    slug: 'venice',
    name: 'Venice',
    lat: 45.4408,
    lng: 12.3155,
    type: 'visited',
  },
]
