import csv
from typing import List, Dict

def save_to_csv(data: List[Dict], fieldnames: List[str], output_file: str) -> bool:
    """
    Saves data to a CSV file.
    
    Args:
        data: List of dictionaries to save
        fieldnames: List of column names
        output_file: Output CSV filename
        
    Returns:
        True if successful, False otherwise
    """
    if not data:
        print("No data to save")
        return False
    
    try:
        with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(data)
        
        print(f"✓ Successfully saved {len(data)} items to {output_file}")
        return True
        
    except Exception as e:
        print(f"Error saving to CSV: {e}")
        return False


def append_to_csv(data: List[Dict], fieldnames: List[str], output_file: str) -> bool:
    """
    Appends data to an existing CSV file or creates a new one.
    
    Args:
        data: List of dictionaries to append
        fieldnames: List of column names
        output_file: Output CSV filename
        
    Returns:
        True if successful, False otherwise
    """
    if not data:
        return False
    
    try:
        # Check if file exists to determine if we need to write headers
        import os
        file_exists = os.path.isfile(output_file)
        
        with open(output_file, 'a', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            if not file_exists:
                writer.writeheader()
            
            writer.writerows(data)
        
        print(f"✓ Appended {len(data)} items to {output_file}")
        return True
        
    except Exception as e:
        print(f"Error appending to CSV: {e}")
        return False