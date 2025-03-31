import sys, requests
from bs4 import BeautifulSoup

url = sys.argv[1]
response = requests.get(url)

soup = BeautifulSoup(response.text, "lxml")

divs = soup.find_all("div")
for div in divs:
    print(div.get_text())

sys.stdout.flush()
