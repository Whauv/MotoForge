# MotoForge

## Overview
MotoForge is a 3D motorcycle modification configurator that lets riders start from a base motorcycle, apply compatible aftermarket parts, and review real-time performance and pricing changes before committing to a physical build. The stack is split into a FastAPI backend for catalog and quote logic and a Next.js App Router frontend for the 3D customization experience.

## Tech Stack
- Frontend: Next.js 14, React 18, Tailwind CSS, Axios
- 3D Rendering: Three.js, React Three Fiber, Drei, React Spring
- Backend: FastAPI, SQLAlchemy, Pydantic Settings, Uvicorn
- Database: SQLite for MVP, Alembic-ready backend structure
- Export and Docs: jsPDF, jspdf-autotable
- Containerization: Docker Compose

## Folder Structure
```text
motoforge/
├── apps/
│   ├── api/
│   │   ├── app/
│   │   ├── seed/
│   │   └── tests/
│   └── web/
│       ├── app/
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       └── styles/
├── infra/
│   └── docker-compose.yml
└── README.md
```

## Local Setup
### Without Docker
1. Create and activate a Python virtual environment inside `apps/api`.
2. Install backend dependencies:
```bash
cd apps/api
pip install -r requirements.txt
```
3. Start the API:
```bash
uvicorn app.main:app --reload
```
4. In a second terminal, install frontend dependencies:
```bash
cd apps/web
npm install
```
5. Start the frontend:
```bash
npm run dev
```
6. Open `http://localhost:3000`.

### With Docker
1. Ensure Docker Desktop is running.
2. From the `infra/` folder run:
```bash
docker compose up --build
```
3. Open the app at `http://localhost:3000` and the API at `http://localhost:8000`.

## Seeding the DB
Run the backend seed script after dependencies are installed:
```bash
cd apps/api
python seed/seed.py
```
This inserts the Benelli 502C plus the initial compatibility-linked MotoForge parts catalog.

## Running Tests
Backend tests:
```bash
cd apps/api
python -m pytest tests/test_quotes.py
```

Frontend checks:
```bash
cd apps/web
npm run build
```

## Deployment to GCP
1. Containerize `apps/api` and `apps/web` with production-ready Dockerfiles.
2. Push images to Google Artifact Registry.
3. Deploy the API to Cloud Run with a persistent managed database in place of SQLite for production.
4. Deploy the Next.js frontend to Cloud Run or App Engine with `NEXT_PUBLIC_API_URL` pointed at the live API.
5. Add HTTPS, a custom domain, and secrets through Secret Manager and Cloud Build pipelines.

## Contributing
1. Create a feature branch from `main`.
2. Keep backend and frontend changes scoped and testable.
3. Run backend tests and a frontend build before opening a pull request.
4. Avoid committing local files such as `.env.local`, database files, or generated caches.
5. Document any new setup requirements in this README.
