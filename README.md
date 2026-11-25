# SmartSpend

SmartSpend is a frontend-only personal finance demonstration built with React, Vite, and React Router. User accounts and finance workspaces are stored in the browser's local storage.

## Run locally

```powershell
npm install
npm run dev
```

## Production build

```powershell
npm run build
npm run preview
```

## Deploy to Vercel

Import this repository into Vercel. Vercel detects Vite automatically and uses `npm run build` with `dist` as the output directory. The included `vercel.json` serves the React Router app for direct route requests.

## Demonstration admin account

- Email: `admin@smartspend.demo`
- Password: `Admin123!`

This is an academic frontend demo, not production authentication. Account credentials are stored in local storage and must not be used for real accounts or sensitive financial data.
