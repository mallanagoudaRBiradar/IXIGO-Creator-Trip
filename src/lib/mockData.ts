// ---------------------------------------------------------------------------
// Mock ecosystem. In production these come from ixigo / AbhiBus / ConfirmTkt
// inventory via MCP servers. Shapes here mirror what that layer would return.
// ---------------------------------------------------------------------------

export type Mode = 'flight' | 'bus' | 'train'
export type Tier = 'budget' | 'standard' | 'luxury'

export interface City {
  id: string
  name: string
  code: string
  lat: number
  lng: number
}

export interface Stay {
  name: string
  area: string
  img: string
  pricePerNight: number
  rating: number
  perks: string[]
}

export interface Experience {
  id: string
  title: string
  price: number // per person
  duration: string
  emoji: string
}

export type PinKind = 'cafe' | 'viewpoint' | 'beach' | 'food' | 'activity' | 'heritage'

export interface Pin {
  day: number
  time: string
  name: string
  kind: PinKind
  note: string
  lat: number
  lng: number
}

export interface Creator {
  handle: string
  name: string
  subscribers: number
  tier: 'Scout' | 'Voyager' | 'Guru'
  hue: [string, string]
  bio: string
  home: string
  joined: string
}

export interface Reel {
  id: string
  destination: City & { state: string }
  title: string
  caption: string
  creator: Creator
  vibes: string[]
  days: number
  nights: number
  scenes: { img: string; caption: string }[]
  music: string
  likes: number
  comments: number
  clones: number
  views: string
  recommendedMode: Mode
  recommendedTier: Tier
  stays: Record<Tier, Stay>
  experiences: Experience[]
  pins: Pin[]
  fallback: [string, string] // gradient shown while images load or if offline
}

