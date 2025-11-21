"""
Script to seed initial hospital data into the database
"""
from app.db.database import SessionLocal
from app.models.hospital import Hospital

def seed_hospitals():
    """Add sample hospital data"""
    db = SessionLocal()
    
    try:
        # Check if hospitals already exist
        existing = db.query(Hospital).first()
        if existing:
            print("Hospitals already exist in database. Skipping seed.")
            return
        
        hospitals_data = [
            {
                "name": "Mount Sinai Hospital",
                "borough": "Manhattan",
                "latitude": 40.7925,
                "longitude": -73.9522,
                "address": "1468 Madison Ave",
                "zip_code": "10029",
                "phone": "(212) 241-6500",
                "specialty": "Asthma & Allergy",
                "description": "Comprehensive asthma and allergy treatment center with specialized pediatric services.",
                "website": "https://www.mountsinai.org",
                "emergency_department": "Yes",
                "beds": 1171,
                "asthma_specialists": 15
            },
            {
                "name": "Kings County Hospital Center",
                "borough": "Brooklyn",
                "latitude": 40.6559,
                "longitude": -73.9452,
                "address": "451 Clarkson Ave",
                "zip_code": "11203",
                "phone": "(718) 245-3131",
                "specialty": "Pulmonology",
                "description": "Major public hospital with dedicated pulmonary and respiratory care unit.",
                "website": "https://www.nychhc.org",
                "emergency_department": "Yes",
                "beds": 627,
                "asthma_specialists": 8
            },
            {
                "name": "Jamaica Hospital Medical Center",
                "borough": "Queens",
                "latitude": 40.6908,
                "longitude": -73.8055,
                "address": "8900 Van Wyck Expy",
                "zip_code": "11418",
                "phone": "(718) 206-6000",
                "specialty": "Emergency Care",
                "description": "Full-service community hospital with 24/7 emergency asthma care.",
                "website": "https://www.jamaicahospital.org",
                "emergency_department": "Yes",
                "beds": 424,
                "asthma_specialists": 6
            },
            {
                "name": "Montefiore Medical Center",
                "borough": "Bronx",
                "latitude": 40.8778,
                "longitude": -73.8824,
                "address": "111 E 210th St",
                "zip_code": "10467",
                "phone": "(718) 920-4321",
                "specialty": "Pediatric Asthma",
                "description": "Leading pediatric asthma program with specialized children's asthma clinic.",
                "website": "https://www.montefiore.org",
                "emergency_department": "Yes",
                "beds": 1527,
                "asthma_specialists": 20
            },
            {
                "name": "Staten Island University Hospital",
                "borough": "Staten Island",
                "latitude": 40.6015,
                "longitude": -74.0759,
                "address": "475 Seaview Ave",
                "zip_code": "10305",
                "phone": "(718) 226-9000",
                "specialty": "Asthma Clinic",
                "description": "Community hospital with dedicated asthma management program.",
                "website": "https://www.siuh.edu",
                "emergency_department": "Yes",
                "beds": 714,
                "asthma_specialists": 5
            },
            {
                "name": "NYU Langone Health",
                "borough": "Manhattan",
                "latitude": 40.7431,
                "longitude": -73.9785,
                "address": "550 1st Ave",
                "zip_code": "10016",
                "phone": "(212) 263-7300",
                "specialty": "Allergy",
                "description": "Comprehensive allergy and immunology center with asthma specialists.",
                "website": "https://nyulangone.org",
                "emergency_department": "Yes",
                "beds": 1098,
                "asthma_specialists": 12
            },
            {
                "name": "NewYork-Presbyterian Hospital",
                "borough": "Manhattan",
                "latitude": 40.7648,
                "longitude": -73.9547,
                "address": "622 W 168th St",
                "zip_code": "10032",
                "phone": "(212) 305-2500",
                "specialty": "Pulmonology",
                "description": "Academic medical center with advanced pulmonary and critical care.",
                "website": "https://www.nyp.org",
                "emergency_department": "Yes",
                "beds": 2686,
                "asthma_specialists": 25
            },
            {
                "name": "Maimonides Medical Center",
                "borough": "Brooklyn",
                "latitude": 40.6376,
                "longitude": -73.9742,
                "address": "4802 10th Ave",
                "zip_code": "11219",
                "phone": "(718) 283-6000",
                "specialty": "Emergency Care",
                "description": "Community hospital serving Brooklyn with dedicated respiratory care.",
                "website": "https://www.maimonidesmed.org",
                "emergency_department": "Yes",
                "beds": 711,
                "asthma_specialists": 7
            },
        ]
        
        for hospital_data in hospitals_data:
            hospital = Hospital(**hospital_data)
            db.add(hospital)
        
        db.commit()
        print(f"Successfully seeded {len(hospitals_data)} hospitals into database!")
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding hospitals: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_hospitals()

