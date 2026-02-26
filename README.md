# LinkVault

A secure, PIN-protected URL shortener with automatic QR code generation.

# Live URL
Frontend: **https://url-shortener-nu-lemon.vercel.app/**
Backend: **https://url-shortener-nu-lemon.vercel.app/Vfe0fa** - Pin (1234)

## Features

- **PIN Protection** — every short link requires a 4-digit PIN to access
- **Malware Filter** — automatically rejects URLs containing suspicious keywords
- **QR Code Generation** — generates a downloadable QR code for every short link
- **In-Memory Caching** — fast reads via a global cache, no disk I/O on lookups
- **Buffered Saving** — debounced writes to prevent disk-lock under high traffic
- **Auto-Expiry** — links expire after 30 days
- **Rate Limiting** — 10 requests per minute per IP

## Tech Stack

**Frontend**

- React + Vite
- Tailwind CSS
- React Router
- qrcode (QR generation)

**Backend**

- Node.js + Express
- File-based storage via `links.json`

## Project Structure

```
url-shortener/
├── client/          # React frontend
│   ├── src/
│   │   ├── App.jsx          # Home page
│   │   ├── Form.jsx         # URL shortening form
│   │   ├── RedirectPage.jsx # Handles short link redirects
│   │   ├── routes.jsx       # React Router config
│   │   └── main.jsx         # Entry point
│   └── vite.config.js
└── server/          # Express backend
    ├── server.js
    └── links.json   # Auto-generated on first link creation
```

## Getting Started

### Installation

1. Clone the repo:

   ```bash
   git clone https://github.com/your-username/url-shortener.git
   cd url-shortener
   ```

2. Install client dependencies:

   ```bash
   cd client && npm install
   ```

3. Install server dependencies:
   ```bash
   cd server && npm install
   ```

### Running Locally

Run both servers in separate terminals:

```bash
# Terminal 1 — frontend (http://localhost:5173)
cd client && npm run dev

# Terminal 2 — backend (http://localhost:3001)
cd server && node server.js
```

Vite dev server proxy `/api/*` to request to the Express server automatically.

## API Reference

### Create a short link

```
POST /api/links
```

**Body:**

```json
{
  "long_url": "https://example.com/very/long/path",
  "pin": "1234"
}
```

**Response:** `201 Created`

```json
{
  "id": "abc123",
  "short_url": "https://your-domain.com/abc123",
  "long_url": "https://example.com/very/long/path",
  "created": "2025-02-24T13:45:00.000Z",
  "expires": "2025-03-26T13:45:00.000Z"
}
```

### Look up a short link

```
GET /api/:shortCode
```

**Response:** `200 OK`

```json
{
  "requiresPin": true,
  "long_url": "https://example.com/very/long/path",
  "id": "abc123"
}
```

### Verify PIN and get destination

```
POST /api/:shortCode/verify
```

**Body:**

```json
{ "pin": "****" }
```

**Response:** `200 OK`

```json
{ "long_url": "https://example.com/very/long/path" }
```

### Status Codes

| Code | Meaning                                 |
| ---- | --------------------------------------- |
| 201  | Link created successfully               |
| 200  | OK                                      |
| 400  | Bad request (missing fields, wrong PIN) |
| 404  | Link not found or expired               |
| 429  | Rate limit exceeded                     |

## Deployment (Render)

### Backend

- **Root Directory:** `server`
- **Build Command:** `npm install`
- **Start Command:** `nodemon server.js`

### Frontend (Static Site)

- **Root Directory:** `client`
- **Build Command:** `npm install && npm run build`
- **Environment Variable:** `Backend url to connect`

## Author

Victor Ayoola
