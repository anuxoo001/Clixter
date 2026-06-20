# Deployment Instructions

## Vercel (Client)

This repository deploys the React client from the `client` folder on Vercel.

### Required settings

- **Project Root**: `client`
- **Framework Preset**: Vite / Auto-detect
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Required environment variables on Vercel

- `VITE_API_URL` — URL of your deployed server API (Render service URL)

If your app uses other client-side envs, add them here using the `VITE_` prefix.

## Render (Server)

This repository uses `render.yaml` to deploy the Express server from the `server` folder.

### Render service settings

- **Project**: leave blank if not using Render Projects
- **Environment**: `Node`
- **Branch**: `main`
- **Region**: `Oregon (US West)`
- **Root Directory**: `server`
- **Build Command**: `npm install`
- **Start Command**: `npm run start`

### Required environment variables on Render

- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — JSON Web Token secret
- `CLIENT_URLS` — Comma-separated list of allowed client URLs, e.g. `https://clixter.vercel.app`
- `NODE_ENV` — `production`

### Render manifest files

- `render.yaml` — defines the Render web service
- `.renderignore` — excludes local files and secrets from deploy

## Notes

- Do not commit secret values to Git.
- After the server is deployed on Render, set `VITE_API_URL` in Vercel to the Render service URL.
- Redeploy the Vercel project after updating environment variables.
