/**
 * districts.js
 * Authoritative configuration for all 8 island districts and 6 IP sub-districts.
 * Coordinates are relative to the island SVG viewBox (0 0 1100 720).
 */

const DISTRICTS = {
  duplo: {
    id: 'duplo',
    label: 'Duplo',
    description: 'Pre-school building for the youngest LEGO fans. Bright, chunky, and safe since 1969.',
    cx: 310,
    cy: 250,
    color: '#e63946',
    accentColor: '#ff6b6b',
    motif: 'duplo',
    image: 'duplo.jpeg',       // photo shown inside the circle badge
    logo: 'duploLogo.png',     // logo shown below the badge (replaces text label)
    isFolder: false,
    matcher: row => row.themeGroup === 'Pre-school',
  },

  city: {
    id: 'city',
    label: 'City',
    description: 'Urban life, emergency services, and everyday adventures. Formerly called Town.',
    cx: 545,
    cy: 288,
    color: '#457b9d',
    accentColor: '#74b3ce',
    motif: 'city',
    image: 'city.jpg',
    logo: 'cityLogo.png',
    isFolder: false,
    matcher: row => ['City', 'Town', 'World City', 'City Airport'].includes(row.theme),
  },

  creator: {
    id: 'creator',
    label: 'Creator',
    description: 'Three-in-one sets spanning houses, vehicles, and creatures. Build anything.',
    cx: 795,
    cy: 215,
    color: '#f4a261',
    accentColor: '#ffb347',
    motif: 'creator',
    image: 'creator.png',
    logo: 'creatorLogo.svg.png',
    isFolder: false,
    matcher: row => ['Creator', 'Creator Expert'].includes(row.theme),
  },

  friends: {
    id: 'friends',
    label: 'Friends',
    description: 'Heartlake City and its cast of characters, introduced in 2012.',
    cx: 655,
    cy: 438,
    color: '#e76f51',
    accentColor: '#ffb3c1',
    motif: 'friends',
    image: 'friends.jpg',
    logo: 'friendsLogo.png',
    isFolder: false,
    matcher: row => row.theme === 'Friends',
  },

  technic: {
    id: 'technic',
    label: 'Technic',
    description: 'Gears, pneumatics, and real engineering principles since 1977.',
    cx: 870,
    cy: 352,
    color: '#264653',
    accentColor: '#2ec4b6',
    motif: 'technic',
    image: 'technic.jpg',
    logo: 'technicLogo.png',
    isFolder: false,
    matcher: row => row.theme === 'Technic',
  },

  architecture: {
    id: 'architecture',
    label: 'Architecture',
    description: 'Iconic landmarks and skylines reimagined in LEGO — from the Eiffel Tower to the Sydney Opera House.',
    cx: 310,
    cy: 390,
    color: '#52b788',
    accentColor: '#95d5b2',
    motif: 'basic',
    image: 'architecture.jpeg',
    logo: 'architectureLogo.png',
    isFolder: false,
    matcher: row => row.theme === 'Architecture',
  },

  space: {
    id: 'space',
    label: 'Space',
    description: 'Classic Space to galaxy exploration. From 1978 through 2015.',
    cx: 500,
    cy: 178,
    color: '#1d3557',
    accentColor: '#a8dadc',
    motif: 'space',
    image: 'space.png',
    logo: 'spaceLogo.png',
    isFolder: false,
    matcher: row => row.theme === 'Space',
  },

  ip: {
    id: 'ip',
    label: 'Licensed',
    description: 'Star Wars, Ninjago, Bionicle, Marvel, Chima, Harry Potter — and more.',
    cx: 870,
    cy: 600,
    color: '#7b2d8b',
    accentColor: '#c77dff',
    motif: 'ip',
    image: 'licensed.jpg',
    // logo: 'licensedLogo.png',  // add when available
    isFolder: true,
    // IP sets are spread across Licensed themeGroup + several Action/Adventure themes
    matcher: row =>
      row.themeGroup === 'Licensed' ||
      ['Ninjago', 'The LEGO Ninjago Movie', 'Legends of Chima', 'Bionicle',
        'HERO Factory', 'Ultra Agents', 'Agents', 'Monster Fighters',
        'Hidden Side', 'Overwatch', 'Ideas', 'BrickHeadz'].includes(row.theme),
  },
};

const IP_SUB_DISTRICTS = {
  starwars: {
    id: 'starwars',
    label: 'Star Wars',
    color: '#c9a84c',
    logo: 'starWarsLogo.png',
    matcher: row => row.theme === 'Star Wars',
  },
  ninjago: {
    id: 'ninjago',
    label: 'Ninjago',
    color: '#e63946',
    logo: 'ninjagoLogo.svg',
    matcher: row => ['Ninjago', 'The LEGO Ninjago Movie'].includes(row.theme),
  },
  bionicle: {
    id: 'bionicle',
    label: 'Bionicle',
    color: '#264653',
    logo: 'bionicleLogo.webp',
    matcher: row => ['Bionicle', 'HERO Factory'].includes(row.theme),
  },
  marvel: {
    id: 'marvel',
    label: 'Marvel',
    color: '#c1121f',
    logo: 'marvelLogo.png',
    matcher: row => ['Marvel Super Heroes', 'Spider-Man'].includes(row.theme),
  },
  chima: {
    id: 'chima',
    label: 'Chima',
    color: '#f4a261',
    logo: 'chimaLogo.png',
    matcher: row => row.theme === 'Legends of Chima',
  },
  harrypotter: {
    id: 'harrypotter',
    label: 'Harry Potter',
    color: '#4a0e8f',
    logo: 'harryPotterLogo.svg',
    matcher: row => row.theme === 'Harry Potter',
  },
};
