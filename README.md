# ATC System — Animal Type Classification

An AI-powered animal type classification system for cattle and buffaloes, built to support the **Rashtriya Gokul Mission** (Ministry of Fisheries, Animal Husbandry & Dairying, Government of India). The system standardizes animal evaluation for Progeny Testing and Pedigree Selection by replacing manual scoring with consistent, AI-driven breed identification and body-structure analysis.

## Features

- **Breed prediction** — upload or capture an image of a cow or buffalo and get an AI-identified breed with a confidence score
- **Live camera capture** — take a photo directly from the browser, tag it with animal details (type, tag number, breed, center), and submit it for processing
- **Classification results** — detailed breakdown of body structure parameters, an overall score, and generated recommendations
- **Records management** — searchable, filterable table of all classified animals with image previews and per-record actions (view, download, delete)
- **Analytics & reports** — summary metrics, classification distribution, breed distribution, and monthly trend charts, exportable as PDF or CSV
- **User accounts** — registration and login, with a settings area for profile, system, notification, display, and default-value preferences
- **BPA integration** — records can be saved to the Bharat Pashudhan App for downstream data management

## Tech stack

- **React** (functional components + hooks)
- **React Router** for client-side routing
- **Tailwind CSS** for styling
- **lucide-react** for icons
- **react-toastify** for notifications
- A REST backend (see [API endpoints](#api-endpoints) below) — framework not specified here; update this section with your actual backend stack (Node/Express, Django, etc.)

## Project structure

```
src/
├── pages/
│   ├── Home.jsx           # Landing page
│   ├── Login.jsx          # Sign in
│   ├── Register.jsx       # Account creation
│   ├── Dashboard.jsx      # Authenticated home (not shown here — add if present)
│   ├── UploadImage.jsx    # Upload an image for breed prediction
│   ├── Capture.jsx        # Live camera capture + animal details form
│   ├── Result.jsx         # Classification result detail view
│   ├── Records.jsx        # Records table, search/filter, image modal
│   ├── Reports.jsx        # Analytics dashboard and export
│   └── Setting.jsx        # Profile and app settings
├── api.js                 # API client (auth, records, reports, images, settings)
└── ...
```

> Adjust this tree to match your actual repository layout — this reflects the pages covered in this project so far.

## Getting started

### Prerequisites

- Node.js 18+ and npm (or yarn/pnpm)
- A running instance of the backend API

### Installation

```bash
git clone <repository-url>
cd <project-directory>
npm install
```

### Environment variables

Create a `.env` file in the project root:

```
VITE_API_URL=http://localhost:8000
```

`UploadImage.jsx` currently points at a hardcoded `http://localhost:8000/api/breed/predict` — consider moving this to the same `VITE_API_URL` environment variable for consistency.

### Run locally

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

## API endpoints

The frontend expects the following backend surface (adjust to match your actual implementation):

| Purpose | Endpoint |
|---|---|
| Breed prediction | `POST /api/breed/predict` |
| Create record | `POST /api/v1/records` |
| List / filter records | `GET /api/v1/records` |
| Download record report | `GET /api/v1/records/:id/report` |
| Reports by date range | via `reportAPI.getByDateRange` |
| Generate / export report | via `reportAPI.generate`, `reportAPI.exportPDF` |
| Image upload | via `imageAPI.upload` |
| Auth (login/register/current user/update) | via `authAPI` |
| Settings (get/update) | via `settingsAPI` |

Authenticated requests use a bearer token stored client-side (`localStorage`) and sent as `Authorization: Bearer <token>`.

## Design system

All pages share a consistent visual language:

- Background: `#FAFAF9`
- Primary accent: `#166534` (hover `#14532D`)
- Borders: `#E5E7EB`
- Text: `#111827` (headings), `#374151` (body), `#6B7280` / `#9CA3AF` (muted)
- Cards: white, `rounded-2xl`, bordered (no drop shadows)
- Buttons: `rounded-full`, filled green for primary actions, outlined for secondary

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Open a pull request

## License

Add your project's license here (e.g. MIT).

## Acknowledgments

Built in support of the Rashtriya Gokul Mission, Ministry of Fisheries, Animal Husbandry & Dairying, Government of India.
