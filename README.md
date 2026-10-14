# Matchwork — Job Match Analyser

A private, browser-side résumé and job description comparison tool. It highlights overlapping skills, role keywords, and areas you may want to make more visible in your application. The result is a writing aid, not a hiring prediction.

## Project structure

```text
apps/web/                     Next.js interface, deployable to Vercel
packages/matching-engine/     Shared TypeScript matching logic
```

## Run locally

Requires Node.js 20.9 or newer and npm.

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Deploy to Vercel

Import this repository into Vercel. Choose `apps/web` as the application root directory. Vercel will detect Next.js and use the root npm workspace for dependency installation. The app uses no database or environment variables.

## Current scope

- Paste résumé and job description text or upload a text based `.pdf`, `.txt`, or `.md` résumé. PDF extraction happens in the browser; scanned image-only PDFs need OCR and can be pasted after text recognition.
- See a keyword overlap score, matching strengths, and role terms to consider highlighting.
- All matching runs locally in the browser; the current app has no server-side storage.

The matching package uses a lightweight skills vocabulary and keyword extraction. Review the results in context and only add skills you can support with real examples.
