"""
Web Scraper Script
Generated automatically from configuration
Target URL: https://www.rekrute.com/
Pagination Template: https://www.rekrute.com/fr/offres.html?s=3&p={page}
Pages: 50
Container Selector: li.post-id
Field Mappings:
  - job_url: a.titreJob (attribute[href], text)
  - job_title: a.titreJob (content, number)
  - company_name: img (attribute[title], text)
  - job_sector: div > div.col-sm-10.col-xs-12 > div > div > div:nth-child(3) > ul > li:nth-child(1) > a (content, text)
  - job_function: div > div.col-sm-10.col-xs-12 > div > div > div:nth-child(3) > ul > li:nth-child(2) > a (content, text)
  - education_level: div > div.col-sm-10.col-xs-12 > div > div > div:nth-child(3) > ul > li:nth-child(4) > a (content, text)
  - experience_level: div > div.col-sm-10.col-xs-12 > div > div > div:nth-child(3) > ul > li:nth-child(3) > a:nth-child(1) (content, text)
  - published_from: .date span:nth-of-type(1) (content, text)
  - published_to: .date span:nth-of-type(2) (content, text)
  - contract_type: div > div.col-sm-10.col-xs-12 > div > div > div:nth-child(3) > ul > li:nth-child(5) > a (content, text)
"""

from scraper_utils import fetch_page, scrape_items, generate_pagination_urls
from csv_utils import save_to_csv
import sys

# Configuration
TARGET_URL = "https://www.rekrute.com/"
PAGINATION_TEMPLATE = "https://www.rekrute.com/fr/offres.html?s=3&p={page}"
PAGES = 50
CONTAINER_SELECTOR = "li.post-id"
OUTPUT_FILE = "scraped_data.csv"

# Field extractors configuration
FIELD_EXTRACTORS = {
    'job_url': {"selector":"a.titreJob","type":"attribute","dataType":"text","attribute":"href"},
    'job_title': {"selector":"a.titreJob","type":"text","dataType":"text"},
    'company_name': {"selector":"img","type":"attribute","dataType":"text","attribute":"title"},
    'job_sector': {"selector":"div > div.col-sm-10.col-xs-12 > div > div > div:nth-child(3) > ul > li:nth-child(1) > a","type":"text","dataType":"text"},
    'job_function': {"selector":"div > div.col-sm-10.col-xs-12 > div > div > div:nth-child(3) > ul > li:nth-child(2) > a","type":"text","dataType":"text"},
    'education_level': {"selector":"div > div.col-sm-10.col-xs-12 > div > div > div:nth-child(3) > ul > li:nth-child(4) > a","type":"text","dataType":"text"},
    'experience_level': {"selector":"div > div.col-sm-10.col-xs-12 > div > div > div:nth-child(3) > ul > li:nth-child(3) > a:nth-child(1)","type":"text","dataType":"text"},
    'published_from': {"selector":".date span:nth-of-type(1)","type":"text","dataType":"text"},
    'published_to': {"selector":".date span:nth-of-type(2)","type":"text","dataType":"text"},
    'contract_type': {"selector":"div > div.col-sm-10.col-xs-12 > div > div > div:nth-child(3) > ul > li:nth-child(5) > a","type":"text","dataType":"text"}
}

FIELDNAMES = ["job_url","job_title","company_name","job_sector","job_function","education_level","experience_level","published_from","published_to","contract_type"]


def main():
    """Main scraping function"""
    print("=" * 70)
    print("Web Scraper - Starting")
    print("=" * 70)
    print(f"Target: {TARGET_URL}")
    print(f"Container: {CONTAINER_SELECTOR}")
    print(f"Fields: {', '.join(FIELDNAMES)}")
    print(f"Pages to scrape: {PAGES}")
    print("=" * 70)
    print()
    
    all_data = []
    
    
    # Generate URLs for pagination
    urls = generate_pagination_urls(PAGINATION_TEMPLATE, 1, PAGES)
    print(f"Scraping {len(urls)} pages...\n")
    
    for page_num, url in enumerate(urls, 1):
        print(f"--- Page {page_num}/{len(urls)} ---")
        
        # Fetch page
        soup = fetch_page(url)
        if not soup:
            print(f"Failed to fetch page {page_num}, skipping...\n")
            continue
        
        # Scrape items from page
        page_data = scrape_items(soup, CONTAINER_SELECTOR, FIELD_EXTRACTORS)
        all_data.extend(page_data)
        
        print(f"✓ Page {page_num}: Extracted {len(page_data)} items")
        print(f"Total items collected: {len(all_data)}\n")
        
        # Add delay between requests to be polite
        #if page_num < len(urls):
            #import time
            #print("Waiting 1 second before next page...")
            #time.sleep(1)
    
    
    # Save results to CSV
    print("=" * 70)
    if all_data:
        success = save_to_csv(all_data, FIELDNAMES, OUTPUT_FILE)
        if success:
            print(f"\nSuccessfully scraped {len(all_data)} items!")
            print(f"Data saved to: {OUTPUT_FILE}")
            
            # Display sample of scraped data
            print("\nSample of scraped data (first item):")
            for key, value in all_data[0].items():
                display_value = str(value)[:80] + '...' if len(str(value)) > 80 else str(value)
                print(f"  • {key}: {display_value}")
                
            # Show data statistics
            print(f"\nStatistics:")
            print(f"  • Total items scraped: {len(all_data)}")
            print(f"  • Fields per item: {len(FIELDNAMES)}")
            
            # Check for empty fields
            for field in FIELDNAMES:
                empty_count = sum(1 for row in all_data if not row.get(field))
                if empty_count > 0:
                    print(f"  • '{field}': {empty_count} empty values ({empty_count/len(all_data)*100:.1f}%)")
        else:
            print("\nFailed to save data to CSV")
            sys.exit(1)
    else:
        print("\nNo data was extracted. Check your selectors.")
        print("\nTroubleshooting tips:")
        print("  1. Verify the container selector matches elements on the page")
        print("  2. Check that field selectors are relative to the container")
        print("  3. Inspect the page HTML to confirm element structure")
        print("  4. Try the scraper on a simpler page first")
        sys.exit(1)
    
    print("=" * 70)
    print("Scraper finished")
    print("=" * 70)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nScraping interrupted by user")
        sys.exit(0)
    except Exception as e:
        print(f"\nAn unexpected error occurred: {e}")
        import traceback
        print("\nFull traceback:")
        traceback.print_exc()
        sys.exit(1)
