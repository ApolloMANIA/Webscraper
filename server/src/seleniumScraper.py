import time
import json
import sys
sys.stdout.reconfigure(encoding='utf-8') #ignore if not windows (added this line cause win powershell ass and doesn't use utf-8 encoding by default)
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common import service
from webdriver_manager.chrome import ChromeDriverManager
from fake_useragent import UserAgent


chrome_options = Options()
# chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--headless')
chrome_options.add_argument('--disable-dev-shm-usage')
chrome_options.add_argument('--headless')
chrome_options.add_argument("--incognito")
chrome_options.add_argument("--nogpu")
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--window-size=1280,1280")
chrome_options.add_argument("--enable-javascript")
chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
chrome_options.add_experimental_option('useAutomationExtension', False)
chrome_options.add_argument('--disable-blink-features=AutomationControlled')

ua = UserAgent()
userAgent = ua.random
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
driver.execute_cdp_cmd('Network.setUserAgentOverride', {"userAgent": userAgent})

url = sys.argv[1]
className = sys.argv[2]

driver.get(url)


soup = BeautifulSoup(driver.page_source, "html.parser")

extracted_data = {}

# Extract Textual Content
extracted_data["title"] = soup.title.string if soup.title else None
extracted_data["headings"] = [h.text.strip() for h in soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])]
extracted_data["paragraphs"] = [p.text.strip() for p in soup.find_all('p')]
extracted_data["lists"] = [[li.text.strip() for li in ul.find_all('li')] for ul in soup.find_all(['ul', 'ol'])]
extracted_data["tables"] = [[ [td.text.strip() for td in tr.find_all('td')] for tr in table.find_all('tr')] for table in soup.find_all('table')]
extracted_data["links"] = [{"text": a.text.strip(), "href": a.get('href')} for a in soup.find_all('a') if a.get('href')]
extracted_data["meta_description"] = soup.find('meta', attrs={'name': 'description'})['content'] if soup.find('meta', attrs={'name': 'description'}) else None
extracted_data["meta_keywords"] = soup.find('meta', attrs={'name': 'keywords'})['content'] if soup.find('meta', attrs={'name': 'keywords'}) else None

print(extracted_data["headings"])
structured_data_scripts = soup.find_all('script', type='application/ld+json')
structured_data = []
for script in structured_data_scripts:
    try:
        structured_data.append(json.loads(script.string))
    except (json.JSONDecodeError, TypeError):
        print("Error parsing JSON-LD data.")
extracted_data["structured_data"] = structured_data

print (structured_data)

time.sleep(20)
driver.quit()

sys.stdout.flush()
