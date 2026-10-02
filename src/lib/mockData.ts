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
}

export interface Creator {
  handle: string
  name: string
  followers: string
  tier: 'Scout' | 'Voyager' | 'Guru'
  hue: [string, string]
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
  meera: { handle: 'mallanagouda.biradar', name: 'Mallanagouda R Biradar', followers: '412K', tier: 'Guru', hue: ['#F57224', '#E8384F'] },
  arjun: { handle: 'arjun.backpacks', name: 'Arjun Rao', followers: '86K', tier: 'Voyager', hue: ['#14B87A', '#38D9C0'] },
  zoya: { handle: 'chitra.jagadal', name: 'Chitra Jagadal', followers: '128K', tier: 'Voyager', hue: ['#8B5CF6', '#F57224'] },
  kabir: { handle: 'slowkabir', name: 'Kabir Menon', followers: '54K', tier: 'Scout', hue: ['#0EA5E9', '#14B87A'] },
  tara: { handle: 'tara.on.trails', name: 'Tara Negi', followers: '203K', tier: 'Guru', hue: ['#F59E0B', '#F57224'] },
}

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
      { day: 1, time: '17:30', name: 'Cola Beach lagoon', kind: 'beach', note: 'Walk down before 6, the lagoon glows at sunset.' },
      { day: 1, time: '20:00', name: 'Ourem 88', kind: 'food', note: 'Book ahead. Get the beef tenderloin or the crab.' },
      { day: 2, time: '07:00', name: 'Palolem Beach', kind: 'beach', note: 'Mornings are empty and the water is glass.' },
      { day: 2, time: '11:00', name: 'Café Inn Palolem', kind: 'cafe', note: 'Cold coffee plus their banana pancakes.' },
      { day: 2, time: '16:00', name: 'Butterfly Beach', kind: 'viewpoint', note: 'Only reachable by boat. Dolphins on the way.' },
      { day: 3, time: '10:00', name: 'Cabo de Rama Fort', kind: 'heritage', note: 'Clifftop ruins with the best view in South Goa.' },
      { day: 3, time: '18:30', name: 'Agonda shacks', kind: 'food', note: 'Any shack works. Order kingfish thali.' },
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
      { day: 1, time: '09:00', name: 'Mahabaleshwar Temple', kind: 'heritage', note: 'Go early, the town street wakes up around it.' },
      { day: 1, time: '13:00', name: 'Namaste Café', kind: 'cafe', note: 'Israeli platter and a fresh lime soda.' },
      { day: 1, time: '18:00', name: 'Kudle cliff', kind: 'viewpoint', note: 'Sit on the rocks at the south end for sunset.' },
      { day: 2, time: '07:00', name: 'Om Beach', kind: 'beach', note: 'Start of the five-beach trek. Carry 2L water.' },
      { day: 2, time: '12:00', name: 'Half Moon Beach', kind: 'beach', note: 'Lunch at the only shack. Cash only.' },
      { day: 2, time: '17:00', name: 'Paradise Beach', kind: 'activity', note: 'Camp here or take the boat back for ₹300.' },
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
      { day: 1, time: '08:00', name: 'Hawa Mahal from Wind View Café', kind: 'viewpoint', note: 'The café opposite has the frame you see in my reel.' },
      { day: 1, time: '13:00', name: 'LMB, Johari Bazaar', kind: 'food', note: 'Ghewar and the dal kachori. Do not skip.' },
      { day: 1, time: '18:00', name: 'Nahargarh Fort', kind: 'viewpoint', note: 'Sunset over the pink city. Cab back after dark.' },
      { day: 2, time: '07:30', name: 'Amber Fort', kind: 'heritage', note: 'First entry slot. Sheesh Mahal before the tour groups.' },
      { day: 2, time: '12:30', name: 'Tapri Central', kind: 'cafe', note: 'Masala chai with a view of the Central Park.' },
      { day: 2, time: '16:00', name: 'Patrika Gate', kind: 'heritage', note: 'Most colourful gate in India. Weekdays are quieter.' },
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
      { day: 1, time: '12:00', name: 'Finishing Point jetty', kind: 'activity', note: 'Board here. Ask for the upper-deck table.' },
      { day: 1, time: '18:00', name: 'Vembanad lake sunset', kind: 'viewpoint', note: 'The boat anchors here, best colours of the trip.' },
      { day: 2, time: '06:30', name: 'Kainakary canals', kind: 'activity', note: 'Small canoe through narrow canals, total silence.' },
      { day: 2, time: '13:00', name: 'Thaff Restaurant', kind: 'food', note: 'Pearl spot fry and Kerala parotta.' },
      { day: 2, time: '17:00', name: 'Alleppey Beach', kind: 'beach', note: 'Old pier at sunset and kappa chips from carts.' },
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
      { day: 1, time: '10:00', name: 'Laxman Jhula', kind: 'viewpoint', note: 'Walk across and keep going to the cafés on the far bank.' },
      { day: 1, time: '13:00', name: 'Little Buddha Café', kind: 'cafe', note: 'Treehouse seating over the river.' },
      { day: 1, time: '18:00', name: 'Triveni Ghat aarti', kind: 'heritage', note: 'Arrive 30 min early to sit on the steps.' },
      { day: 2, time: '09:00', name: 'Shivpuri rafting point', kind: 'activity', note: 'Grade 3 rapids. Tell them you want Roller Coaster.' },
      { day: 2, time: '15:00', name: 'Beatles Ashram', kind: 'heritage', note: 'Graffiti halls in the forest. Spend an hour.' },
      { day: 2, time: '19:30', name: 'Chotiwala', kind: 'food', note: 'Classic thali, been around since 1958.' },
    ],
    fallback: ['#0EA5E9', '#8B5CF6'],
  },
]

