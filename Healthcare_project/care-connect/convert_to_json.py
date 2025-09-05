import csv
import json

def convert_csv_to_json():
    try:
        # Read the CSV file
        hospitals = []
        with open('hospital_data.csv', 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            
            # Convert each row to a dictionary
            for row in reader:
                try:
                    hospital = {
                        "hospital_id": row['id'],
                        "city": row['City'],
                        "state": row['State'],
                        "district": row['District'],
                        "density": float(row['Density']),
                        "location": {
                            "latitude": float(row['Latitude']),
                            "longitude": float(row['Longitude'])
                        },
                        "rating": float(row['Rating']),
                        "review_count": int(row['Number of Reviews'])
                    }
                    hospitals.append(hospital)
                except Exception as e:
                    print(f"Error processing row: {row}")
                    print(f"Error details: {str(e)}")
                    continue
        
        # Create the final JSON structure
        json_data = {
            "hospitals": hospitals,
            "total_count": len(hospitals)
        }
        
        # Write to JSON file
        with open('hospital_data.json', 'w', encoding='utf-8') as f:
            json.dump(json_data, f, indent=4, ensure_ascii=False)
            
        print(f"Successfully converted {len(hospitals)} records to JSON")
        
    except Exception as e:
        print(f"Error occurred: {str(e)}")

if __name__ == "__main__":
    convert_csv_to_json()
