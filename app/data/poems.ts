export type PoemLine = {
  text: string
  indent?: 1 | 2
  italic?: boolean
}

export type TextPoem = {
  kind: 'text'
  stanzas: PoemLine[][]
}

export type ImagePoem = {
  kind: 'image'
  src: string
  width: number
  height: number
  alt: string
}

export type Poem = {
  id: string
  title: string
  content: TextPoem | ImagePoem
}

const lines = (...text: string[]): PoemLine[] => text.map((line) => ({ text: line }))

export const poems: Poem[] = [
  {
    id: 'filed-beneath-the-moon',
    title: 'Filed Beneath the Moon',
    content: {
      kind: 'text',
      stanzas: [
        lines(
          'The meadow keeps a golden thread',
          'of every footstep, every spring;',
          'beneath the clover, softly spread,',
          'old songs awake and learn to sing.'
        ),
        lines(
          'And I, who came with empty hands,',
          'depart with dusk upon my sleeve;',
          'for beauty gives no harsh commands,',
          'but teaches those who stay to grieve.'
        ),
        lines(
          'I walked where silver nettles shone',
          'beside the rain-soft orchard wall;',
          'the moon had made the world her own',
          'and named each trembling leaf and all.'
        ),
        lines(
          'No voice but water, low and clear,',
          'no lamp but dew upon the thorn;',
          'yet something vast and bright drew near',
          'as if the soul itself were born.'
        ),
      ],
    },
  },
  {
    id: 'patterns-against-distance',
    title: 'Patterns Against Distance',
    content: {
      kind: 'text',
      stanzas: [
        lines(
          'three bodies suspended',
          'in arrangements older than language',
          'and somehow',
          'I still thought they meant something'
        ),
        lines(
          'as if the sky believed in symmetry',
          'when really',
          'it was only me'
        ),
        lines(
          'I kept drawing lines between them',
          'as though the universe',
          'had placed them there for me'
        ),
        lines(
          'maybe alignment is only visible',
          'from one precise place,',
          'at one precise moment',
          'before everything drifts apart again'
        ),
        lines('And'),
        lines('I see you now', 'though maybe not tomorrow'),
        lines('this year,', 'but maybe not the next'),
        lines('our lives crossing briefly'),
        lines(
          'until somewhere further ahead—',
          'time pulls us back',
          'into the same line again'
        ),
        lines('in the impossible geometry', 'of being alive at once'),
        lines('here we are', 'aligned', 'in time,', 'in space'),
      ],
    },
  },
  {
    id: 'i-miss',
    title: 'I miss',
    content: {
      kind: 'image',
      src: '/images/poetry/i-miss.jpeg',
      width: 809,
      height: 2106,
      alt: 'The visual poem “I miss,” set around two photographs of remembered places.',
    },
  },
  {
    id: 'the-stars-do-not-know',
    title: 'The stars do not know',
    content: {
      kind: 'text',
      stanzas: [
        lines(
          'we’ve heard about the stars.',
          'we’ve even named them.',
          'but the stars don’t know us—',
          'they don’t know me.',
          'they don’t even know my name.',
          'i guess then, that means',
          'i cannot exist without the stars,',
          'but the stars continue to exist without me.'
        ),
      ],
    },
  },
  {
    id: 'how-will-i-know',
    title: 'How Will I Know',
    content: {
      kind: 'text',
      stanzas: [
        lines('how will i know they’ll always be,', 'when will i know my time will be?'),
        lines('in wuthering days i wallow', 'they say', 'don’t look back,', 'nor trouble the morrow'),
        lines(
          'yet i cannot help',
          'but be twenty steps forward,',
          'nineteen steps back,',
          'as if one step',
          'could fix the sorrow.'
        ),
        lines(
          'yet here i am,',
          'twenty steps forward,',
          'nineteen steps back,',
          'as though the one between',
          'might spare me sorrow.'
        ),
        lines('how will i know the love will be', 'when gone,', 'they’ll wait for me?'),
        lines('how will i know my love will be', 'when distance calls—', 'will my heart still be?'),
        lines('the answer is neither satisfactory', 'nor calming'),
        lines('so onward you have to go', 'onward is all you know'),
        [{ text: '(backwards is all i know)', italic: true }],
        lines('the wuthering wallows', 'the sorrows of moors', 'today, tomorrow, and yesterday'),
        [
          { text: 'will either stay' },
          { text: 'or go', indent: 1 },
        ],
        [
          { text: 'regardless of what follows,' },
          { text: 'soon enough, it will be known:' },
          { text: 'not who will always remain,', indent: 1 },
          { text: 'nor when our time comes' },
          { text: 'nor should such things be known' },
        ],
        [
          { text: 'and soon the sorrow' },
          { text: 'will be overshadowed' },
          { text: 'love beyond its means', indent: 1 },
          { text: 'care beyond the horizons', indent: 2 },
          { text: 'only that no heart' },
          { text: 'was made to hold' },
          { text: 'the whole of tomorrow' },
        ],
        lines('you’ll find solitude', 'in what you quest for', 'in what you call unknown'),
        lines('soon you shall discover'),
        lines('they will always be,', 'you will always be.'),
      ],
    },
  },
  {
    id: 'polaroids',
    title: 'Polaroids',
    content: {
      kind: 'image',
      src: '/images/poetry/polaroids.jpeg',
      width: 1242,
      height: 1564,
      alt: 'The visual poem “Polaroids,” in white type on a black field.',
    },
  },
  {
    id: 'i-wandered-through-the-sea',
    title: 'I Wandered Through the Sea',
    content: {
      kind: 'text',
      stanzas: [
        lines(
          'I wandered through the sea,',
          'the sun waylaying',
          'at the edge of the world,',
          'as it said goodnight',
          'and laid its head to sleep.'
        ),
        lines(
          'I journeyed through the waves',
          'as the moon lit up the path,',
          'as if it knew',
          'the voyage I had taken on, and where I’d be drawn'
        ),
        lines(
          'With fragments of the sun',
          'so gently borrowed,',
          'half her face, innocent',
          'and almost sly,',
          'hid behind',
          'the blue earth’s shadow'
        ),
        lines(
          'I glimmered through the waters,',
          'as though I moved in quiet accord',
          'from dear Titan Selene',
          'for meek and gentle tides.'
        ),
        lines(
          'Soon I became unaware',
          'of the path I was taking,',
          'lost in that monochrome',
          'of blue, grey, and black'
        ),
        lines(
          'Slowly, I was taken in',
          'by the beauty',
          'of those vast blue sheets,',
          'by the glimmers of moonlight',
          'and the stars that danced',
          'on the sharp crests of the waves'
        ),
        lines(
          'I wandered through the sea',
          'until I had gone so far',
          'that I became a tiny creature,',
          'meaningless,',
          'yet somehow meaningful,'
        ),
        lines(
          'held among the rise and fall',
          'of waves in their obedience',
          'to the moon.'
        ),
      ],
    },
  },
  {
    id: 'the-space-between-us',
    title: 'The Space Between Us',
    content: {
      kind: 'image',
      src: '/images/poetry/the-space-between-us.jpeg',
      width: 718,
      height: 1967,
      alt: 'The visual poem “The Space Between Us,” arranged around a twilight photograph.',
    },
  },
  {
    id: 'the-passage-of-time',
    title: 'The Passage of Time',
    content: {
      kind: 'image',
      src: '/images/poetry/the-passage-of-time.jpeg',
      width: 928,
      height: 1472,
      alt: 'The visual poem “The Passage of Time,” in white type on a black field.',
    },
  },
  {
    id: 'see-through',
    title: 'See-through',
    content: {
      kind: 'image',
      src: '/images/poetry/see-through.jpeg',
      width: 786,
      height: 1457,
      alt: 'The visual poem “See-through,” combining spatial typography with a message screenshot.',
    },
  },
]
