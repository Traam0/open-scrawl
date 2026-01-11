import requests
from bs4 import BeautifulSoup
import time
from typing import List, Dict, Optional
from urllib.parse import urljoin, urlparse

def fetch_page(url: str, timeout: int = 30, retries: int = 3) -> Optional[BeautifulSoup]:
    """
    Fetches a web page and returns a BeautifulSoup object.
    
    Args:
        url: Target URL to fetch
        timeout: Request timeout in seconds
        retries: Number of retry attempts
        
    Returns:
        BeautifulSoup object or None if failed
    """
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    for attempt in range(retries):
        try:
            print(f"Fetching: {url} (attempt {attempt + 1}/{retries})")
            response = requests.get(url, headers=headers, timeout=timeout)
            response.raise_for_status()
            return BeautifulSoup(response.content, 'html.parser')
        except requests.exceptions.RequestException as e:
            print(f"Error fetching {url}: {e}")
            if attempt < retries - 1:
                wait_time = 2 ** attempt  # Exponential backoff
                print(f"Retrying in {wait_time} seconds...")
                time.sleep(wait_time)
            else:
                print(f"Failed to fetch {url} after {retries} attempts")
                return None


def extract_text(element, selector: str) -> str:
    """
    Extracts text content from an element using a CSS selector.
    
    Args:
        element: BeautifulSoup element to search within
        selector: CSS selector string
        
    Returns:
        Extracted text or empty string if not found
    """
    try:
        found = element.select_one(selector)
        return found.get_text(strip=True) if found else ''
    except Exception as e:
        print(f"Error extracting text with selector '{selector}': {e}")
        return ''


def extract_attribute(element, selector: str, attribute: str) -> str:
    """
    Extracts an attribute value from an element using a CSS selector.
    
    Args:
        element: BeautifulSoup element to search within
        selector: CSS selector string
        attribute: Attribute name to extract (e.g., 'href', 'src')
        
    Returns:
        Attribute value or empty string if not found
    """
    try:
        found = element.select_one(selector)
        if found and found.has_attr(attribute):
            return found[attribute]
        return ''
    except Exception as e:
        print(f"Error extracting attribute '{attribute}' with selector '{selector}': {e}")
        return ''


def extract_html(element, selector: str) -> str:
    """
    Extracts raw HTML content from an element using a CSS selector.
    
    Args:
        element: BeautifulSoup element to search within
        selector: CSS selector string
        
    Returns:
        HTML content or empty string if not found
    """
    try:
        found = element.select_one(selector)
        return str(found) if found else ''
    except Exception as e:
        print(f"Error extracting HTML with selector '{selector}': {e}")
        return ''


def find_containers(soup: BeautifulSoup, container_selector: str) -> List:
    """
    Finds all container elements matching the selector.
    
    Args:
        soup: BeautifulSoup object
        container_selector: CSS selector for containers
        
    Returns:
        List of matching elements
    """
    try:
        containers = soup.select(container_selector)
        print(f"Found {len(containers)} containers with selector: {container_selector}")
        return containers
    except Exception as e:
        print(f"Error finding containers with selector '{container_selector}': {e}")
        return []


def generate_pagination_urls(template: str, start_page: int, end_page: int) -> List[str]:
    """
    Generates a list of URLs based on a pagination template.
    
    Args:
        template: URL template with {page} placeholder (e.g., "example.com/products?page={page}")
        start_page: Starting page number
        end_page: Ending page number (inclusive)
        
    Returns:
        List of formatted URLs
    """
    urls = []
    for page_num in range(start_page, end_page + 1):
        url = template.replace('{page}', str(page_num))
        urls.append(url)
    return urls


def scrape_items(soup: BeautifulSoup, container_selector: str, field_extractors: Dict) -> List[Dict]:
    """
    Scrapes items from a page using the provided configuration.
    
    Args:
        soup: BeautifulSoup object of the page
        container_selector: CSS selector for item containers
        field_extractors: Dict mapping field names to extractor configs
                         Format: {'field_name': {'selector': '...', 'type': 'text|attribute|html', 'attribute': '...'}}
        
    Returns:
        List of dictionaries containing extracted data
    """
    data = []
    containers = find_containers(soup, container_selector)
    
    if not containers:
        print("Warning: No containers found")
        return data
    
    for idx, item in enumerate(containers, 1):
        try:
            row = {}
            for field_name, config in field_extractors.items():
                selector = config['selector']
                extractor_type = config.get('type', 'text')
                
                if extractor_type == 'text':
                    row[field_name] = extract_text(item, selector)
                elif extractor_type == 'attribute':
                    attribute = config.get('attribute', 'href')
                    row[field_name] = extract_attribute(item, selector, attribute)
                elif extractor_type == 'html':
                    row[field_name] = extract_html(item, selector)
                else:
                    row[field_name] = extract_text(item, selector)
            
            data.append(row)
            
        except Exception as e:
            print(f"Error processing item {idx}: {e}")
            continue
    
    print(f"Successfully extracted {len(data)} items")
    return data