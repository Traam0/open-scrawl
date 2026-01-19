"""
Data Cleaning Script
Generated automatically

Configuration:
- Target Column: all
- Null Handling Strategy: rows
- Normalization: disabled
- Trim Whitespaces: true
- Remove Duplicates: true
"""

import pandas as pd
import sys
from datetime import datetime
from clean_utils import (
    remove_rows_with_nulls,
    remove_columns_with_nulls,
    fill_nulls_with_mean,
    fill_nulls_with_median,
    fill_nulls_with_mode,
    fill_nulls_with_zero,
    fill_nulls_with_custom,
    normalize_min_max_0_1,
    normalize_min_max_neg1_1,
    normalize_z_score,
    trim_whitespaces,
    remove_duplicates,
    print_statistics,
)


def clean_data(input_file: str, output_file: str):
    """
    Cleans the data according to the specified configuration.
    
    Args:
        input_file: Path to input CSV file
        output_file: Path to output CSV file
    """
    start_time = datetime.now()
    
    try:
        print("=" * 70)
        print("🧹 Data Cleaning Script - Starting")
        print("=" * 70)
        print(f"📂 Input file: {input_file}")
        print(f"📂 Output file: {output_file}")
        print()
        
        # Load data
        print("Loading data...")
        df = pd.read_csv(input_file)
        print(f"✓ Loaded {len(df)} rows, {len(df.columns)} columns")
        print(f"  Columns: {', '.join(df.columns)}")
        
        # Display initial statistics
        print_statistics(df, "Initial Data Statistics")
          #
        # Trim whitespaces
        print("\nTrimming whitespaces...")
        df = trim_whitespaces(df)
		
        # Remove duplicate rows
        print("\nRemoving duplicate rows...")
        df = remove_duplicates(df)
		
        # Handle null values (rows)
        print("\nHandling null values using strategy: rows")
        df = remove_rows_with_nulls(df, 'all')
        
        # Save cleaned data
        print("\n💾 Saving cleaned data...")
        df.to_csv(output_file, index=False)
        
        # Display final statistics
        print_statistics(df, "Final Data Statistics")
        
        # Execution time
        end_time = datetime.now()
        execution_time = (end_time - start_time).total_seconds()
        
        print("\n" + "=" * 70)
        print(f"✅ Data cleaning completed successfully!")
        print(f"⏱️  Execution time: {execution_time:.2f} seconds")
        print(f"📁 Cleaned data saved to: {output_file}")
        print("=" * 70)
        
        return len(df), execution_time
        
    except FileNotFoundError:
        print(f"\n❌ Error: Input file '{input_file}' not found")
        sys.exit(1)
    except pd.errors.EmptyDataError:
        print(f"\n❌ Error: Input file is empty")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ An error occurred: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    INPUT_FILE = "scraped_data.csv"
    OUTPUT_FILE = "clean_data.csv"
    
    clean_data(INPUT_FILE, OUTPUT_FILE)
