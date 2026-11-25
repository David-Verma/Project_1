# Hashnode — Developer publishing platform

A full-stack MERN publishing app built to the attached capstone requirements. The React/Vite single-page client talks to an Express JSON API. MongoDB stores users, posts, and topics.

## Included in the MVP

- Account registration and login, bcrypt password hashing, JWT authentication, persistent client sessions, and protected pages.
- Email verification with expiring signup codes sent through Gmail SMTP.
- Draft and published post creation, Markdown writing with live preview, editing and deletion, tag creation, excerpts, and cover image URLs.
- Server-side ownership enforcement for post edits and deletion. Only published posts can be read from public feeds, post pages, tags, or profiles.
- Public newest-first feed, title search, paginated results, topic directory and filtered pages, public author profiles, and profile editing.
- Responsive layout, loading/empty/error feedback, and Markdown rendering with fenced-code syntax highlighting.

The optional stretch goals in the requirements (reactions, comments, following, bookmarks, uploads, and dark mode) are not part of the required MVP.

## Run locally

Requirements: Node.js LTS, npm, and a MongoDB instance (local MongoDB or MongoDB Atlas).

1. Copy `server/.env.example` to `server/.env` and set `MONGO_URI`, a long random `JWT_SECRET`, `SMTP_USER`, and a Gmail app password in `SMTP_APP_PASSWORD`. For local MongoDB, the example URI is ready to use.
2. Copy `client/.env.example` to `client/.env` if the API will not run at `http://localhost:5000/api`.
3. From the repository root run `npm install`, then `npm run dev`.
4. Open the Vite URL shown in the terminal (normally `http://localhost:5173`). The API runs on port 5000. Check `http://localhost:5000/api/health` for API status.

No production credentials are included. Keep `.env` files private; `.gitignore` excludes them. Never deploy the example JWT secret.

## Environment variables

### `server/.env`

| Variable | Purpose |
| --- | --- |
| `PORT` | API port; defaults to `5000` |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Private signing key; use a long, random value |
| `JWT_EXPIRES_IN` | Token lifetime; defaults to `7d` |
| `CLIENT_URL` | Allowed browser origin, or comma-separated origins |
| `SMTP_USER` | Gmail address used to send verification emails |
| `SMTP_APP_PASSWORD` | Gmail app password (spaces are ignored) |

### `client/.env`

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | API base URL, including `/api`; defaults to `http://localhost:5000/api` |

## API overview

All protected endpoints accept `Authorization: Bearer <token>`.

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | Start signup and send a verification code |
| POST | `/api/auth/verify-email` | Public | Verify the signup code and create a session |
| POST | `/api/auth/resend-verification` | Public | Resend an unexpired signup code |
| POST | `/api/auth/login` | Public | Sign in |
| GET | `/api/auth/me` | Protected | Validate session and return user |
| GET | `/api/posts?search=&tag=&page=` | Public | Published feed (title search and pagination) |
| GET | `/api/posts/:slug` | Public | Published post |
| GET | `/api/posts/mine` | Protected | Current user's posts including drafts |
| POST | `/api/posts` | Protected | Create a draft or published post |
| PUT | `/api/posts/:id` | Owner | Update a post |
| DELETE | `/api/posts/:id` | Owner | Delete a post |
| GET | `/api/tags` | Public | Topics and published post counts |
| GET | `/api/tags/:slug/posts` | Public | Published posts for a topic |
| GET | `/api/users/:id` | Public | Profile and published posts |
| PUT | `/api/users/me` | Protected | Edit current user's profile |

## Deployment handoff

The code is prepared for separate frontend and API hosting (for example, Vercel/Netlify and Render/Railway) plus MongoDB Atlas. Before deployment, create the hosted database and add `MONGO_URI` and a unique `JWT_SECRET` to the backend's secret environment settings. Set `CLIENT_URL` to the deployed frontend origin. Set `VITE_API_URL` to the deployed API URL ending in `/api`, then build the client with `npm run build -w client`. The frontend host must serve `index.html` for unknown paths so React Router routes work on refresh. Set secrets in the host dashboard, never in committed files.

The deploy account credentials and database connection values will be needed to make the app live. The source code and local configuration templates are ready for those values.
