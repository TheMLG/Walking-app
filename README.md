# WalkWar

WalkWar is a simple MERN walking tracker for personal workout logging and a global leaderboard.

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

## MongoDB

Use a local MongoDB instance or MongoDB Atlas. The backend reads `MONGODB_URI` from environment variables.

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
