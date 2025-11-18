# EarthBreath - Climate & Health Monitoring Dashboard

A comprehensive dashboard for monitoring global climate data and NYC-specific health metrics, particularly focused on asthma-related data.

## Project Structure

```
EarthBreathWeb/
├── earthbreath-frontend/     # React + Vite frontend
│   ├── src/
│   │   ├── api/              # API client
│   │   ├── components/       # React components
│   │   └── pages/            # Page components
│   └── package.json
│
└── backend/                   # FastAPI backend
    ├── app/
    │   ├── api/              # API routes
    │   ├── db/               # Database setup
    │   ├── models/           # SQLAlchemy models
    │   └── main.py           # FastAPI app
    ├── requirements.txt
    └── earthbreath.db        # SQLite database (created after init)
```

## Getting Started

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install Python dependencies:**
```bash
pip install -r requirements.txt
```

3. **Initialize database:**
```bash
python -m app.db.init_db
```

4. **Start the backend server:**
```bash
uvicorn app.main:app --reload --port 8000
```

Backend API will be available at `http://localhost:8000`
- API Docs: http://localhost:8000/docs

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd earthbreath-frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start development server:**
```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

## Features

### User Registration & Authentication
- Multi-step registration form with asthma questionnaire
- User data storage in SQLite database
- Login functionality

### Global Climate Dashboard
- Overview of global climate indicators
- Individual gas pages (CO₂, CH₄, N₂O, SF₆)
- Time and region filtering capabilities

### NYC Dashboard
- Local climate data visualization
- Asthma case data by region
- Hospital resource information

### Database Schema
- **Users**: Stores registration and questionnaire data
- **Gas Data**: Stores climate gas measurements for visualization

## Technology Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: FastAPI (Python)
- **Database**: SQLite
- **ORM**: SQLAlchemy
- **Styling**: CSS with green/blue theme

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### Data
- `GET /api/data/gas` - Get gas data with filters
- `POST /api/data/gas` - Create gas data entry

See backend README for complete API documentation.

