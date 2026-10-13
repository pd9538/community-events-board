# Community Events Board

A full-stack community events platform built with Next.js, TypeScript, PostgreSQL and Prisma.

Users can discover upcoming community events, filter and search events, save favourite categories, view a personalized feed, set reminders, and design personalized event cards.

Admins can create and manage events and activate/deactivate them.

---

## Tech Stack

### Frontend
- Next.js
- TypeScript
- React
- Tailwind CSS
- Next.js App Router

### Backend
- Next.js API Routes
- JWT Authentication
- bcryptjs for password hashing

### Database
- PostgreSQL
- Prisma ORM

### Development
- Node.js
- npm
- Git / GitHub

---

## Features

### Visitor / User Features

- Browse upcoming active events
- Search events by title, description or city
- Filter events by category and city
- Combine search and filters
- Pagination
- Event details page
- User signup and login
- JWT-based authentication
- Favourite category selection
- Personalized "My Feed"
- Remind Me functionality
- Persistent reminders
- Event Card Designer
- Three card background themes
- Five available stickers
- Maximum three stickers per card
- Saved card design persists after refresh
- Responsive design for desktop and mobile
- Loading, empty and error states
- Indian Rupee price formatting
- Friendly date/time formatting

### Admin Features

- Admin authentication
- View all events
- Add new events
- Edit existing events
- Activate/deactivate events
- No delete operation is provided for events

---

## Project Structure

```text
community-events-board/
│
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── admin/
│   │   │   ├── auth/
│   │   │   ├── card-design/
│   │   │   ├── events/
│   │   │   ├── favourites/
│   │   │   ├── feed/
│   │   │   └── reminders/
│   │   │
│   │   ├── admin/
│   │   ├── events/
│   │   ├── favourites/
│   │   ├── feed/
│   │   ├── login/
│   │   ├── signup/
│   │   └── page.tsx
│   │
│   ├── generated/
│   │   └── prisma/
│   │
│   └── lib/
│       ├── auth.ts
│       ├── prisma.ts
│       └── require-auth.ts
│
├── prisma.config.ts
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
