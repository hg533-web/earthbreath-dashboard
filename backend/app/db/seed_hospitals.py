"""
Seed script to populate hospitals table with sample NYC entries.
Run from backend directory:
    python -m app.db.seed_hospitals
"""
from app.db.database import SessionLocal
from app.models.hospital import Hospital


SAMPLE_HOSPITALS = [
    # Manhattan
    {
        "name": "Mount Sinai Hospital",
        "borough": "Manhattan",
        "latitude": 40.7892,
        "longitude": -73.9530,
        "address": "1468 Madison Ave, New York, NY 10029",
        "zip_code": "10029",
        "phone": "212-241-6500",
        "specialty": "Pulmonology",
        "description": "Teaching hospital with pulmonary/asthma services",
        "website": "https://www.mountsinai.org",
        "emergency_department": "Yes",
        "beds": 1171,
        "asthma_specialists": 12,
    },
    {
        "name": "Lenox Hill Hospital",
        "borough": "Manhattan",
        "latitude": 40.7737,
        "longitude": -73.9609,
        "address": "100 E 77th St, New York, NY 10075",
        "zip_code": "10075",
        "phone": "212-434-2000",
        "specialty": "Asthma & Allergy",
        "description": "Allergy and respiratory care in Upper East Side",
        "website": "https://lenoxhill.northwell.edu",
        "emergency_department": "Yes",
        "beds": 652,
        "asthma_specialists": 7,
    },
    # Brooklyn
    {
        "name": "NYU Langone - Cobble Hill",
        "borough": "Brooklyn",
        "latitude": 40.6863,
        "longitude": -73.9951,
        "address": "83 Amity St, Brooklyn, NY 11201",
        "zip_code": "11201",
        "phone": "929-455-5000",
        "specialty": "Emergency Care",
        "description": "Emergency and specialty care with respiratory support",
        "website": "https://nyulangone.org",
        "emergency_department": "Yes",
        "beds": 200,
        "asthma_specialists": 4,
    },
    {
        "name": "Maimonides Medical Center",
        "borough": "Brooklyn",
        "latitude": 40.6399,
        "longitude": -73.9989,
        "address": "4802 Tenth Ave, Brooklyn, NY 11219",
        "zip_code": "11219",
        "phone": "718-283-6000",
        "specialty": "Asthma & Allergy",
        "description": "Brooklyn flagship with allergy/asthma clinics",
        "website": "https://maimo.org",
        "emergency_department": "Yes",
        "beds": 711,
        "asthma_specialists": 6,
    },
    # Queens
    {
        "name": "Jamaica Hospital Medical Center",
        "borough": "Queens",
        "latitude": 40.6993,
        "longitude": -73.8076,
        "address": "8900 Van Wyck Expy, Jamaica, NY 11418",
        "zip_code": "11418",
        "phone": "718-206-6000",
        "specialty": "Pulmonology",
        "description": "Pulmonary and critical care with asthma program",
        "website": "https://jamaicahospital.org",
        "emergency_department": "Yes",
        "beds": 408,
        "asthma_specialists": 5,
    },
    {
        "name": "NYC Health + Hospitals/Elmhurst",
        "borough": "Queens",
        "latitude": 40.7441,
        "longitude": -73.8837,
        "address": "79-01 Broadway, Queens, NY 11373",
        "zip_code": "11373",
        "phone": "718-334-4000",
        "specialty": "Pulmonology",
        "description": "Safety-net hospital with strong pulmonary department",
        "website": "https://www.nychealthandhospitals.org/elmhurst",
        "emergency_department": "Yes",
        "beds": 545,
        "asthma_specialists": 5,
    },
    # Bronx
    {
        "name": "BronxCare Health System",
        "borough": "Bronx",
        "latitude": 40.8429,
        "longitude": -73.9117,
        "address": "1650 Grand Concourse, Bronx, NY 10457",
        "zip_code": "10457",
        "phone": "718-590-1800",
        "specialty": "Asthma & Allergy",
        "description": "Community hospital with asthma/allergy clinic",
        "website": "https://www.bronxcare.org",
        "emergency_department": "Yes",
        "beds": 972,
        "asthma_specialists": 6,
    },
    {
        "name": "Jacobi Medical Center",
        "borough": "Bronx",
        "latitude": 40.8570,
        "longitude": -73.8456,
        "address": "1400 Pelham Pkwy S, Bronx, NY 10461",
        "zip_code": "10461",
        "phone": "718-918-5000",
        "specialty": "Pulmonology",
        "description": "Public hospital with comprehensive respiratory services",
        "website": "https://www.nychealthandhospitals.org/jacobi",
        "emergency_department": "Yes",
        "beds": 457,
        "asthma_specialists": 5,
    },
    # Staten Island
    {
        "name": "Richmond University Medical Center",
        "borough": "Staten Island",
        "latitude": 40.6438,
        "longitude": -74.1009,
        "address": "355 Bard Ave, Staten Island, NY 10310",
        "zip_code": "10310",
        "phone": "844-934-CARE",
        "specialty": "Emergency Care",
        "description": "Full-service hospital with emergency and respiratory care",
        "website": "https://www.rumcsi.org",
        "emergency_department": "Yes",
        "beds": 470,
        "asthma_specialists": 3,
    },
    {
        "name": "Staten Island University Hospital - North",
        "borough": "Staten Island",
        "latitude": 40.6274,
        "longitude": -74.0782,
        "address": "475 Seaview Ave, Staten Island, NY 10305",
        "zip_code": "10305",
        "phone": "718-226-9000",
        "specialty": "Pulmonology",
        "description": "Northwell facility with pulmonary and critical care",
        "website": "https://siuh.northwell.edu",
        "emergency_department": "Yes",
        "beds": 668,
        "asthma_specialists": 4,
    },
    # Queens additional
    {
        "name": "NewYork-Presbyterian Queens",
        "borough": "Queens",
        "latitude": 40.7540,
        "longitude": -73.8448,
        "address": "56-45 Main St, Flushing, NY 11355",
        "zip_code": "11355",
        "phone": "718-670-2000",
        "specialty": "Pulmonology",
        "description": "Large Queens hospital with respiratory care",
        "website": "https://www.nyp.org/queens",
        "emergency_department": "Yes",
        "beds": 535,
        "asthma_specialists": 6,
    },
]


def seed_hospitals():
    db = SessionLocal()
    try:
        inserted = 0
        for h in SAMPLE_HOSPITALS:
            if db.query(Hospital).filter_by(name=h["name"]).first():
                continue
            db.add(Hospital(**h))
            inserted += 1
        db.commit()
        print(f"Inserted {inserted} hospital(s)")
    finally:
        db.close()


if __name__ == "__main__":
    seed_hospitals()
