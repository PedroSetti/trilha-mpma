# Cloudflare Pages migration — 12 November 2026

Production frontend: https://trilha-concursos-pedro.pages.dev/
Backend remains on Render; existing Neon accounts and progress are preserved. The exact Pages origin is added to backend origin checks and Neon Auth. No wildcard trust and no origin spoofing are used.

The Pages advanced-mode worker proxies only /api/* to the fixed backend, preserving cookies, incoming Origin and streamed responses. Cross-origin writes are rejected. Static assets are served by Pages. Authentication remains required in the application.

Build a local package with `python tools/build-cloudflare.py`. It first runs `frontend/build.py`, then produces `frontend/cloudflare-dist` and `frontend/trilha-cloudflare.zip`. The worker source is `frontend/cloudflare-worker.mjs`. Dashboard direct upload supports this worker without compiling a functions folder.

Android 1.0.2 (versionCode 3) opens the new Pages URL, retains the existing signing key, and permits microphone capture only for the exact trusted app origins. Existing installations need the new APK to change their starting hostname.

Includes 118 new authored topics (511 career topics total), 282 course lessons in the shared library, 199 official public Estratégia videos, 1–180 minute focus sessions and 1–60 minute breaks, and the prepared audio/Enter support update. Historical references do not guarantee complete coverage of a future edital.

Validation: frontend data and progress regression tests, timer behavior, proxy cookie/origin/error handling, private attachments and audio byte-range tests, Next production build, Android release build/lint and APK signature verification.

The old Netlify site is not deleted and no paid hosting plan is activated.
