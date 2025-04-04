import time
import json
import sys
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from fake_useragent import UserAgent

# Ensure proper encoding for Windows PowerShell
sys.stdout.reconfigure(encoding='utf-8')

# Function to handle line breaks properly
def normalize_line_breaks(text):
    return text.replace('\r\n', '\n').replace('\r', '\n')

# Configure Chrome options
chrome_options = Options()
chrome_options.add_argument('--headless')
chrome_options.add_argument('--disable-dev-shm-usage')
chrome_options.add_argument('--incognito')
chrome_options.add_argument('--nogpu')
chrome_options.add_argument('--disable-gpu')
chrome_options.add_argument('--window-size=1280,1280')
chrome_options.add_argument('--enable-javascript')
chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
chrome_options.add_experimental_option('useAutomationExtension', False)
chrome_options.add_argument('--disable-blink-features=AutomationControlled')

# Set up a random user agent
ua = UserAgent()
userAgent = ua.random

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
driver.execute_cdp_cmd('Network.setUserAgentOverride', {"userAgent": userAgent})

# Get URL from command line
try:
    url = sys.argv[1]
    if not url.startswith(('http://', 'https://')):
        url = f'http://{url}'  # Default to http if no protocol
except IndexError:
    print("Error: Please provide a URL as the first argument.")
    sys.exit(1)

driver.get(url)

# Parse the page source
soup = BeautifulSoup(driver.page_source, "html.parser")

# Print full HTML content with normalized line breaks
print("\n===== FULL HTML CONTENT =====\n")
print(normalize_line_breaks(soup.prettify()))

# Extracted data
data = {
    "title": soup.title.string if soup.title else None,
    "headings": [h.text.strip() for h in soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])],
    "paragraphs": [p.text.strip() for p in soup.find_all('p')],
    "lists": [[li.text.strip() for li in ul.find_all('li')] for ul in soup.find_all(['ul', 'ol'])],
    "tables": [[[td.text.strip() for td in tr.find_all('td')] for tr in table.find_all('tr')] for table in soup.find_all('table')],
    "links": [{"text": a.text.strip(), "href": a.get('href')} for a in soup.find_all('a') if a.get('href')],
    "meta_description": soup.find('meta', attrs={'name': 'description'})['content'] if soup.find('meta', attrs={'name': 'description'}) else None,
    "meta_keywords": soup.find('meta', attrs={'name': 'keywords'})['content'] if soup.find('meta', attrs={'name': 'keywords'}) else None
}

# Print extracted data
# print("\n===== EXTRACTED DATA =====\n")
# print(json.dumps(data, indent=4))

# Extract structured data
structured_data_scripts = soup.find_all('script', type='application/ld+json')
structured_data = []
for script in structured_data_scripts:
    try:
        structured_data.append(json.loads(script.string))
    except (json.JSONDecodeError, TypeError):
        print("Error parsing JSON-LD data.")

data["structured_data"] = structured_data

# Print structured data with indentation
print("\n===== STRUCTURED DATA (JSON-LD) =====\n", json.dumps(structured_data, indent=4))

# Clean up
driver.quit()
sys.stdout.flush()
