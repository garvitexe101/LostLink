# LostLink

> **Lost, found, back to you.**  
> A campus lost-and-found web application for Chitkara University, Rajpura Campus.

LostLink helps students report lost or found belongings, browse active reports, verify ownership before making a claim, and lets an administrator review those claims. It is built as a standalone front-end prototype using **HTML, CSS, and JavaScript**.

## Open the project

Open [index.html](index.html) in a browser. For the smoothest experience in VS Code, install the **Live Server** extension, right-click `index.html`, and select **Open with Live Server**.

No npm install, database, or server setup is required for this Phase 1 version.

## Explore the experience

| What you want to do | Where to go | What happens |
| --- | --- | --- |
| Report a missing belonging | [lost.html](lost.html) | Submit a lost-item report with category, colour, location, date, time, photo preview, and private ownership detail. |
| Help return an item | [found.html](found.html) | Add a found-item report and safe deposit location. |
| Search reported items | [browse.html](browse.html) | Filter by category and report type, or search by item, colour, and location. |
| View locations | [map.html](map.html) | Select a campus location to show relevant active reports. |
| Claim a found item | Any item card | Answer specific ownership questions before the claim is sent to an administrator. |
| View your activity | [profile.html](profile.html) | See your reports, possible matches, and claim notifications. |
| Moderate the platform | [admin.html](admin.html) | Review claims, accept/reject rightful owners, and remove inappropriate listings. |

## Quick demo flow

1. Open `index.html` and select **I lost something** or **I found something**.
2. Sign in with any university-style email address, for example `student@chitkara.edu`.
3. Submit a report. It is stored in your current browser using `localStorage`.
4. Open **Browse** or **Campus map** to find the report.
5. Open a found-item card and complete all four ownership questions to submit a claim.
6. Go to the admin dashboard and sign in using the demo credentials below.
7. Open a listed item, check the student answers, then accept or reject the claim.

  
## Live Demo
link - https://lostlink-topaz.vercel.app/index.html



## Key Phase 1 features

- Student and administrator sign-in flows
- Separate pages for reporting lost and found items
- Required form validation and modern campus location dropdowns
- Manual time field with AM/PM selection
- Local image-upload preview for reports
- Browser-based report storage with `localStorage`
- Smart possible-match indicator using item category and campus location
- Dedicated browse directory with category and type filters
- Interactive illustrated Rajpura-campus location map
- Item detail page with secure ownership-verification questions
- Student profile with **My Reports** and notification centre
- Admin dashboard with claim review, accept/reject actions, and item removal
- Recently returned section and campus safety reminder
- Responsive layout for desktop and mobile screens

## Ownership validation

LostLink does not expose private ownership details publicly. To claim a found item, the claimant must correctly provide:

1. The item colour
2. The reported location
3. One private item feature
4. A word from the public description

Only valid answers create a pending claim. The administrator can then approve the correct claimant, mark the item as returned, and send an in-app collection notification.

## Project structure

```text
campusfound-phase1/
├── index.html            # Home page
├── browse.html           # Item directory and filters
├── lost.html             # Lost-item report form
├── found.html            # Found-item report form
├── map.html              # Interactive illustrated campus map
├── how-it-works.html     # Process, trust information, and contact form
├── profile.html          # Student profile and notifications
├── admin.html            # Administrator dashboard
├── item.html             # Item details, claims, and admin item review
├── style.css             # Complete responsive styling
├── script.js             # Application functionality and local storage logic
└── lostlink-logo-v4.svg  # Final LostLink browser icon
```

## Technology used

| Technology | Purpose |
| --- | --- |
| HTML5 | Page structure and accessible forms |
| CSS3 | Responsive layout, animations, interactive states, and visual design |
| Vanilla JavaScript | Form handling, matching, filtering, auth prototype, claims, and `localStorage` |
| Google Fonts | DM Sans and Playfair Display typography |
| Browser `localStorage` | Prototype data persistence without a backend |

## Important Phase 1 limitations

This is intentionally a front-end prototype. Data is saved only in the browser that created it. Clearing browser data clears reports, notifications, and sign-in state.

Before using the project publicly, Phase 2 should add:

- Secure backend authentication (for example Google OAuth or university SSO)
- Database storage for reports, images, users, and claims
- Real administrator roles and permission checks
- Secure cloud image uploads
- Email or push notifications
- Server-side matching and moderation logs
- A real campus map API with live item markers

## Safety note

Arrange handovers only in visible, busy campus locations such as the Security Office or Student Centre. Never share personal contact information or meet in isolated areas through the prototype.

---

Built for the **LostLink Phase 1** university evaluation project.