export const getReel = (id: string) => REELS.find((r) => r.id === id)

export const getCity = (id: string) => CITIES.find((c) => c.id === id) ?? CITIES[0]

export const PARTNER: Record<Mode, { name: string; color: string; label: string }> = {
  flight: { name: 'ixigo', color: '#F57224', label: 'Flight' },
  bus: { name: 'AbhiBus', color: '#E8384F', label: 'Bus' },
  train: { name: 'ConfirmTkt', color: '#14B87A', label: 'Train' },
}

// Generic comments are paired with each reel's first vibe for a bit of variety.
export const COMMENTS = [
  { user: 'ritika.travels', text: 'Cloned this for my anniversary. Price came out lower than the video!', time: '2h' },
  { user: 'nomad_nikhil', text: 'Is the bus comfortable overnight? Asking for my back 😅', time: '5h' },
  { user: 'sneha.eats', text: 'Saved to my Dream Board, waiting for fares to drop', time: '1d' },
  { user: 'vikram.wav', text: 'The verified badge is why I trust this. Booked.', time: '2d' },
]

// Creator's past bookings available for verification (Flow 2)
export const PAST_BOOKINGS = [
  { id: 'pb1', partner: 'flight' as Mode, title: 'Delhi to Goa', detail: 'IndiGo 6E 2134', date: '12 Aug 2026', pnr: 'X7K2QP' },
  { id: 'pb2', partner: 'flight' as Mode, title: 'Cabo Serai Pool Villas', detail: '3 nights, ixigo Stays', date: '12 Aug 2026', pnr: 'IXH88213' },
  { id: 'pb3', partner: 'bus' as Mode, title: 'Bengaluru to Gokarna', detail: 'VRL Travels sleeper', date: '2 Jul 2026', pnr: 'AB4471902' },
  { id: 'pb4', partner: 'train' as Mode, title: 'Delhi to Jaipur', detail: 'Ajmer Shatabdi, CC', date: '18 May 2026', pnr: '4521873390' },
]
