# FACEMOJI

FACEMOJI uploads a photo, detects face areas with `face_recognition`, and covers selected faces with emojis. Users can add, remove, move, and select face areas manually when automatic detection misses a face.

## Local Development

```bash
./install.sh
.venv/bin/flask --app app run --host 127.0.0.1 --port 3000
```

Open `http://127.0.0.1:3000`.

## Vercel Notes

Static assets live in `public/` so Vercel can serve them from its CDN. The Flask API lives in `app.py` and exposes:

- `GET /api/health`
- `POST /api/detect-faces`

The project includes `vercel.json` to keep local-only files out of the Python Function bundle. It also installs `dlib-bin` first and then installs `face_recognition` with `--no-deps` to avoid compiling `dlib` from source during deployment.

`face_recognition` still depends on native binaries and large model files, so a Vercel deployment can fail if the native dependency or function bundle size exceeds platform limits. If that happens, keep the frontend on Vercel and move the Flask face-detection API to a Docker-capable host.
