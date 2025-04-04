import sys
import requests
from bs4 import BeautifulSoup

# Check if the script has received an argument
if len(sys.argv) != 2:
    print("Usage: python script.py <url>")
    sys.exit(1)

# Get the URL from the command-line argument
url = sys.argv[1]

# Send a GET request to the URL
response = requests.get(url)

# Check if the request was successful
if response.status_code == 200:
    # Parse the content of the page
    soup = BeautifulSoup(response.content, 'html.parser')

    # Find all anchor tags (links)
    links = soup.find_all('a')

    # Print out each link
    for link in links:
        href = link.get('href')
        if href:  # Only print valid links
            print(f"Link: {href}")
else:
    print(f"Failed to retrieve the webpage. Status code: {response.status_code}")

