import time
import random
import requests
import json
import os
from urllib.parse import urlparse
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from fake_useragent import UserAgent
from selenium_stealth import stealth

def extract_data_stealth(url, output_dir="extracted_data"):
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--incognito")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--enable-javascript")
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    chrome_options.add_argument('--disable-blink-features=AutomationControlled')

    ua = UserAgent()
    user_agent = ua.random

    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)

    stealth(driver,
            languages=["en-US", "en"],
            vendor="Google Inc.",
            platform="Win32",
            webgl_vendor="Intel Inc.",
            renderer="Intel Iris OpenGL Engine",
            fix_hairline=True,
            )

    driver.execute_cdp_cmd('Network.setUserAgentOverride', {"userAgent": user_agent})

    try:
        driver.get(url)
        time.sleep(random.uniform(3, 7))  # Simulate human-like delay

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

        # Extract Structured Data (JSON-LD)
        structured_data_scripts = soup.find_all('script', type='application/ld+json')
        structured_data = []
        for script in structured_data_scripts:
            try:
                structured_data.append(json.loads(script.string))
            except (json.JSONDecodeError, TypeError):
                print("Error parsing JSON-LD data.")
        extracted_data["structured_data"] = structured_data

        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        filename = os.path.join(output_dir, "extracted_data.json")
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(extracted_data, f, ensure_ascii=False, indent=4)

        print(f"Extracted data saved to {filename}")

    except Exception as e:
        print(f"An error occurred: {e}")

    finally:
        if 'driver' in locals():
            driver.quit()

if __name__ == "__main__":
    url = input("Enter the URL: ")
    extract_data_stealth(url)