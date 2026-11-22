# Link Shortener (MERN)

Paste a long URL, get a short one. Track clicks, copy, and delete links.
Runs locally (Windows/Mac/Linux) and deploys to Vercel.

## Run locally
Requires Node 18+ and MongoDB (local install or a free Atlas cluster).

```bash
# 1. API (from the project root)
copy server\.env.example server\.env     # Windows (use cp on Mac/Linux); edit MONGO_URI if needed
npm install
npm run dev                              # http://localhost:5000

# 2. Frontend (new terminal)
cd client
npm install
npm run dev                              # http://localhost:5173
```

## Deploy to Vercel
Vercel can't reach MongoDB on your laptop, so use **MongoDB Atlas** (free tier).

1. **Atlas**: create a cluster and a database user. Under *Network Access*, allow `0.0.0.0/0`
   (Vercel's IPs aren't fixed). Copy the connection string, e.g.
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/link-shortener`
2. **Push** this project to GitHub (the root folder, not just `client/`).
3. **Vercel**: *Add New Project* → import the repo. Leave Root Directory as the repo root;
   `vercel.json` handles the build settings.
4. Add the environment variable `MONGO_URI` (your Atlas string). Do **not** set `BASE_URL`;
   short links use your Vercel domain automatically. (If you add a custom domain, you can set
   `BASE_URL` to it.)
5. Deploy.

Or with the CLI: `npm i -g vercel`, then `vercel`, then `vercel env add MONGO_URI`, then `vercel --prod`.

## How it fits together
- `client/` is built by Vite and served as static files.
- `api/index.js` wraps the Express app (`server/app.js`) as a single Vercel function.
- `vercel.json` sends every non-file request (`/api/*` and `/:code`) to that function.
- `server/server.js` is only for local development.

## API
| Method | Route | What it does |
|---|---|---|
| POST | /api/links | Create. Body: `{ "url": "https://...", "alias": "optional" }` |
| GET | /api/links | List all links, newest first |
| DELETE | /api/links/:id | Delete a link |
| GET | /:code | Redirect to the original URL and count a click |
