# Walkin' Bros

Walkin' Bros is a mobile-first MERN walking tracker for personal workout logging, spirit animal avatars, and a global leaderboard.

## What is implemented now

Phase 1 is in place:

- JWT auth with HTTP-only cookies
- Register, login, logout, and session restore
- Global leaderboard showing every registered user
- Secure backend scaffolding with MongoDB models and ownership checks
- Mobile-first dark dashboard UI

## Project structure

- `Backend/` - Express API, MongoDB models, auth, workout endpoints, and global leaderboard
- `Frontend/` - React + Vite client with the phase 1 UI

## Environment setup

Copy the example files:

- `Backend/.env.example` to `Backend/.env`
- `Frontend/.env.example` to `Frontend/.env`

### Backend env

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/walkwar
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_ORIGIN=http://localhost:5173
COOKIE_SECURE=false
MIN_QUALIFYING_DURATION_MINUTES=5
```

### Frontend env

```env
VITE_API_URL=http://localhost:5000
```

## Install dependencies

From the repo root:

```bash
cd Backend
npm install

cd ../Frontend
npm install
```

## Run locally

Start the backend:

```bash
cd Backend
npm run dev
```

Start the frontend in another terminal:

```bash
cd Frontend
npm run dev
```

## MongoDB Compass

MongoDB Compass is a graphical client for MongoDB; the MongoDB server must also be
running locally. Install MongoDB Community Server, start the MongoDB service, and
connect Compass to:

```text
mongodb://127.0.0.1:27017
```

Create or select the `walkwar` database in Compass. The backend connects to that
database using:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/walkwar
```

The database and collections are created automatically when the application first
writes data. If you use MongoDB Atlas instead, replace `MONGODB_URI` with the
connection string copied from Atlas and use that same URI in Compass.

## API endpoints

Implemented core endpoints include:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/leaderboard`
- `GET /api/dashboard`
- `GET /api/analytics`

Workout, weight, goal, and profile endpoints are also scaffolded for the next phases.

## Notes

- The app uses HTTP-only cookies for auth.
- Mutating requests use a CSRF token from `GET /api/auth/csrf`.
- Dashboard and leaderboard calculations use UTC consistently.
