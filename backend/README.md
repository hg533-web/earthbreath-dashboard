# EarthBreath Backend API

FastAPI backend with SQLite database for the EarthBreath Climate & Health Dashboard.

## Setup

1. **Install Python dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

2. **Initialize the database:**
```bash
python -m app.db.init_db
```

This will create `earthbreath.db` SQLite database file with all necessary tables.

3. **Run the development server:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, you can access:
- **Interactive API docs (Swagger UI):** http://localhost:8000/docs
- **Alternative API docs (ReDoc):** http://localhost:8000/redoc

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### Users
- `GET /api/users/` - Get all users
- `GET /api/users/{user_id}` - Get user by ID
- `GET /api/users/by-email/{email}` - Get user by email

### Gas Data
- `POST /api/data/gas` - Create gas data entry
- `GET /api/data/gas` - Get gas data (with filters: gas_type, region, start_date, end_date)
- `GET /api/data/gas/{data_id}` - Get gas data by ID
- `GET /api/data/gas/types/list` - Get list of available gas types
- `GET /api/data/gas/regions/list` - Get list of available regions

## Database Schema

### Users Table
Stores user registration and questionnaire data:
- Basic info (name, email, password_hash)
- Asthma information (severity, triggers, symptoms, medication, control)
- Location & hospital (zip_code, selected_hospital)
- Emergency contact info

### Gas Data Table
Stores climate gas data for visualization:
- gas_type (CO2, CH4, N2O, SF6)
- region (country/region name)
- date, value, unit
- source and notes

## Environment Variables

You can create a `.env` file to customize:
- `DATABASE_URL` - SQLite database path (default: `sqlite:///./earthbreath.db`)

## Adding Sample Data

You can add sample gas data via the API:
```bash
curl -X POST "http://localhost:8000/api/data/gas" \
  -H "Content-Type: application/json" \
  -d '{
    "gas_type": "CO2",
    "region": "USA",
    "date": "2024-01-01",
    "value": 420.5,
    "unit": "ppm"
  }'
```

