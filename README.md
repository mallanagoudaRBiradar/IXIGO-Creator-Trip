# Trip Reels by ixigo

**Watch a trip. Book the exact one.**

A mobile-first web app where travellers swipe through creator reels, then clone the creator's real, PNR-verified itinerary in one tap, priced live from their own city across ixigo flights, AbhiBus buses and ConfirmTkt trains.

Built as a hackathon MVP. Every screen works end to end with a realistic mock pricing engine, so the demo never depends on a backend or Wi-Fi luck.

---

## Quick start

**You need:** Node.js 18 or newer (check with `node -v`).

```bash
cd trip-reels
npm install
npm run dev
```

Open **http://localhost:5173**.

**On your phone:** `npm run dev` also prints a `Network:` URL (for example `http://192.168.1.20:5173`). Open it on a phone on the same Wi-Fi. The desktop view shows a QR code for this too.

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload, reachable on your local network |
| `npm run build` | Type-checks, then builds to `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm run typecheck` | TypeScript check only |

---

## The 3-minute pitch demo

Run through this in order. Every step is live, nothing is a static screenshot.

1. **Feed.** Swipe (or use the arrow keys or the arrows beside the phone on desktop). Tap the right or left side of a reel to skip scenes, tap the middle to pause, **double-tap to like**.
2. **Change city.** Tap the 📍 chip at top-left, pick **Delhi** or tap **Use my current location**. Every "Clone this trip" price updates instantly.
3. **Clone this trip.** The sheet slides up with the whole trip priced from your city.
   - Switch **Flight / Bus / Train**. The boarding pass flips, and the train shows a ConfirmTkt confirmation probability.
   - Hit **Smart Swap**: Budget, Standard, Luxury. Hotel, photo and total animate in place.
   - Change dates (weekends cost more) or travellers (rooms auto-calculate).
4. **Save to Dream Board.** About 7 seconds later a push notification arrives: fares dropped. Tap it. The Dream Board shows the new price, and **Book at ₹X** carries that exact locked price into checkout.
5. **Split with crew.** A WhatsApp-style chat fills in as friends join and pay. **Send on WhatsApp** opens real WhatsApp with the invite. **Pay my share** checks out just your part.
6. **Slide to pay.** Watch tickets get issued, confetti, booking ID, and the creator's Gems.
7. **Open trip companion.** Day-by-day timeline with QR boarding passes, hotel voucher, and every spot the creator tagged, each with **Open in Maps**.
8. **Creator tab.** Tier progress (Scout, Voyager, Guru), live metrics, and **Link booking** on the draft reel to watch PNR verification publish it with a Verified badge.

To start over, click **Reset demo data** in the desktop side panel, or clear site data on mobile.

---

## What's in it, mapped to the product plan

| Plan item | Where it lives |
| --- | --- |
| Vertical swipe feed | `pages/Feed.tsx`, `components/ReelPlayer.tsx` (CSS snap-scrolling plus Ken Burns scenes, captions, progress bars) |
| AI vibe tags | Vibe chips on every reel, filterable in **Explore** |
| Clone This Trip CTA | Persistent glowing CTA with a live "from" price for the viewer's city |
| Dynamic geolocation pricing | `lib/pricing.ts` (`nearestCity`, `distanceKm`, `quoteTransport`) plus `components/OriginPicker.tsx` |
| Smart Swap engine | Stay tiers and transport modes in `components/clone/BuildView.tsx` |
| Dream Boards and price-drop alerts | `pages/Dreams.tsx`, push-style banners in `components/NoticeStack.tsx` |
| Group Split (WhatsApp loop) | `components/clone/CrewView.tsx` (real `wa.me` and Web Share API) |
| Verified Itinerary badges | Badge on reels, PNR verification flow in `components/UploadSheet.tsx` |
| Tiered Gem rewards | `pages/Creator.tsx`, Gems credited on every booking and redeemable at checkout |
| Creator analytics | `pages/Creator.tsx` |
| In-Trip Companion | `pages/TripDetail.tsx`, `lib/trip.ts` builds the travel-aware timeline |
| Multi-platform routing | ixigo for flights and stays, AbhiBus for buses, ConfirmTkt for trains, with partner colours throughout |

