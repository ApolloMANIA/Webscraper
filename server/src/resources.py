import time
import sys
import os
from urllib.parse import urlparse
import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from fake_useragent import UserAgent

sys.stdout.reconfigure(encoding='utf-8')  # Ignore if not Windows (added this line cause win powershell ass and doesn't use utf-8 encoding by default)

def extract_resources(url, output_dir="resources"):
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument("--incognito")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1280,1280")
    chrome_options.add_argument("--enable-javascript")
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    chrome_options.add_argument('--disable-blink-features=AutomationControlled')

    ua = UserAgent()
    user_agent = ua.random
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    driver.execute_cdp_cmd('Network.setUserAgentOverride', {"userAgent": user_agent})

    try:
        driver.get(url)

        resources = []
        for img in driver.find_elements("tag name", "img"):
            src = img.get_attribute("src")
            if src:
                resources.append(src)

        for script in driver.find_elements("tag name", "script"):
            src = script.get_attribute("src")
            if src:
                resources.append(src)

        for link in driver.find_elements("tag name", "link"):
            rel = link.get_attribute("rel")
            href = link.get_attribute("href")
            if rel and rel.lower() == "stylesheet" and href:
                resources.append(href)

        for iframe in driver.find_elements("tag name", "iframe"):
            src = iframe.get_attribute("src")
            if src:
                resources.append(src)

        for audio in driver.find_elements("tag name", "audio"):
            src = audio.get_attribute("src")
            if src:
                resources.append(src)

        for video in driver.find_elements("tag name", "video"):
            src = video.get_attribute("src")
            if src:
                resources.append(src)

        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        for resource in resources:
            print(resource)
            try:
                parsed_url = urlparse(resource)
                filename = os.path.join(output_dir, os.path.basename(parsed_url.path))
                if filename != os.path.join(output_dir, ""):  # prevent saving an empty file if the url ends with a slash.
                    try:
                        response = requests.get(resource)
                        response.raise_for_status()  # Raise HTTPError for bad responses (4xx or 5xx)
                        with open(filename, "wb") as f:
                            f.write(response.content)

                    except requests.exceptions.RequestException as e:
                        print(f"Error downloading {resource}: {e}")

            except Exception as e:
                print(f"Error processing resource {resource}: {e}")

    except Exception as e:
        print(f"An error occurred: {e}")

    finally:
        if 'driver' in locals():
            driver.quit()  # Close the browser

if __name__ == "__main__":
    url = input("Enter the URL: ")  # Get the url from the user.
    extract_resources(url)