export const img = (id: string, w = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=72`

export const CITIES: City[] = [
  { id: 'hyd', name: 'Hyderabad', code: 'HYD', lat: 17.385, lng: 78.4867 },
  { id: 'del', name: 'Delhi', code: 'DEL', lat: 28.6139, lng: 77.209 },
  { id: 'bom', name: 'Mumbai', code: 'BOM', lat: 19.076, lng: 72.8777 },
  { id: 'blr', name: 'Bengaluru', code: 'BLR', lat: 12.9716, lng: 77.5946 },
  { id: 'maa', name: 'Chennai', code: 'MAA', lat: 13.0827, lng: 80.2707 },
  { id: 'ccu', name: 'Kolkata', code: 'CCU', lat: 22.5726, lng: 88.3639 },
  { id: 'pnq', name: 'Pune', code: 'PNQ', lat: 18.5204, lng: 73.8567 },
  { id: 'amd', name: 'Ahmedabad', code: 'AMD', lat: 23.0225, lng: 72.5714 },
  { id: 'cok', name: 'Kochi', code: 'COK', lat: 9.9312, lng: 76.2673 },
  { id: 'lko', name: 'Lucknow', code: 'LKO', lat: 26.8467, lng: 80.9462 },
]

const creators: Record<string, Creator> = {
  meera: {
    handle: 'mallanagouda.biradar', name: 'Mallanagouda R Biradar', subscribers: 412000, tier: 'Guru', hue: ['#F57224', '#E8384F'],
    bio: 'Slow luxury on a sensible budget. Beaches, pool villas and the shacks the locals actually eat at. Every trip on this channel is PNR-verified.',
    home: 'Hyderabad', joined: 'Mar 2023',
  },
  arjun: {
    handle: 'arjun.backpacks', name: 'Arjun Rao', subscribers: 86000, tier: 'Voyager', hue: ['#14B87A', '#38D9C0'],
    bio: 'Sleeper buses, hostel bunks and trails. Showing you how far ₹6,000 really goes.',
    home: 'Bengaluru', joined: 'Aug 2024',
  },
  zoya: {
    handle: 'chitra.jagadal', name: 'Chitra Jagadal', subscribers: 128000, tier: 'Voyager', hue: ['#8B5CF6', '#F57224'],
    bio: 'Heritage stays, overnight trains and food walks. Rajasthan is my second home.',
    home: 'Delhi', joined: 'Jan 2024',
  },
  kabir: {
    handle: 'slowkabir', name: 'Kabir Menon', subscribers: 54000, tier: 'Scout', hue: ['#0EA5E9', '#14B87A'],
    bio: 'Backwaters, monsoons and long lunches. Travel slower, see more.',
    home: 'Kochi', joined: 'Nov 2024',
  },
  tara: {
    handle: 'tara.on.trails', name: 'Tara Negi', subscribers: 203000, tier: 'Guru', hue: ['#F59E0B', '#F57224'],
    bio: 'Mountain girl. Rafting, treks and quiet ghats. Solo-travel friendly itineraries only.',
    home: 'Dehradun', joined: 'Jun 2023',
  },
}

export const CREATORS: Creator[] = Object.values(creators)

export const REELS: Reel[] = [
  {
    id: 'goa-luxe',
    destination: { id: 'goa', name: 'South Goa', state: 'Goa', code: 'GOI', lat: 15.2993, lng: 74.124 },
    title: '4 slow days in South Goa',
    caption: 'Skip Baga. South Goa is where the quiet beaches, private pools and sunset shacks are. Every booking here is exactly what I did.',
    creator: creators.meera,
    vibes: ['LuxuryGoa', 'Couples', 'BeachDays'],
    days: 4,
    nights: 3,
    scenes: [
      { img: img('1512343879784-a960bf40e7f2'), caption: 'Palolem at 7am. Nobody here yet.' },
      { img: img('1520250497591-112f2f40a3f4'), caption: 'Our pool villa, booked on ixigo' },
      { img: img('1507525428034-b723cf961d3e'), caption: 'Butterfly Beach by boat' },
      { img: img('1519046904884-53103b34b206'), caption: 'Sunset feni at Agonda' },
    ],
    music: 'Sunset Konkani Lofi',
    likes: 48200,
    comments: 1240,
    clones: 1820,
    views: '2.1M',
    recommendedMode: 'flight',
    recommendedTier: 'luxury',
    stays: {
      budget: { name: 'The Hosteller Agonda', area: 'Agonda', img: img('1555854877-bab0e564b8d5'), pricePerNight: 1100, rating: 4.3, perks: ['Beach 2 min', 'Café on site'] },
      standard: { name: 'Palolem Bay Cottages', area: 'Palolem', img: img('1582719478250-c89cae4dc85b'), pricePerNight: 4200, rating: 4.4, perks: ['Sea-facing', 'Breakfast'] },
      luxury: { name: 'Cabo Serai Pool Villas', area: 'Cabo de Rama', img: img('1566073771259-6a8506099945'), pricePerNight: 14500, rating: 4.8, perks: ['Private pool', 'Breakfast', 'Airport pickup'] },
    },
    experiences: [
      { id: 'g1', title: 'Butterfly Beach boat ride', price: 900, duration: '2 hrs', emoji: '🚤' },
      { id: 'g2', title: 'Sunset kayak in Talpona', price: 1400, duration: '90 min', emoji: '🛶' },
      { id: 'g3', title: 'Goan home-cooked dinner', price: 1800, duration: '3 hrs', emoji: '🍛' },
    ],
    pins: [
      { day: 1, time: '17:30', name: 'Cola Beach lagoon', kind: 'beach', note: 'Walk down before 6, the lagoon glows at sunset.', lat: 15.0478, lng: 73.9757 },
      { day: 1, time: '20:00', name: 'Ourem 88', kind: 'food', note: 'Book ahead. Get the beef tenderloin or the crab.', lat: 15.0097, lng: 74.0233 },
      { day: 2, time: '07:00', name: 'Palolem Beach', kind: 'beach', note: 'Mornings are empty and the water is glass.', lat: 15.0089, lng: 74.0199 },
      { day: 2, time: '11:00', name: 'Café Inn Palolem', kind: 'cafe', note: 'Cold coffee plus their banana pancakes.', lat: 15.0112, lng: 74.0247 },
      { day: 2, time: '16:00', name: 'Butterfly Beach', kind: 'viewpoint', note: 'Only reachable by boat. Dolphins on the way.', lat: 15.0196, lng: 74.0028 },
      { day: 3, time: '10:00', name: 'Cabo de Rama Fort', kind: 'heritage', note: 'Clifftop ruins with the best view in South Goa.', lat: 15.0886, lng: 73.9206 },
      { day: 3, time: '18:30', name: 'Agonda shacks', kind: 'food', note: 'Any shack works. Order kingfish thali.', lat: 15.0434, lng: 73.9866 },
    ],
    fallback: ['#F57224', '#0EA5E9'],
  },
  {
    id: 'gokarna-pack',
    destination: { id: 'gok', name: 'Gokarna', state: 'Karnataka', code: 'GOK', lat: 14.5479, lng: 74.3188 },
    title: 'Gokarna on ₹6k, beach trek included',
    caption: 'Overnight AbhiBus, a Zostel bunk and the five-beach trek. Cheapest coastline trip I have done and still my favourite.',
    creator: creators.arjun,
    vibes: ['Backpacker', 'SoloTravel', 'Trek'],
    days: 3,
    nights: 2,
    scenes: [
      { img: img('1506953823976-52e1fdc0149a'), caption: 'Om Beach from the cliff trail' },
      { img: img('1469854523086-cc02fe5d8800'), caption: 'Sleeper bus there, ₹980' },
      { img: img('1504280390367-361c6d9f38f4'), caption: 'Camped at Paradise Beach' },
      { img: img('1500530855697-b586d89ba3ee'), caption: 'Five beaches in one day' },
    ],
    music: 'Backpack Anthem (Sped Up)',
    likes: 21500,
    comments: 860,
    clones: 640,
    views: '780K',
    recommendedMode: 'bus',
    recommendedTier: 'budget',
    stays: {
      budget: { name: 'Zostel Gokarna', area: 'Kudle Beach', img: img('1555854877-bab0e564b8d5'), pricePerNight: 750, rating: 4.6, perks: ['Bunk bed', 'Sea view deck'] },
      standard: { name: 'Namaste Café Rooms', area: 'Om Beach', img: img('1590490360182-c33d57733427'), pricePerNight: 2600, rating: 4.3, perks: ['Private room', 'Beachfront'] },
      luxury: { name: 'SwaSwara Wellness Resort', area: 'Om Beach', img: img('1540541338287-41700207dee6'), pricePerNight: 12800, rating: 4.7, perks: ['Yoga sessions', 'All meals'] },
    },
    experiences: [
      { id: 'k1', title: 'Five-beach guided trek', price: 600, duration: '6 hrs', emoji: '🥾' },
      { id: 'k2', title: 'Paradise Beach camping', price: 1200, duration: 'Overnight', emoji: '⛺' },
      { id: 'k3', title: 'Surf lesson at Om Beach', price: 1500, duration: '2 hrs', emoji: '🏄' },
    ],
    pins: [
      { day: 1, time: '09:00', name: 'Mahabaleshwar Temple', kind: 'heritage', note: 'Go early, the town street wakes up around it.', lat: 14.5395, lng: 74.317 },
      { day: 1, time: '13:00', name: 'Namaste Café', kind: 'cafe', note: 'Israeli platter and a fresh lime soda.', lat: 14.5194, lng: 74.3237 },
      { day: 1, time: '18:00', name: 'Kudle cliff', kind: 'viewpoint', note: 'Sit on the rocks at the south end for sunset.', lat: 14.5297, lng: 74.3172 },
      { day: 2, time: '07:00', name: 'Om Beach', kind: 'beach', note: 'Start of the five-beach trek. Carry 2L water.', lat: 14.519, lng: 74.326 },
      { day: 2, time: '12:00', name: 'Half Moon Beach', kind: 'beach', note: 'Lunch at the only shack. Cash only.', lat: 14.5115, lng: 74.329 },
      { day: 2, time: '17:00', name: 'Paradise Beach', kind: 'activity', note: 'Camp here or take the boat back for ₹300.', lat: 14.5045, lng: 74.333 },
    ],
    fallback: ['#14B87A', '#0D1840'],
  },
  {
    id: 'jaipur-heritage',
    destination: { id: 'jai', name: 'Jaipur', state: 'Rajasthan', code: 'JAI', lat: 26.9124, lng: 75.7873 },
    title: 'Jaipur like royalty, by train',
    caption: 'Took the overnight train with a ConfirmTkt prediction that said 92%. It confirmed. Stayed in a 200-year-old haveli.',
    creator: creators.zoya,
    vibes: ['Heritage', 'Culture', 'Foodie'],
    days: 3,
    nights: 2,
    scenes: [
      { img: img('1477587458883-47145ed94245'), caption: 'Hawa Mahal at golden hour' },
      { img: img('1599661046289-e31897846e41'), caption: 'Amber Fort, before the crowds' },
      { img: img('1542314831-068cd1dbfeeb'), caption: 'Our haveli courtyard' },
      { img: img('1524492412937-b28074a5d7da'), caption: 'Day trip energy only' },
    ],
    music: 'Kesariya Strings (Instrumental)',
    likes: 33900,
    comments: 990,
    clones: 142,
    views: '1.3M',
    recommendedMode: 'train',
    recommendedTier: 'standard',
    stays: {
      budget: { name: 'Moustache Jaipur', area: 'Bani Park', img: img('1555854877-bab0e564b8d5'), pricePerNight: 900, rating: 4.4, perks: ['Rooftop café', 'Walking tours'] },
      standard: { name: 'Haveli Dharampura', area: 'Old City', img: img('1551882547-ff40c63fe5fa'), pricePerNight: 5400, rating: 4.7, perks: ['Heritage haveli', 'Rooftop dinner'] },
      luxury: { name: 'Samode Palace Suites', area: 'Samode', img: img('1571896349842-33c89424de2d'), pricePerNight: 18900, rating: 4.9, perks: ['Palace stay', 'Butler', 'Spa'] },
    },
    experiences: [
      { id: 'j1', title: 'Old city food walk', price: 1100, duration: '3 hrs', emoji: '🥘' },
      { id: 'j2', title: 'Block-printing workshop', price: 1300, duration: '2 hrs', emoji: '🎨' },
      { id: 'j3', title: 'Hot-air balloon at sunrise', price: 11500, duration: '1 hr', emoji: '🎈' },
    ],
    pins: [
      { day: 1, time: '08:00', name: 'Hawa Mahal from Wind View Café', kind: 'viewpoint', note: 'The café opposite has the frame you see in my reel.', lat: 26.9239, lng: 75.8267 },
      { day: 1, time: '13:00', name: 'LMB, Johari Bazaar', kind: 'food', note: 'Ghewar and the dal kachori. Do not skip.', lat: 26.9196, lng: 75.8235 },
      { day: 1, time: '18:00', name: 'Nahargarh Fort', kind: 'viewpoint', note: 'Sunset over the pink city. Cab back after dark.', lat: 26.9373, lng: 75.8155 },
      { day: 2, time: '07:30', name: 'Amber Fort', kind: 'heritage', note: 'First entry slot. Sheesh Mahal before the tour groups.', lat: 26.9855, lng: 75.8513 },
      { day: 2, time: '12:30', name: 'Tapri Central', kind: 'cafe', note: 'Masala chai with a view of the Central Park.', lat: 26.903, lng: 75.806 },
      { day: 2, time: '16:00', name: 'Patrika Gate', kind: 'heritage', note: 'Most colourful gate in India. Weekdays are quieter.', lat: 26.8429, lng: 75.8016 },
    ],
    fallback: ['#E8384F', '#F59E0B'],
  },
  {
    id: 'alleppey-slow',
    destination: { id: 'alp', name: 'Alleppey', state: 'Kerala', code: 'ALP', lat: 9.4981, lng: 76.3388 },
    title: 'A houseboat weekend in Alleppey',
    caption: 'Flew into Kochi, two hours to the backwaters, then nothing to do but eat karimeen and watch the palms go by.',
    creator: creators.kabir,
    vibes: ['SlowTravel', 'Couples', 'Nature'],
    days: 3,
    nights: 2,
    scenes: [
      { img: img('1602216056096-3b40cc0c9944'), caption: 'Day one on the houseboat' },
      { img: img('1593693397690-362cb9666fc2'), caption: 'Backwater villages by canoe' },
      { img: img('1445019980597-93fa8acb246c'), caption: 'Lake-view room for night two' },
    ],
    music: 'Monsoon Ragas',
    likes: 15800,
    comments: 410,
    clones: 290,
    views: '420K',
    recommendedMode: 'flight',
    recommendedTier: 'standard',
    stays: {
      budget: { name: 'Zostel Alleppey', area: 'Alleppey Beach', img: img('1555854877-bab0e564b8d5'), pricePerNight: 800, rating: 4.5, perks: ['Beach walk', 'Bike rental'] },
      standard: { name: 'Lakeside Houseboat + Lodge', area: 'Punnamada Lake', img: img('1445019980597-93fa8acb246c'), pricePerNight: 6800, rating: 4.6, perks: ['1 night houseboat', 'All meals on boat'] },
      luxury: { name: 'Kumarakom Lake Villas', area: 'Kumarakom', img: img('1596394516093-501ba68a0ba6'), pricePerNight: 21000, rating: 4.9, perks: ['Private pool', 'Ayurveda spa'] },
    },
    experiences: [
      { id: 'a1', title: 'Village canoe at dawn', price: 700, duration: '2 hrs', emoji: '🛶' },
      { id: 'a2', title: 'Toddy shop lunch', price: 650, duration: '2 hrs', emoji: '🥥' },
      { id: 'a3', title: 'Ayurvedic massage', price: 2400, duration: '1 hr', emoji: '🌿' },
    ],
    pins: [
      { day: 1, time: '12:00', name: 'Finishing Point jetty', kind: 'activity', note: 'Board here. Ask for the upper-deck table.', lat: 9.497, lng: 76.34 },
      { day: 1, time: '18:00', name: 'Vembanad lake sunset', kind: 'viewpoint', note: 'The boat anchors here, best colours of the trip.', lat: 9.59, lng: 76.38 },
      { day: 2, time: '06:30', name: 'Kainakary canals', kind: 'activity', note: 'Small canoe through narrow canals, total silence.', lat: 9.483, lng: 76.365 },
      { day: 2, time: '13:00', name: 'Thaff Restaurant', kind: 'food', note: 'Pearl spot fry and Kerala parotta.', lat: 9.499, lng: 76.33 },
      { day: 2, time: '17:00', name: 'Alleppey Beach', kind: 'beach', note: 'Old pier at sunset and kappa chips from carts.', lat: 9.493, lng: 76.317 },
    ],
    fallback: ['#14B87A', '#0EA5E9'],
  },
  {
    id: 'rishikesh-soul',
    destination: { id: 'rsk', name: 'Rishikesh', state: 'Uttarakhand', code: 'RSK', lat: 30.0869, lng: 78.2676 },
    title: 'Rishikesh reset: rafting, aarti, cafés',
    caption: 'Rafted the 16 km stretch, did the Ganga aarti twice, and drank way too many ginger lemon honeys. Overnight bus from Delhi.',
    creator: creators.tara,
    vibes: ['Spiritual', 'Adventure', 'SoloTravel'],
    days: 3,
    nights: 2,
    scenes: [
      { img: img('1464822759023-fed622ff2c3b'), caption: 'Foothills on the drive in' },
      { img: img('1506126613408-eca07ce68773'), caption: 'Sunrise yoga by the Ganga' },
      { img: img('1551632811-561732d1e306'), caption: 'Hike to the waterfall' },
      { img: img('1545389336-cf090694435e'), caption: 'Evening aarti at Triveni' },
    ],
    music: 'Ganga Ambient Chants',
    likes: 39100,
    comments: 1530,
    clones: 1460,
    views: '1.7M',
    recommendedMode: 'bus',
    recommendedTier: 'standard',
    stays: {
      budget: { name: 'Zostel Tapovan', area: 'Tapovan', img: img('1555854877-bab0e564b8d5'), pricePerNight: 650, rating: 4.6, perks: ['Mountain view', 'Jam nights'] },
      standard: { name: 'Ganga Kinare Riverside', area: 'Swarg Ashram', img: img('1611892440504-42a792e24d32'), pricePerNight: 4800, rating: 4.5, perks: ['River-facing', 'Yoga deck'] },
      luxury: { name: 'Ananda Himalayan Retreat', area: 'Narendra Nagar', img: img('1540541338287-41700207dee6'), pricePerNight: 26000, rating: 4.9, perks: ['Palace estate', 'Spa', 'All meals'] },
    },
    experiences: [
      { id: 'r1', title: '16 km white-water rafting', price: 1100, duration: '3 hrs', emoji: '🌊' },
      { id: 'r2', title: 'Sunrise yoga by the river', price: 500, duration: '90 min', emoji: '🧘' },
      { id: 'r3', title: 'Neer Garh waterfall hike', price: 400, duration: '2 hrs', emoji: '🥾' },
    ],
    pins: [
      { day: 1, time: '10:00', name: 'Laxman Jhula', kind: 'viewpoint', note: 'Walk across and keep going to the cafés on the far bank.', lat: 30.1268, lng: 78.3302 },
      { day: 1, time: '13:00', name: 'Little Buddha Café', kind: 'cafe', note: 'Treehouse seating over the river.', lat: 30.1262, lng: 78.3288 },
      { day: 1, time: '18:00', name: 'Triveni Ghat aarti', kind: 'heritage', note: 'Arrive 30 min early to sit on the steps.', lat: 30.1036, lng: 78.295 },
      { day: 2, time: '09:00', name: 'Shivpuri rafting point', kind: 'activity', note: 'Grade 3 rapids. Tell them you want Roller Coaster.', lat: 30.143, lng: 78.387 },
      { day: 2, time: '15:00', name: 'Beatles Ashram', kind: 'heritage', note: 'Graffiti halls in the forest. Spend an hour.', lat: 30.117, lng: 78.317 },
      { day: 2, time: '19:30', name: 'Chotiwala', kind: 'food', note: 'Classic thali, been around since 1958.', lat: 30.124, lng: 78.32 },
    ],
    fallback: ['#0EA5E9', '#8B5CF6'],
  },
]

export const getReel = (id: string) => REELS.find((r) => r.id === id) ?? UPCOMING.find((r) => r.id === id)

export const getCreator = (handle: string) => CREATORS.find((c) => c.handle === handle)


export const getCity = (id: string) => CITIES.find((c) => c.id === id) ?? CITIES[0]

export const PARTNER: Record<Mode, { name: string; color: string; label: string }> = {
  flight: { name: 'ixigo', color: '#F57224', label: 'Flight' },
  bus: { name: 'AbhiBus', color: '#E8384F', label: 'Bus' },
  train: { name: 'ConfirmTkt', color: '#14B87A', label: 'Train' },
}

// ---- Comments ---------------------------------------------------------------

export interface Comment {
  id: string
  reelId: string
  user: string
  text: string
  at: number // epoch ms
  likes: number
  parentId?: string
  pinned?: boolean
}

const MIN = 60_000
const seedAt = Date.now()
type Seed = [user: string, text: string, minsAgo: number, likes: number, extra?: Partial<Comment>]

const SEEDS: Record<string, Seed[]> = {
  'goa-luxe': [
    ['mallanagouda.biradar', 'Everything here is booked exactly as I did it. Ask me anything about South Goa below 👇', 2880, 3120, { pinned: true }],
    ['ritika.travels', 'Cloned this for my anniversary. Price came out lower than the video!', 120, 842],
    ['nomad_nikhil', 'Is Cabo Serai worth it over Palolem Bay Cottages?', 300, 211],
    ['mallanagouda.biradar', 'If it is a special occasion, yes. The private pool is the whole trip. Otherwise Palolem is great value.', 280, 390, { id: 'goa-luxe-r1', parentId: 'goa-luxe-2' }],
    ['sneha.eats', 'Ourem 88 crab is life. Good call.', 1440, 156],
    ['vikram.wav', 'The verified badge is why I trust this. Booked.', 2880, 97],
  ],
  'gokarna-pack': [
    ['arjun.backpacks', 'Total spend was ₹5,840 from Bengaluru. Bus + bunk + trek. Questions welcome!', 4320, 1980, { pinned: true }],
    ['nomad_nikhil', 'Is the bus comfortable overnight? Asking for my back 😅', 300, 402],
    ['arjun.backpacks', 'Book a lower sleeper berth, it is way smoother. I slept fine.', 290, 512, { id: 'gokarna-pack-r1', parentId: 'gokarna-pack-1' }],
    ['priya.solo', 'Did this solo last month, felt totally safe. Paradise Beach camping was the highlight.', 720, 288],
    ['rohan.clicks', 'Carry cash for Half Moon shack. Learned that the hard way.', 2160, 143],
  ],
  'jaipur-heritage': [
    ['chitra.jagadal', 'The 92% ConfirmTkt prediction did confirm. Haveli Dharampura rooftop dinner is a must.', 4320, 2210, { pinned: true }],
    ['ananya.wanders', 'Amber Fort first slot is so underrated. No crowds at all.', 240, 367],
    ['foodie.faraz', 'LMB ghewar > everything else in Jaipur', 900, 198],
    ['kartik.rails', 'Which train did you take?', 1600, 76],
    ['chitra.jagadal', 'Ajmer Shatabdi, chair car. Very comfortable for a short ride.', 1580, 141, { id: 'jaipur-heritage-r1', parentId: 'jaipur-heritage-3' }],
  ],
  'alleppey-slow': [
    ['slowkabir', 'Ask for the upper deck table on the houseboat. Thank me later.', 5760, 980, { pinned: true }],
    ['meghna.k', 'Karimeen fry at Thaff was the best thing I ate in Kerala.', 360, 154],
    ['travel.with.tej', 'Is it worth going in monsoon?', 1300, 88],
    ['slowkabir', 'Monsoon is my favourite. Greener, quieter and houseboats are cheaper.', 1250, 120, { id: 'alleppey-slow-r1', parentId: 'alleppey-slow-2' }],
  ],
  'rishikesh-soul': [
    ['tara.on.trails', 'Rafting season is Sept to June. Tell them you want Roller Coaster rapid 🌊', 2880, 2650, { pinned: true }],
    ['priya.solo', 'Zostel Tapovan jam nights were so much fun', 180, 433],
    ['aditya.peaks', 'How cold does it get in December?', 600, 120],
    ['tara.on.trails', 'Around 6°C at night. Pack a proper jacket, days are lovely though.', 560, 210, { id: 'rishikesh-soul-r1', parentId: 'rishikesh-soul-2' }],
    ['yogi.sam', 'Triveni Ghat aarti gave me goosebumps. Go early.', 2000, 167],
  ],
}

export const SEED_COMMENTS: Comment[] = Object.entries(SEEDS).flatMap(([reelId, rows]) =>
  rows.map(([user, text, minsAgo, likes, extra], i) => ({ id: `${reelId}-${i}`, reelId, user, text, at: seedAt - minsAgo * MIN, likes, ...extra })),
)

// Live chatter that streams in while a reel plays. {place} is swapped for the destination.
export const LIVE_USERS = [
  'ishaan.goes', 'mira.maps', 'dev.on.road', 'kavya.k', 'neel.nomad', 'sara.sunsets', 'rahul.rides', 'tanvi.trips',
  'aarav.explores', 'zara.zooms', 'om.outdoors', 'nisha.n', 'kunal.k', 'diya.daydreams', 'yash.yatra', 'pooja.packs',
]

export const LIVE_LINES = [
  '{place} looks unreal 😍',
  'Cloning this tonight!',
  'How much was the stay?',
  'Adding this to my Dream Board',
  'Who is coming with me? 🙋',
  'Just booked from Pune 🎉',
  'That sunset though 🔥',
  'Best {place} itinerary I have seen',
  'Is this good for a first solo trip?',
  'Saved. Waiting for fares to drop',
  'Tagging my whole crew',
  'Went last year, can confirm it is this pretty',
  'The price from my city is so low 🤯',
  'Need this weekend asap',
  '🙌🙌🙌',
  'Verified trips are a game changer',
  'Going to {place} in December!',
  'Love this channel ❤️',
]

// Creator's past bookings available for verification (Flow 2)
export const PAST_BOOKINGS = [
  { id: 'pb1', partner: 'flight' as Mode, title: 'Delhi to Goa', detail: 'IndiGo 6E 2134', date: '12 Aug 2026', pnr: 'X7K2QP' },
  { id: 'pb2', partner: 'flight' as Mode, title: 'Cabo Serai Pool Villas', detail: '3 nights, ixigo Stays', date: '12 Aug 2026', pnr: 'IXH88213' },
  { id: 'pb3', partner: 'bus' as Mode, title: 'Bengaluru to Gokarna', detail: 'VRL Travels sleeper', date: '2 Jul 2026', pnr: 'AB4471902' },
  { id: 'pb4', partner: 'train' as Mode, title: 'Delhi to Jaipur', detail: 'Ajmer Shatabdi, CC', date: '18 May 2026', pnr: '4521873390' },
]

// ---- New uploads ------------------------------------------------------------
// One fresh trip per creator, "posted" during the demo when you subscribe with the
// bell on. In production these arrive from the uploads feed.

const base = (id: string) => REELS.find((r) => r.id === id)!

export const UPCOMING: Reel[] = [
  {
    ...base('goa-luxe'),
    id: 'goa-monsoon',
    title: 'South Goa in the monsoon, 3 rainy days',
    caption: 'Off-season Goa is green, empty and half the price. Same villa, same shacks, a completely different trip.',
    vibes: ['Monsoon', 'Couples', 'SlowTravel'],
    scenes: [
      { img: img('1519046904884-53103b34b206'), caption: 'Grey skies, zero crowds' },
      { img: img('1566073771259-6a8506099945'), caption: 'Villa rates drop 40% in July' },
      { img: img('1507525428034-b723cf961d3e'), caption: 'Waterfalls behind every beach' },
    ],
    music: 'Rain on the Konkan Coast',
    likes: 1240, comments: 86, clones: 12, views: '18K',
  },
  {
    ...base('gokarna-pack'),
    id: 'gokarna-sunrise',
    title: 'Gokarna sunrise trek, ₹4k weekend',
    caption: 'Left Bengaluru Friday night, back Monday morning. Sunrise from the Kudle cliff made the whole bus ride worth it.',
    vibes: ['Backpacker', 'Weekend', 'Trek'],
    scenes: [
      { img: img('1500530855697-b586d89ba3ee'), caption: '5:40am on the cliff trail' },
      { img: img('1506953823976-52e1fdc0149a'), caption: 'Om Beach before anyone wakes up' },
      { img: img('1504280390367-361c6d9f38f4'), caption: 'Breakfast at the shack' },
    ],
    music: 'Morning Trail (Lofi)',
    likes: 860, comments: 41, clones: 7, views: '9.4K',
  },
  {
    ...base('jaipur-heritage'),
    id: 'jaipur-food',
    title: 'Jaipur street food in 48 hours',
    caption: 'Pyaaz kachori at 7am, lassi at noon, ghewar at midnight. A full eating itinerary for the pink city.',
    vibes: ['Foodie', 'Culture', 'Weekend'],
    scenes: [
      { img: img('1524492412937-b28074a5d7da'), caption: 'Old city at breakfast time' },
      { img: img('1477587458883-47145ed94245'), caption: 'Lassiwala, the original one' },
      { img: img('1542314831-068cd1dbfeeb'), caption: 'Rooftop dinner at the haveli' },
    ],
    music: 'Rajasthani Brass (Remix)',
    likes: 1530, comments: 102, clones: 15, views: '22K',
  },
  {
    ...base('alleppey-slow'),
    id: 'alleppey-canoe',
    title: 'Alleppey by canoe: the quiet canals',
    caption: 'Skipped the big houseboats for a dawn canoe through the narrow canals. Kingfishers, toddy and total silence.',
    vibes: ['SlowTravel', 'Nature', 'Offbeat'],
    scenes: [
      { img: img('1593693397690-362cb9666fc2'), caption: '6am, just paddles and birds' },
      { img: img('1602216056096-3b40cc0c9944'), caption: 'Canal villages wake up' },
      { img: img('1445019980597-93fa8acb246c'), caption: 'Lake-view lunch stop' },
    ],
    music: 'Backwater Strings',
    likes: 640, comments: 33, clones: 4, views: '7.1K',
  },
  {
    ...base('rishikesh-soul'),
    id: 'rishikesh-rafting',
    title: 'Rishikesh rafting weekend from Delhi',
    caption: 'Friday night Volvo, Saturday rapids, Sunday aarti, Monday desk. The perfect long-weekend reset.',
    vibes: ['Adventure', 'Weekend', 'SoloTravel'],
    scenes: [
      { img: img('1551632811-561732d1e306'), caption: 'Grade 3 rapids, no regrets' },
      { img: img('1464822759023-fed622ff2c3b'), caption: 'Camp by the river' },
      { img: img('1545389336-cf090694435e'), caption: 'Sunday evening aarti' },
    ],
    music: 'Whitewater Drums',
    likes: 1980, comments: 140, clones: 21, views: '31K',
  },
]

export const upcomingFor = (handle: string) => UPCOMING.find((r) => r.creator.handle === handle)

// ---- Creator Q&A --------------------------------------------------------------

export interface Question {
  id: string
  creator: string // handle of the creator being asked
  user: string
  text: string
  at: number
  upvotes: number
  answer?: string
  answeredAt?: number
  answerAt?: number // when a simulated answer is due
  pinned?: boolean
}

type QASeed = [user: string, q: string, a: string, daysAgo: number, upvotes: number]

const QA_SEEDS: Record<string, QASeed[]> = {
  'mallanagouda.biradar': [
    ['ritika.travels', 'What was your total budget for the South Goa trip?', 'About ₹38k per person all in, with the pool villa. Swap to Palolem Bay Cottages and it drops to around ₹19k. The Clone button prices it from your city.', 2, 412],
    ['nomad_nikhil', 'Best month to go to South Goa?', 'November to February for beach days. July and August if you want green, empty and cheap. Avoid Christmas week unless you book months ahead.', 6, 288],
    ['sneha.eats', 'Is South Goa good for vegetarians?', 'Very! Every shack has a veg thali, and Café Inn Palolem has a great breakfast menu.', 12, 97],
  ],
  'arjun.backpacks': [
    ['priya.solo', 'Is Gokarna safe for solo women travellers?', 'Yes, it is one of the friendliest beach towns I know. Stay at Zostel or near Kudle, and take the boat back from Paradise Beach before dark.', 3, 356],
    ['rohan.clicks', 'Bus or train from Bengaluru?', 'Overnight AbhiBus sleeper, every time. ₹980 and it drops you right in town at 6am.', 9, 141],
  ],
  'chitra.jagadal': [
    ['ananya.wanders', 'How many days are enough for Jaipur?', 'Three days is perfect. Day one old city, day two Amber and Nahargarh, day three food and shopping.', 4, 233],
    ['kartik.rails', 'Is the train really better than flying?', 'From Delhi, yes. Ajmer Shatabdi is under 5 hours, city centre to city centre, and the ConfirmTkt prediction is usually spot on.', 10, 120],
  ],
  slowkabir: [
    ['meghna.k', 'Houseboat for one night or two?', 'One night is the sweet spot. Second night, switch to a lake-view room so you can explore the canals by canoe.', 5, 164],
  ],
  'tara.on.trails': [
    ['aditya.peaks', 'Is rafting safe for non-swimmers?', 'Yes, you wear a life jacket and helmet, and the guides are excellent. Start with the 16 km stretch, it is grade 2 and 3.', 2, 301],
    ['priya.solo', 'Where should I stay as a solo traveller?', 'Zostel Tapovan. Great vibe, easy to make friends for the rafting and the aarti.', 7, 188],
  ],
}

const DAY = 86_400_000
export const SEED_QUESTIONS: Question[] = Object.entries(QA_SEEDS).flatMap(([creator, rows]) =>
  rows.map(([user, text, answer, daysAgo, upvotes], i) => ({
    id: `q-${creator}-${i}`,
    creator,
    user,
    text,
    at: seedAt - daysAgo * DAY,
    upvotes,
    answer,
    answeredAt: seedAt - daysAgo * DAY + 3 * 3_600_000,
    pinned: i === 0,
  })),
)

// What each creator says when the simulated answer engine matches a topic
export const CREATOR_FACTS: Record<string, Record<'budget' | 'season' | 'safety' | 'stay' | 'food' | 'transport' | 'other', string>> = {
  'mallanagouda.biradar': {
    budget: 'All in, my trip was about ₹38k per person with the villa. Budget version is under ₹20k. Hit Clone this trip to see it priced from your city.',
    season: 'November to February for perfect beach weather. Monsoon (July and August) is gorgeous and half the price.',
    safety: 'South Goa is calm and very safe. Just avoid swimming after dark and where there are red flags.',
    stay: 'Cabo Serai if it is a special trip, Palolem Bay Cottages for value. Both are in the Clone sheet.',
    food: 'Ourem 88 for dinner, any Agonda shack for kingfish thali, Café Inn for breakfast.',
    transport: 'Fly into Mopa or Dabolim, then a pre-booked cab. Rent a scooter locally to hop between beaches.',
    other: 'Great question! I will cover this in my next reel. Meanwhile every spot I went to is on the trip map.',
  },
  'arjun.backpacks': {
    budget: 'I spent ₹5,840 from Bengaluru: bus, bunk, trek and food. You can do it for less if you camp.',
    season: 'October to March. Monsoon is beautiful but the beach trek gets slippery.',
    safety: 'Very safe, lots of solo travellers. Carry a torch and cash, and do not trek after dark.',
    stay: 'Zostel Gokarna near Kudle. Book the sea-view deck bunk.',
    food: 'Namaste Café for the Israeli platter, and the Half Moon shack for lunch on the trek.',
    transport: 'Overnight AbhiBus sleeper from Bengaluru. Lower berth is smoother.',
    other: 'Good one! Drop more questions here, I read all of them.',
  },
  'chitra.jagadal': {
    budget: 'Around ₹14k per person by train with the haveli stay. The palace upgrade is a splurge but worth it once.',
    season: 'October to March. Summer is very hot, so if you go then, start at sunrise.',
    safety: 'Jaipur is easy for solo travellers. Use metered autos or cabs after dark.',
    stay: 'Haveli Dharampura in the old city. The rooftop dinner alone is worth it.',
    food: 'LMB for ghewar, Rawat for pyaaz kachori, and Tapri for chai with a view.',
    transport: 'Ajmer Shatabdi from Delhi. Check the ConfirmTkt prediction before booking.',
    other: 'Love this question! I will add it to my next Jaipur reel.',
  },
  slowkabir: {
    budget: 'About ₹16k per person with the houseboat night included.',
    season: 'September to March for clear skies, monsoon if you love rain like I do.',
    safety: 'Totally safe. Book licensed houseboats only, every one in my trip is.',
    stay: 'One night on the houseboat, one in a lake-view lodge.',
    food: 'Karimeen fry at Thaff and toddy shop lunches. Do not skip the appam.',
    transport: 'Fly into Kochi, then a two-hour cab. Trains to Alappuzha work too.',
    other: 'Thanks for asking! Slow down and enjoy, that is the whole point of Alleppey.',
  },
  'tara.on.trails': {
    budget: 'About ₹9k per person from Delhi by bus, with rafting and a riverside stay.',
    season: 'September to June for rafting. Monsoon closes the river.',
    safety: 'Very safe and very solo-friendly. Go with licensed rafting operators only.',
    stay: 'Zostel Tapovan for the vibe, Ganga Kinare if you want river views.',
    food: 'Chotiwala for the thali, Little Buddha Café for the view.',
    transport: 'Overnight Volvo from Delhi, about 6 hours. Book the window seat.',
    other: 'Great question! I will answer this properly in my next reel.',
  },
}

// ---- Leaderboards -------------------------------------------------------------

export const LB_DESTS = [
  { id: 'goa', name: 'Goa' },
  { id: 'gok', name: 'Gokarna' },
  { id: 'jai', name: 'Jaipur' },
  { id: 'alp', name: 'Alleppey' },
  { id: 'rsk', name: 'Rishikesh' },
]

/** Trips cloned through each creator's verified itineraries, per destination */
export const GUIDE_STATS: { handle: string; dest: string; week: number; month: number; lastWeekRank: number }[] = [
  { handle: 'mallanagouda.biradar', dest: 'goa', week: 142, month: 610, lastWeekRank: 1 },
  { handle: 'tara.on.trails', dest: 'goa', week: 38, month: 150, lastWeekRank: 3 },
  { handle: 'chitra.jagadal', dest: 'goa', week: 21, month: 96, lastWeekRank: 2 },
  { handle: 'arjun.backpacks', dest: 'goa', week: 17, month: 70, lastWeekRank: 4 },
  { handle: 'arjun.backpacks', dest: 'gok', week: 96, month: 402, lastWeekRank: 1 },
  { handle: 'mallanagouda.biradar', dest: 'gok', week: 22, month: 110, lastWeekRank: 3 },
  { handle: 'slowkabir', dest: 'gok', week: 12, month: 60, lastWeekRank: 2 },
  { handle: 'chitra.jagadal', dest: 'jai', week: 64, month: 288, lastWeekRank: 2 },
  { handle: 'tara.on.trails', dest: 'jai', week: 30, month: 122, lastWeekRank: 1 },
  { handle: 'mallanagouda.biradar', dest: 'jai', week: 18, month: 81, lastWeekRank: 3 },
  { handle: 'slowkabir', dest: 'alp', week: 41, month: 170, lastWeekRank: 1 },
  { handle: 'mallanagouda.biradar', dest: 'alp', week: 26, month: 118, lastWeekRank: 2 },
  { handle: 'chitra.jagadal', dest: 'alp', week: 9, month: 40, lastWeekRank: 3 },
  { handle: 'tara.on.trails', dest: 'rsk', week: 118, month: 496, lastWeekRank: 1 },
  { handle: 'arjun.backpacks', dest: 'rsk', week: 44, month: 180, lastWeekRank: 2 },
  { handle: 'chitra.jagadal', dest: 'rsk', week: 15, month: 62, lastWeekRank: 3 },
]