### Product decisions worth calling out

- **Prices are never faked per screen.** One engine (`priceTrip`) drives the reel CTA, the sheet, the Dream Board and the receipt, so numbers always agree.
- **A Dream Board fare drop is locked into checkout** and is dropped automatically if you change the route or mode, because that fare no longer applies.
- **Overnight buses are modelled honestly.** The companion shows "Arrives 07:30", check-in waits until after arrival, and day-one spots shift to fit.
- **Pending Gems are credited after travel**, not at booking, which closes the obvious self-booking fraud loop.
- **Convenience fee is free on cloned trips** and there's a 7% bundle discount. Both are visible, because they're the conversion lever over booking legs separately.
- **Graceful offline.** Every image has a gradient fallback, so a flaky venue network never shows broken frames.

---

## Tech stack and why

| Choice | Why |
| --- | --- |
| **Vite + React 18 + TypeScript** | Instant dev server, tiny config, a single static build you can host anywhere. No server needed for the demo. |
| **Tailwind CSS** | Fast, consistent styling with brand tokens in `tailwind.config.js`. |
| **Framer Motion** | Spring bottom sheets with drag-to-dismiss, shared-layout pills, swipe-to-pay, animated numbers. |
| **Zustand (persisted)** | Liked reels, Dream Board, trips and city survive a refresh, so the demo state holds up. |
| **React Router** | Real URLs, including deep links like `/?reel=gokarna-pack` and `/trips/:id`. |
| **lucide-react, qrcode.react, canvas-confetti** | Icons, real scannable QR codes, and the booking celebration. |

Fonts are Bricolage Grotesque (display) and Plus Jakarta Sans (body) from Google Fonts, with system fallbacks.

---

## Project structure

```
src/
  App.tsx                    Routes, page transitions, global sheets
  lib/
    mockData.ts              Cities, 5 creator reels, stays, experiences, tagged spots
    pricing.ts               Distance-based fares, smart swap, bundles, fare drops
    trip.ts                  Day-by-day companion timeline builder
    store.ts                 Persisted app state + UI state (sheets, notifications)
    utils.ts                 Formatting helpers (₹, dates, durations)
  components/
    PhoneShell.tsx           Phone frame on desktop, full screen on mobile, pitch panel
    ReelPlayer.tsx           One reel: scenes, gestures, rail, CTA
    clone/                   Clone sheet: BuildView, CrewView, Checkout (pay, processing, success)
    Ticket.tsx               Boarding-pass card reused in checkout and companion
    BottomSheet.tsx          Draggable spring sheet
    UploadSheet.tsx          Creator upload and PNR verification
    OriginPicker.tsx, NoticeStack.tsx, BottomNav.tsx, ui.tsx
  pages/
    Feed, Explore, Dreams, Trips, TripDetail, Creator
```

---

## Plugging in real data

All inventory goes through two functions, so swapping mocks for the real MCP servers is contained:

- `quoteTransport(mode, origin, reel, travellers, date)` in `lib/pricing.ts`: replace the body with calls to the ixigo flights, AbhiBus and ConfirmTkt MCP tools. Keep the `TransportQuote` shape.
- `reel.stays[tier]` in `lib/mockData.ts`: replace with an ixigo Stays lookup.

Reels can play real video by adding a `video` URL to each scene and rendering a `<video autoPlay muted playsInline loop>` in `ReelPlayer.tsx` in place of the image.

---

## Deploy

`npm run build` produces a static `dist/` folder.

- **Vercel:** import the folder, framework "Vite". `vercel.json` already handles client-side routes.
- **Netlify:** build command `npm run build`, publish directory `dist`. `public/_redirects` handles routes.

---

## Troubleshooting

- **Photos don't show, gradients instead.** Images load from Unsplash, so you need internet. The app is fully usable without them.
- **"Use my current location" does nothing.** Browsers only allow location on `https` or `localhost`. On a phone over your LAN IP, pick the city from the list instead, or deploy to get https.
- **Port already in use.** Run `npm run dev -- --port 5180`.
- **Odd state after many demo runs.** Use **Reset demo data** or clear site data.
