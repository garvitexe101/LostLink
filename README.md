# LostLink – Campus Lost & Found

> **Lost, found, back to you.**  
> A full-stack campus lost-and-found web platform for **Chitkara University, Rajpura Campus**, built with a **Node.js + Express** REST API, **MongoDB (Mongoose)** persistence, rule-based lost/found matching, verification-gated claims moderation, dual JWT + Firebase authentication, and an interactive **Leaflet** campus map.

---

## Table of Contents

- [Core Features](#core-features)
- [System Architecture (MVC)](#system-architecture-mvc)
- [How the Underlying Mechanisms Work](#how-the-underlying-mechanisms-work)
  - [1. Rule-Based 100-Point Matching Engine](#1-rule-based-100-point-matching-engine)
  - [2. Privacy-Preserving Ownership Verification & Claim Workflow](#2-privacy-preserving-ownership-verification--claim-workflow)
  - [3. Authentication, Authorization & Rate Limiting](#3-authentication-authorization--rate-limiting)
  - [4. Interactive Live Campus Map](#4-interactive-live-campus-map)
  - [5. Dual-Channel Notifications & Email Delivery](#5-dual-channel-notifications--email-delivery)
  - [6. Resilient MongoDB Connection & Fallback Storage](#6-resilient-mongodb-connection--fallback-storage)
- [Data Models (Mongoose)](#data-models-mongoose)
- [REST API Reference](#rest-api-reference)
- [Project Structure](#project-structure)
- [Configuration & Local Setup](#configuration--local-setup)
- [Scripts & API Testing](#scripts--api-testing)

---

## Core Features

- **Lost & Found Reporting (`lost.html`, `found.html`):** Structured report creation across **7 item categories**, **10 Chitkara campus zones**, date/time inputs, free-text colour descriptions, deposit custody tracking (`With finder`, `Security Office`, `Reception`), optional base64 photo uploads (up to 2 MB in PNG, JPEG, GIF, or WebP), and a hidden private ownership detail for verification.
- **Automated Rule-Based Item Matching (`backend/matching.js`):** Immediately compares newly posted reports against active opposite-type items, assigns a transparent 0–100 score with human-readable match reasons, updates item statuses to `Possible match`, and alerts both parties on high-confidence matches.
- **Interactive Campus Map (`map.html`, `frontend/js/map.js`):** Offline-bundled **Leaflet 1.9.4** map centered on Chitkara University (`30.5159, 76.6601`) with Satellite/Street layer toggles, browser geolocation, zone radius circles, and clickable building pins that filter active reports per location.
- **Privacy-Gated Ownership Claims (`item.html`, `admin.html`):** Hides sensitive ownership details (`privateDetail`) from public listings; claimants answer 4 targeted verification questions reviewed side-by-side by campus admins before an item is approved for pickup and marked `Returned`.
- **Hybrid Authentication (`signin.html`):** Supports both local email/password accounts (`bcryptjs` + HTTP-only JWT cookies) and Firebase Authentication (Google/client ID token verification with automatic account linking).
- **In-App & Email Alerts (`profile.html`):** Persistent per-user notification feed paired with rich HTML/plain-text SMTP emails (or console fallback when SMTP is unconfigured).

---

## System Architecture (MVC)

LostLink strictly separates responsibilities across database models, Express controllers/services, API routers, and static frontend views:

```text
Browser (frontend/*.html + js/shared.js)
   │  window.API_BASE_URL + credentials / Bearer JWT
   ▼
Express Server (backend/server.js)
   ├── Security & CORS headers, cookie-parser, 4 MB JSON body limit
   ├── /api Middleware (loadUser: HTTP-only cookie JWT / Bearer JWT / Firebase ID token)
   ├── Routes (backend/routes/*.js) ──► rateLimit / requireAuth / requireAdmin
   │      ├── /api/auth   ──► authController
   │      ├── /api/items  ──► itemController ──► matching.js (auto-score)
   │      ├── /api/admin  ──► claimController (moderation & cleanup)
   │      └── /api/*      ──► claimsController & miscController
   ├── Services (mailer.js, notify.js, firebase.js, itemModel.js)
   └── Models (backend/models/*.js) ──► Mongoose ──► MongoDB Atlas / Local / Embedded
```

---

## How the Underlying Mechanisms Work

### 1. Rule-Based 100-Point Matching Engine

Implemented in `backend/matching.js` (with weights and thresholds driven by `backend/config/config.js`), LostLink uses a **deterministic, zero-AI heuristic model** so every match score is explainable and tunable via `.env` without black-box behavior.

When a user submits a report (`POST /api/items`), `processNewItem(item)` queries all non-`Returned` opposite-type items (`lost` vs `found`) posted by **other users** (`userId !== itemUserId`) and evaluates each candidate with `scorePair(lost, found)`:

| Signal | Default Max Weight | Evaluation Rule |
| :--- | :---: | :--- |
| **Category** | **25** | Exact match across `Electronics`, `ID / Card`, `Bags`, `Keys`, `Clothing`, `Books`, `Other` |
| **Campus Zone** | **25** | Exact match across the 10 mapped campus zones |
| **Colour** | **15** | `+15` for exact match, substring match, or shared word token; `+5` fallback if either item contains `multi`, `rainbow`, or `pattern` |
| **Date Proximity** | **15** | Evaluates `dayDiff(lost.date, found.date)` for `gap >= -1`: `+15` if `<= 1` day, `+10` if `<= 3` days, `+5` if `<= 7` days |
| **Keyword Overlap** | **20** | Tokenizes `name + description`, removes tokens `<= 2` chars and common stop words, scores `Math.round((shared / Math.min(\|A\|, \|B\|)) * 20)` |

- **Filtering & Persistence:** Total score is capped at `100`. Pairs meeting `MATCH_MIN_SCORE` (default **50**) are upserted into the `Match` collection (enforcing a unique `{ lostId, foundId }` index) along with human-readable `reasons` (e.g., `"Same category"`, `"Found 2 days after it was lost"`, `"3 matching keywords"`).
- **Automatic Status Transition:** Both matched items currently in `Open` status are automatically promoted to `Possible match`.
- **Strong Match Notifications:** Pairs scoring `>= MATCH_STRONG_SCORE` (default **70**) invoke `notifyMatch()`, alerting both the lost-item owner and the finder with mutual contact details and report links.
- **Immediate Feedback:** `POST /api/items` sorts results descending by score and returns the top **5** matched items directly in the HTTP `201` response.

---

### 2. Privacy-Preserving Ownership Verification & Claim Workflow

To prevent false claims on valuable campus items:

1. **Private Detail Masking (`backend/itemModel.js`):** When reporting an item, users can include a `privateDetail` (up to 100 characters, such as a lockscreen image, engraving, or pocket contents). `publicItem(doc, viewer)` strips `privateDetail` from all API responses unless the authenticated viewer is the item's owner or an `admin`.
2. **Claim Submission (`POST /api/items/:id/claims`):** Any logged-in student who did **not** create the report can claim a non-`Returned` `found` item by submitting answers to 4 verification prompts (`colour`, `location`, `privateFeature`, `descriptionWord`). Duplicate pending claims by the same user on the same item are blocked with `409 Conflict`, and admins are notified immediately.
3. **Admin Review & Cascading Approval (`POST /api/admin/claims/:id/decision`):**
   - Admins review the claimant's 4 answers side-by-side against the reporter's hidden `privateDetail`.
   - **Approving** a claim sets `status = 'approved'`, updates the item's `status` to `'Returned'`, **automatically rejects all other `pending` claims** on that item, and notifies the approved claimant (with handover instructions for the **Security Office behind Turing Block**), any rejected claimants, and the original finder.
   - **Rejecting** a claim marks it `'rejected'` and notifies the claimant while keeping the item open for other genuine owners.

---

### 3. Authentication, Authorization & Rate Limiting

Handled by `backend/controllers/authController.js`, `backend/middleware.js`, and `backend/firebase.js`:

- **Two Sign-In Paths:**
  - **Local Accounts:** Password hashing via `bcryptjs` (`10` salt rounds) with server-side input validation and optional campus email enforcement (`RESTRICT_EMAIL_DOMAIN=true` restricts accounts to `@chitkara.edu.in`).
  - **Firebase Sign-In (`POST /api/auth/firebase-login`):** Verifies client Firebase ID tokens using `firebase-admin` (service account file, environment variables, or project ID) and includes a fallback verifier that fetches and caches Google's public x509 certificates (`securetoken@system.gserviceaccount.com`). First-time Firebase logins auto-provision local user records and link `firebaseUid`.
- **Stateless Signed Sessions:** Successful login issues a 7-day HS256 JWT stored in an `HttpOnly`, `SameSite=Lax` cookie (`ll_token`). API requests also accept `Authorization: Bearer <token>` (checked first as a local JWT, then as a Firebase ID token).
- **Fresh Role Checks & Protection:** `loadUser` re-fetches the user from MongoDB on every `/api` request so role changes take effect immediately. Authentication endpoints (`/register`, `/login`, `/firebase-login`) are protected by an in-memory per-IP rate limiter (`40` attempts per `15` minutes).

---

### 4. Interactive Live Campus Map

Implemented in `frontend/map.html` and `frontend/js/map.js` with local Leaflet `1.9.4` assets (`frontend/vendor/leaflet/`) so map scripts/icons never depend on third-party JS CDNs:

- **Mapped Campus Zones:** `backend/config/config.js` defines approximate zone-level coordinates (intentional zone privacy rather than exact pinpoints) for **10 campus landmarks**: *Square One*, *Tesla Block*, *Turing Block*, *Hostel Area*, *Martin Luther*, *Rockfellar*, *Alpha Zone*, *Omega Zone*, *Sportorium*, and *Explotorium*.
- **Interactive Visualization:** Renders a `36 m` radius architectural circle and custom pin per zone color-coded by active reports (orange for lost activity, green for found-only activity, slate when clear). Clicking a zone pans the map and filters the live item list fetched from `GET /api/map` and `GET /api/items`.
- **View Modes & Geolocation:** Toggle between high-resolution **Satellite** imagery (Esri World Imagery) and **Street Map** tiles (OpenStreetMap HOT), or locate your live GPS position on campus via the browser Geolocation API.

---

### 5. Dual-Channel Notifications & Email Delivery

Implemented across `backend/notify.js` and `backend/mailer.js`:

- Every match alert (`score >= 70`), claim submission, claim approval, and claim rejection stores an in-app `Notification` record (`isRead` state synced via `GET /api/notifications` and `POST /api/notifications/read-all`).
- In parallel, `mailer.js` dispatches plain-text and styled HTML emails via **Nodemailer** (supporting Gmail service or custom SMTP host/port/TLS). If SMTP credentials are omitted—or if transport fails—emails degrade gracefully to structured console logs without blocking API responses.

---

### 6. Resilient MongoDB Connection & Fallback Storage

Implemented in `backend/config/db.js` and `backend/seed.js`:

- Configures public DNS resolvers (`8.8.8.8`, `1.1.1.1`) to avoid local SRV lookup issues when connecting to MongoDB Atlas (`MONGODB_URI`).
- Connects to the configured Atlas cluster or local `mongod` instance with an 8-second selection timeout.
- **Zero-Install Fallback:** If neither Atlas nor a local MongoDB daemon is reachable, LostLink automatically boots an embedded `mongodb-memory-server` persisted to `backend/data/local-mongo` using `wiredTiger` (with a pure in-memory fallback if disk startup fails).
- On server startup, `seed.js` ensures the administrator user (`ADMIN_EMAIL` / `ADMIN_PASSWORD`) is provisioned and optionally seeds sample campus reports when `SEED_DEMO_DATA=true`.

---

## Data Models (Mongoose)

All schemas in `backend/models/` expose both camelCase fields and snake_case virtual aliases for seamless frontend/API compatibility:

| Model | Key Fields | Purpose |
| :--- | :--- | :--- |
| **`User`** | `name`, `email` (unique), `passwordHash`, `role` (`student` \| `admin`), `firebaseUid` | Campus accounts and role-based access control |
| **`Item`** | `userId`, `type` (`lost` \| `found`), `name`, `category`, `colour`, `zone`, `date`, `time`, `description`, `privateDetail`, `deposit`, `image`, `status` (`Open` \| `Possible match` \| `Returned`) | Lost/found reports, base64 photos, and hidden ownership cues |
| **`Claim`** | `itemId`, `userId`, `answers` (`colour`, `location`, `privateFeature`, `descriptionWord`), `status` (`pending` \| `approved` \| `rejected`), `decidedBy`, `decidedAt` | Verification requests submitted against found items |
| **`Match`** | `lostId`, `foundId` (unique compound index), `score`, `reasons` | Scored candidate pairs generated by `matching.js` |
| **`Notification`** | `userId`, `type`, `title`, `message`, `note`, `isRead` | In-app alerts for matches, claims, and item returns |

---

## REST API Reference

| Scope | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| **Auth** | `GET /api/auth/me` | Optional | Return current authenticated session user or `null` |
| **Auth** | `GET /api/auth/firebase-config` | Public | Return public Firebase web configuration |
| **Auth** | `POST /api/auth/register` | Public | Register a student account (rate-limited) |
| **Auth** | `POST /api/auth/login` | Public | Sign in with email and password (rate-limited) |
| **Auth** | `POST /api/auth/firebase-login` | Public | Exchange a Firebase ID token for a session (rate-limited) |
| **Auth** | `POST /api/auth/logout` | Public | Clear the session cookie |
| **Items** | `GET /api/items` | Public | List active reports (`type`, `category`, `zone`, `q` filters) |
| **Items** | `GET /api/items/returned` | Public | List up to 12 recently returned items |
| **Items** | `GET /api/items/mine` | User | List reports created by the signed-in user |
| **Items** | `POST /api/items` | User | Create report (validates image/date & triggers matching) |
| **Items** | `GET /api/items/:id` | Public | View item details (includes `myClaim`; hides `privateDetail`) |
| **Items** | `GET /api/items/:id/image` | Public | Serve item photo binary with cache headers |
| **Items** | `GET /api/items/:id/matches` | Owner / Admin | View ranked non-returned match candidates for an item |
| **Claims** | `POST /api/items/:id/claims` | User | Submit 4-question verification claim on a found item |
| **Claims** | `GET /api/claims/mine` | User | List the signed-in user's submitted claims & statuses |
| **Admin** | `GET /api/admin/overview` | Admin | Dashboard counts (`activeReports`, `returnedItems`, `possibleMatches`, `pendingClaims`) |
| **Admin** | `GET /api/admin/claims` | Admin | List claims filtered by `status` (`pending` \| `approved` \| `rejected`) |
| **Admin** | `POST /api/admin/claims/:id/decision` | Admin | `approve` or `reject` a pending claim |
| **Admin** | `GET /api/admin/items` | Admin | List all items with owner email and `privateDetail` |
| **Admin** | `DELETE /api/admin/items/:id` | Admin | Delete an item and cascade-delete related claims & matches |
| **Campus** | `GET /api/meta` | Public | Return zones, categories, colours, deposits, and map center |
| **Campus** | `GET /api/map` | Public | Aggregate lost/found counts & recent items per zone |
| **Matches** | `GET /api/matches/mine` | User | Return up to 20 active matches across the user's open reports |
| **Alerts** | `GET /api/notifications` | User | Fetch latest 50 notifications for the user |
| **Alerts** | `POST /api/notifications/read-all` | User | Mark all of the user's notifications as read |

---

## Project Structure

```text
LostLink/
├── backend/
│   ├── config/               # Environment loader (config.js) & MongoDB + fallback connector (db.js)
│   ├── controllers/          # MVC handlers (authController, itemController, claimController, miscController)
│   ├── middleware/           # Auth middleware export wrapper
│   ├── models/               # Mongoose schemas (User, Item, Claim, Match, Notification, index.js)
│   ├── routes/               # Express routers (auth.js, items.js, claims.js, misc.js)
│   ├── scripts/              # Database inspection helpers (viewDb.js, shellDb.js)
│   ├── services/             # MVC service shims (matchingService, mailerService, notifyService, firebaseService)
│   ├── http.js               # HttpError & bounded string sanitizer
│   ├── itemModel.js          # Public item serializer & privateDetail masking
│   ├── matching.js           # 100-point rule-based matching engine
│   ├── mailer.js             # Nodemailer SMTP & console fallback transport
│   ├── notify.js             # In-app + HTML email notification builder
│   ├── middleware.js         # JWT cookies, Bearer auth, role guards, IP rate limiter
│   ├── seed.js               # Admin account & demo data seeder
│   └── server.js             # Express entry point serving API + frontend/ static files
├── frontend/
│   ├── css/                  # Page stylesheets + shared.css design system
│   ├── js/                   # Frontend page controllers, config.js, shared.js, map.js, report.js
│   ├── vendor/leaflet/       # Bundled Leaflet 1.9.4 JS, CSS, sourcemaps, and marker icons
│   ├── index.html            # Landing page + recently returned items feed
│   ├── browse.html           # Searchable & filterable active reports board
│   ├── lost.html             # Lost item submission form
│   ├── found.html            # Found item submission form with custody tracking
│   ├── map.html              # Interactive Chitkara campus map
│   ├── item.html             # Item details, photo viewer, matches, & claim modal
│   ├── profile.html          # User dashboard (reports, claims, matches, notifications)
│   ├── signin.html           # Local + Firebase authentication page
│   ├── admin.html            # Admin moderation panel & claim verification queue
│   └── how-it-works.html     # Student guide to reporting, matching, and claiming
├── docs/
│   └── LOCAL_SETUP.md        # Step-by-step local MongoDB & environment setup
├── postman/                  # Granular Postman workspace & request YAML definitions
├── LostLink_API_Collection.json # Exported Postman / Thunder Client collection
├── .env.example              # Environment variable template (no real secrets)
├── package.json              # Scripts & Node.js dependencies
└── README.md
```

---

## Configuration & Local Setup

Requires **Node.js `>=18`**. See [`docs/LOCAL_SETUP.md`](docs/LOCAL_SETUP.md) for detailed MongoDB Compass / Atlas instructions.

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Create environment configuration:**
   Copy `.env.example` to `.env` and fill in your private settings (`MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and optional `SMTP_*` / `FIREBASE_*` values).
   - Keep `.env` private and untracked by Git.
   - If `MONGODB_URI` is not reachable locally, the app automatically boots an embedded MongoDB instance via `mongodb-memory-server`.
   - If `SMTP_HOST` / `SMTP_USER` are left blank, outgoing emails are printed directly to the server terminal.
3. **Start the server:**
   ```bash
   npm start
   ```
   Open `http://localhost:3000` in your browser.

---

## Scripts & API Testing

| Command | Purpose |
| :--- | :--- |
| `npm start` | Start Express + MongoDB server (`node backend/server.js`) |
| `npm run dev` | Start server in watch mode (`node --watch backend/server.js`) |
| `npm run db:view` | Inspect database collections via `backend/scripts/viewDb.js` |
| `npm run db:shell` | Launch interactive DB inspection shell (`backend/scripts/shellDb.js`) |

To test endpoints directly, import [`LostLink_API_Collection.json`](LostLink_API_Collection.json) into **Postman** or **VS Code Thunder Client** (or open the YAML workspace under `postman/`).
