export const italyMemorySourceSlugs = [
  'verona',
  'venice',
  'florence',
  'san-gimignano',
  'orvieto',
  'pompei',
  'sorrento',
  'capri',
  'rome',
  'vatican-city',
] as const

export const groupedMemoryDestinations = [
  {
    collection: 'europe',
    slug: 'italy',
    name: 'Italy',
    sourceSlugs: italyMemorySourceSlugs,
    sectionEverySource: true,
  },
] as const
