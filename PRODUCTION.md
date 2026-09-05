# Jerry frontend — production (Vercel)

## Dashboard environment variables

Vite inlines `VITE_*` at **build** time. Set these in the Vercel project → Settings → Environment Variables (Production), then **redeploy**.

```env
VITE_API_BASE_URL=https://jerry-api-d34t.onrender.com/api

VITE_FIREBASE_API_KEY=AIzaSyBYSrRLlg6ePt88iZynE2Bl8Ec7lgSF4JY
VITE_FIREBASE_AUTH_DOMAIN=jerry999-a281d.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=jerry999-a281d
VITE_FIREBASE_STORAGE_BUCKET=jerry999-a281d.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=677509575378
VITE_FIREBASE_APP_ID=1:677509575378:web:91969faa65802386a2330b
```

`vercel.json` rewrites all paths to `index.html` so `/sign-in` and `/c/:sessionId` work on refresh.

## Firebase Console (manual)

Authentication → Settings → **Authorized domains** must include:

- `localhost`
- your Vercel production host (e.g. `jerry.vercel.app` or custom domain)
- `jerry999-a281d.firebaseapp.com`

Google and GitHub providers must be enabled. GitHub needs the OAuth app callback:

`https://jerry999-a281d.firebaseapp.com/__/auth/handler`

## CORS on the API

Render `FRONTEND_URL` must be `https://<that-same-vercel-host>` with no trailing slash.
