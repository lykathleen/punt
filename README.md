# Punt

Punt is a football prediction app. Users will predict match scores, earn points when
results are scored, and move through competition leaderboards over time.

## What The App Tracks

- Users with per-competition points and ranks
- Competitions, such as a tournament or league
- Teams belonging to competitions
- Matches with kickoff times, status, score, stage, and round
- Predictions for each user and match
- Scoring events as the source of truth for points history
- Current and historical leaderboard snapshots

## Project Structure

```text
client/                 React + Vite app
server/                 Express API
server/src/models/      Mongoose models
server/src/routes/      API routes
```

The main domain models live in `server/src/models`:

- `User`
- `Competition`
- `Team`
- `Match`
- `Prediction`
- `ScoringEvent`
- `LeaderboardCurrent`
- `LeaderboardSnapshot`

## Setup

```bash
npm install
npm run dev
```

The React app runs on `http://localhost:5173`, and the API runs on `http://localhost:3001`.

## Database

The server connects to MongoDB using `MONGODB_URI`.

```bash
cp server/.env.example server/.env
```

For MongoDB Atlas, set `server/.env` to your Atlas connection string:

```bash
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/punt?retryWrites=true&w=majority
JWT_SECRET=<long-random-secret>
PORT=3001
CLIENT_ORIGIN=http://localhost:5173
APP_URL=http://localhost:5173
RESEND_API_KEY=
EMAIL_FROM=Punt <onboarding@resend.dev>
```

The server defaults to a local MongoDB database at
`mongodb://127.0.0.1:27017/punt_hello_world` if `MONGODB_URI` is not set.

If you change the API URL for the client, copy `client/.env.example` to `client/.env` and update
`VITE_API_URL`.

## Authentication

The app uses passwordless magic-link authentication:

- Users enter their email address
- The server creates a one-time login token and stores only a SHA-256 hash of it
- Magic links expire after 15 minutes and can only be used once
- Sessions are signed with `jsonwebtoken`
- The JWT is stored in an HTTP-only cookie named `punt_token`
- Protected API routes use `requireAuth` middleware

In development, login links are printed to the API console. To send real emails, set
`RESEND_API_KEY` and `EMAIL_FROM` in `server/.env`.

## API

Current scaffold endpoints:

- `GET /api/health` returns API and database status
- `POST /api/auth/magic-link` creates and sends a one-time login link
- `POST /api/auth/verify` verifies a magic link and starts a session
- `POST /api/auth/logout` ends the current session
- `GET /api/auth/me` returns the logged-in user
- `GET /api/hello` returns a simple protected API response and database connection status

The next backend step is to add routes for competitions, teams, matches, predictions, and
leaderboards.

## Useful Scripts

```bash
npm run dev      # start client and server
npm run build    # build the React client
npm start        # start the Express server
```
