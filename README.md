# EarthBreath - Climate & Health Monitoring Dashboard

A comprehensive dashboard for monitoring global climate data and NYC-specific health metrics, particularly focused on asthma-related data.

## Project Structure

```
EarthBreathWeb/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── api/              # API client
│   │   ├── components/       # React components
│   │   └── pages/            # Page components
│   └── package.json
│
└── backend/                  # FastAPI backend
    ├── app/
    │   ├── api/              # API routes
    │   ├── db/               # Database setup
    │   ├── models/           # SQLAlchemy models
    │   └── main.py           # FastAPI app
    ├── requirements.txt
    └── earthbreath.db        # SQLite database (created after init)
```

## Prerequisites

- **Node.js**: v18 or higher
- **Python**: v3.10 or higher
- **npm**: v9 or higher

## Getting Started

Follow these steps to set up and run the project locally.

### 1. Backend Setup

Open a terminal and navigate to the `backend` directory:

```bash
cd backend
```

Create a virtual environment (recommended):

```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Initialize the database:

```bash
python -m app.db.init_db
```

Start the backend server:

```bash
uvicorn app.main:app --reload --port 8000
```

The Backend API will be available at `http://localhost:8000`.
- **API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Frontend Setup

Open a **new terminal** window and navigate to the `frontend` directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The Frontend will be available at `http://localhost:5173`.

## Features

### Global Climate Dashboard
- **Interactive Globe**: Visualizes air quality and population data for 60+ major cities.
- **Real-time Metrics**: Displays CO₂, Temperature, Methane, and Sea Level trends.
- **Global Extremes**: Highlights cities with the cleanest and most polluted air.
- **Planetary Breath Score**: A composite health score for the planet.

### NYC Dashboard
- Local climate data visualization.
- Asthma case data by region.
- Hospital resource information.

### User System
- User registration and login.
- Asthma questionnaire for personalized tracking.

## Technology Stack

- **Frontend**: React, TypeScript, Vite, React Globe GL
- **Backend**: FastAPI (Python), Pydantic
- **Database**: SQLite, SQLAlchemy
- **Styling**: CSS Modules with a custom dark/eco theme

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### Data
- `GET /api/data/gas` - Get gas data with filters
- `POST /api/data/gas` - Create gas data entry

---

*Built for the Cornell SYSN5151 Course.*
