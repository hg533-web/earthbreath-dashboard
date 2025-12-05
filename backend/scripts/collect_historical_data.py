"""
Script to collect historical climate data and store in database
Run this script periodically (e.g., daily) to collect and update historical data
"""
import asyncio
import sys
import os

# Add parent directory to path to import app modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.historical_data_collector import HistoricalDataCollector

# Common NYC ZIP codes
NYC_ZIP_CODES = [
    '10001', '10002', '10003', '10004', '10005',  # Manhattan
    '11201', '11211', '11215',  # Brooklyn
    '10451', '10452', '10453',  # Bronx
    '11101', '11102',  # Queens
    '10301', '10302'   # Staten Island
]

async def main():
    """Main function to collect historical data"""
    collector = HistoricalDataCollector()
    
    print("=" * 60)
    print("Historical Climate Data Collection")
    print("=" * 60)
    
    # Collect data for all ZIP codes
    results = await collector.collect_for_multiple_zipcodes(
        zip_codes=NYC_ZIP_CODES,
        days=30
    )
    
    print("\n" + "=" * 60)
    print("Collection Results:")
    print("=" * 60)
    
    total_collected = 0
    for zip_code, count in results.items():
        print(f"ZIP {zip_code}: {count} new records")
        total_collected += count
    
    print(f"\nTotal: {total_collected} new records collected")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())

